"""
PackWise Risk Prediction Engine — Inference Engine
=====================================================
Implements the four sub-processes from DFD Level 2 (decomposition of
Process 5.4 Inference Engine):

    5.4.1  Match Rules to Features   -> match_rules()
    5.4.2  Calculate Risk Scores     -> calculate_scores()
    5.4.3  Generate Explanation Trace-> generate_explanations()
    5.4.4  Aggregate & Rank Risks    -> aggregate()

predict() ties these together and also plays the role of DFD Level 1
Process 5.5 (Generate Risk Report) for convenience in this v1 module.
"""

from .models import (
    ProductFeatures, Rule, MatchedRule, CategoryResult, RiskReport, RiskCategory,
    BodyRegion, AccessoryItem, AccessoryRetention,
)
from .rules import RULES

# Tunable constants — v1 defaults, NOT yet calibrated against real test data.
# Multiply the summed severity score by this factor to get a 0-100 risk %.
SEVERITY_TO_PERCENT_FACTOR = 12
RISK_LEVEL_THRESHOLDS = {"Low": 30, "Medium": 60}  # upper bounds; >60 = High

# Body-region base severity weights (1-3), reflecting how anatomically
# vulnerable each region is per the RPKB's anatomical risk mapping (Phase 1A
# "structural risk mapping" table) and E016-E020 (Yang et al. 2023):
#   Head:  cervical neck joint peg carries the highest concentrated mass and
#          is a documented fracture/detachment failure point -> 3
#   Waist: primary pelvic/harness retention zone, tensile strap-failure
#          evidence -> 3
#   Arms:  elbow/wrist hinges are thin cross-section pins, moderate risk -> 2
#   Legs:  NOT directly evidenced in the current RPKB (flagged gap) — legs
#          usually rest on a base tray/insert rather than a strap, so treated
#          as lower baseline risk pending literature -> 1
REGION_BASE_WEIGHT = {
    BodyRegion.HEAD: 3,
    BodyRegion.WAIST: 3,
    BodyRegion.ARMS: 2,
    BodyRegion.LEGS: 1,
}
_MAX_REGION_WEIGHT = max(REGION_BASE_WEIGHT.values())


def match_rules(features: ProductFeatures, rules: list[Rule] = RULES) -> list[MatchedRule]:
    """5.4.1 — Match Rules to Features."""
    matched = []
    for rule in rules:
        try:
            if rule.condition(features):
                matched.append(MatchedRule(rule=rule, explanation=""))
        except Exception as e:
            # A malformed rule / missing feature should not crash the whole
            # engine — log and skip so one bad rule doesn't block a report.
            print(f"[WARN] Rule {rule.rule_id} raised {e!r} and was skipped.")
    return matched


def predict_movement_risk_by_region(features: ProductFeatures) -> dict[BodyRegion, dict]:
    """
    Per-body-region Movement Risk breakdown (separate from the aggregate
    Movement Risk score in CategoryResult).

    Formula: risk_pct = (base_weight[region] / max_weight) * (1 - coverage[region]) * 100

    This is intentionally simple and coverage-driven (rather than a full
    per-region physics model, which the current RPKB doesn't have evidence
    to support) — it says "a region's risk is high when it is BOTH
    anatomically vulnerable (per RPKB) AND currently under-supported by the
    attachment plan". It does not yet fold in mass_offset_mm at the
    per-region level because we don't have CV data on which specific region
    carries a given CoG offset — that's a flagged future improvement.
    """
    results = {}
    for region, base_weight in REGION_BASE_WEIGHT.items():
        coverage = features.body_region_coverage.get(region, 0.5)
        pct = min(100.0, (base_weight / _MAX_REGION_WEIGHT) * (1 - coverage) * 100)
        results[region] = {
            "risk_percentage": round(pct, 1),
            "risk_level": _risk_level(pct),
            "coverage": coverage,
            "explanation": (
                f"{region.value}: {coverage:.0%} attachment coverage, anatomical base weight "
                f"{base_weight}/{_MAX_REGION_WEIGHT} (RPKB Phase 1A anatomical risk mapping)."
            ),
        }
    return results


