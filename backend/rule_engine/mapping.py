"""
PackWise Risk Prediction Engine — Dataset Mapping
====================================================
Bridges the team's actual product dataset (packaging_dataset.csv /
Salinan_Engineering_Database.xlsx) into the ProductFeatures input contract.

v2 — updated after the team confirmed physical packaging-construction
fields (box thickness, cushion, clearance) are OUT OF SCOPE. Also corrected
support_points: the flat CSV has no "current_*_strap" (CV-detected) columns,
only "recommended_*_strap" columns. Per the original DFD design, the Risk
Prediction Engine (5.0) evaluates the Packaging Recommendation Engine's
(3.0) OUTPUT — so using recommended_*_strap as support_points is the
correct interpretation, not a workaround: we are evaluating drop/movement
risk FOR the proposed attachment plan.
"""

from .models import ProductFeatures, FragilityClass, AccessoryItem, AccessoryRetention, BodyRegion


def fragility_score_to_class(score: float) -> FragilityClass:
    """
    Dataset's fragility_score is 0-11 (observed range in packaging_dataset.csv).
    Bucketed into 3 classes using tertiles of the observed range as a starting
    point — NOT statistically validated against real breakage data yet.
    """
    if score <= 3:
        return FragilityClass.LOW
    elif score <= 7:
        return FragilityClass.MEDIUM
    else:
        return FragilityClass.HIGH


def cog_category_to_offset_mm(center_of_gravity: str, height_cm: float) -> float:
    """
    Converts the dataset's categorical center_of_gravity ('Center', 'Back',
    'Left', presumably also 'Right'/'Front') into an estimated numeric
    offset in mm, which is what the RPKB-grounded movement-risk rules
    (E016-E020, from Yang et al. 2023) actually need.

    Reasoning:
    - 'Center' means no meaningful eccentricity by definition -> small
      residual offset only (manufacturing/pose tolerance), set to 5mm.
    - Any off-center direction (Back/Front/Left/Right) is estimated as 5% of
      the doll's standing height. For a ~29-30cm doll (this dataset's range),
      that's ~14.5-15mm.
    - This 5% figure is a deliberate curator estimate chosen so it straddles
      the empirically-derived 10mm threshold in RPKB evidence E016 (Yang et
      al. 2023) — meaning an off-center pose will actually be able to trigger
      that literature-grounded rule, while a centered pose won't.
    - width_cm/depth_cm would give a more precise, direction-aware estimate,
      but those columns aren't present in the current flat CSV.
    """
    if center_of_gravity == "Center":
        return 5.0
    return round(height_cm * 10 * 0.05, 1)  # cm -> mm, 5% of height


def compute_support_points(row: dict) -> int:
    """
    Sums the RECOMMENDED strap counts across all attachment locations
    (recommended_head_strap, recommended_waist_strap, recommended_hand_strap,
    recommended_leg_strap) — this is the proposed attachment plan from the
    Recommendation Engine (Process 3.0), which is exactly what the Risk
    Prediction Engine (5.0) is supposed to evaluate per the original DFD.
    """
    return int(
        row.get("recommended_head_strap", 0)
        + row.get("recommended_waist_strap", 0)
        + row.get("recommended_hand_strap", 0)
        + row.get("recommended_leg_strap", 0)
    )


def build_accessories(accessory_count: int, total_accessory_weight_g: float,
                       accessory_names: list[str] = None,
                       accessory_master: dict[str, dict] = None) -> list[AccessoryItem]:
    """
    Builds AccessoryItem list. packaging_dataset.csv only gives aggregate
    accessory_count + accessory_weight_g per row (not which specific named
    accessories), so without a join to a per-product accessory list, this
    falls back to splitting the total weight evenly across accessory_count
    generic items and marking them all as unsecured (worst-case / most
    conservative assumption) unless accessory_master / accessory_names is
    supplied for a real per-item join (e.g. against Accessory_Master).
    """
    if accessory_names and accessory_master:
        items = []
        for name in accessory_names:
            info = accessory_master.get(name, {})
            items.append(AccessoryItem(
                name=name,
                weight_g=info.get("weight_g", total_accessory_weight_g / max(1, accessory_count)),
                retention_type=AccessoryRetention.NONE,  # actual retention needs Attachment Planner output
                fragility=info.get("fragility"),
            ))
        return items

    if accessory_count <= 0:
        return []
    avg_weight = total_accessory_weight_g / accessory_count
    return [
        AccessoryItem(name=f"Accessory_{i+1}", weight_g=avg_weight, retention_type=AccessoryRetention.NONE)
        for i in range(accessory_count)
    ]


def row_to_product_features(row: dict) -> ProductFeatures:
    """
    Converts one packaging_dataset.csv row (as a dict) into ProductFeatures.
    v2 — no packaging-construction args anymore (out of scope).
    """
    support_points = compute_support_points(row)
    coverage_flag = lambda n: 1.0 if n > 0 else 0.2
    return ProductFeatures(
        product_mass_kg=row["product_weight_g"] / 1000.0,
        product_fragility=fragility_score_to_class(row["fragility_score"]),
        mass_offset_mm=cog_category_to_offset_mm(row["center_of_gravity"], row["height_cm"]),
        accessories=build_accessories(row["accessory_count"], row["accessory_weight_g"]),
        support_points=support_points,
        pose_movement_score=row.get("movement_score", 0.0),
        complexity_score=row.get("complexity_score", 0.0),
        stability_index=row.get("stability_index", 0.0),
        body_region_coverage={
            BodyRegion.HEAD: coverage_flag(row.get("recommended_head_strap", 0)),
            BodyRegion.WAIST: coverage_flag(row.get("recommended_waist_strap", 0)),
            BodyRegion.ARMS: coverage_flag(row.get("recommended_hand_strap", 0)),
            BodyRegion.LEGS: coverage_flag(row.get("recommended_leg_strap", 0)),
        },
    )