def predict_accessory_loss_by_item(features: ProductFeatures) -> list[dict]:
    """
    Per-accessory Accessory Loss Risk breakdown.

    Base risk is much higher for unsecured items; an extra penalty applies
    to unsecured items under 5g, since very light parts are more prone to
    vibration-induced escape from blister/cavity gaps (packaging engineering
    principle consistent with the drop-test/vibration literature reviewed in
    Phase 1A-1B, though the specific 5g threshold is a curator estimate
    pending a dedicated citation — flagged as Medium confidence).
    """
    results = []
    for item in features.accessories:
        if item.retention_type != AccessoryRetention.NONE:
            base = 5.0
            reason = f"Secured via {item.retention_type.value}."
        else:
            base = 40.0
            reason = "No No retention mechanism specified."
            if item.weight_g < 5.0:
                base += 30.0
                reason += f" Weight ({item.weight_g:.1f}g) is under 5g — higher vibration-escape risk."
        pct = min(100.0, base)
        results.append({
            "name": item.name,
            "weight_g": item.weight_g,
            "loss_probability": round(pct, 1),
            "risk_level": _risk_level(pct),
            "explanation": reason,
        })
    return results


def generate_explanations(matched: list[MatchedRule], features: ProductFeatures) -> list[MatchedRule]:
    """5.4.3 — Generate Explanation Trace (filled in per matched rule)."""
    from enum import Enum
    feat_dict = {
        k: (v.value if isinstance(v, Enum) else v)
        for k, v in features.__dict__.items()
    }
    for m in matched:
        try:
            m.explanation = m.rule.explanation_template.format(**feat_dict)
        except Exception:
            m.explanation = m.rule.description  # fallback if template formatting fails
    return matched


def calculate_scores(matched: list[MatchedRule]) -> dict[RiskCategory, int]:
    """5.4.2 — Calculate Risk Scores (raw severity sums per category)."""
    sums: dict[RiskCategory, int] = {cat: 0 for cat in RiskCategory}
    for m in matched:
        sums[m.rule.category] += m.rule.severity
    return sums


def _risk_level(pct: float) -> str:
    if pct <= RISK_LEVEL_THRESHOLDS["Low"]:
        return "Low"
    if pct <= RISK_LEVEL_THRESHOLDS["Medium"]:
        return "Medium"
    return "High"


def aggregate(matched: list[MatchedRule], severity_sums: dict[RiskCategory, int]) -> dict[RiskCategory, CategoryResult]:
    """5.4.4 — Aggregate & Rank Risks into a per-category CategoryResult."""
    results: dict[RiskCategory, CategoryResult] = {}
    for category in RiskCategory:
        cat_rules = [m for m in matched if m.rule.category == category]
        raw = severity_sums[category]
        pct = min(100.0, raw * SEVERITY_TO_PERCENT_FACTOR)
        level = _risk_level(pct)
        result = CategoryResult(
            category=category,
            matched_rules=cat_rules,
            raw_severity_sum=raw,
            risk_percentage=pct,
            risk_level=level,
        )
        if category == RiskCategory.DROP_TEST:
            result.pass_probability = round(100.0 - pct, 1)
        results[category] = result
    return results


def predict(features: ProductFeatures) -> RiskReport:
    """
    Full pipeline: DFD 5.1 (features already loaded by caller) -> 5.4.1-5.4.4
    -> 5.5 (this function's return value IS the risk report).
    """
    matched = match_rules(features)
    matched = generate_explanations(matched, features)
    severity_sums = calculate_scores(matched)
    category_results = aggregate(matched, severity_sums)

    region_breakdown = predict_movement_risk_by_region(features)
    accessory_breakdown = predict_accessory_loss_by_item(features)

    # Accessory Loss Risk is now driven entirely by the per-item breakdown
    # (no aggregate Rule objects populate this category anymore — see
    # rules.py). Sync the category-level summary to match: use the worst
    # (max) per-item probability as the category's headline risk, since one
    # badly-secured accessory is enough to justify flagging the category.
    if accessory_breakdown:
        worst = max(accessory_breakdown, key=lambda a: a["loss_probability"])
        al_result = category_results[RiskCategory.ACCESSORY_LOSS]
        al_result.risk_percentage = worst["loss_probability"]
        al_result.risk_level = worst["risk_level"]

    overall_pct = max(r.risk_percentage for r in category_results.values())
    overall_level = _risk_level(overall_pct)

    trace = []
    for category, result in category_results.items():
        if result.matched_rules:
            trace.append(f"--- {category.value} ({result.risk_level}, {result.risk_percentage:.0f}%) ---")
            for m in result.matched_rules:
                trace.append(f"[{m.rule.rule_id} / {m.rule.evidence_id}] {m.explanation}")
    if accessory_breakdown:
        trace.append(f"--- {RiskCategory.ACCESSORY_LOSS.value}: per-item breakdown ---")
        for item in accessory_breakdown:
            trace.append(f"[{item['name']}] {item['loss_probability']}% ({item['risk_level']}) — {item['explanation']}")

    return RiskReport(
        results=category_results,
        overall_risk_level=overall_level,
        explanation_trace=trace,
        movement_by_region=region_breakdown,
        accessory_loss_by_item=accessory_breakdown,
    )
