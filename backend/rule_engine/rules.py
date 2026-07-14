"""
PackWise Risk Prediction Engine — Rule Definitions
=====================================================
v2 — pruned to match confirmed project scope: NO physical packaging-
construction fields (box thickness, cushion density/thickness, clearance,
housing material, fastener ductility). Only product/pose/accessory features
that actually exist in the team's dataset are used.

Each Rule is traceable to an RPKB evidence row where possible. Rules that
required removed fields (box/cushion construction) have been dropped from
this version — see git history / earlier delivered files if the team
decides packaging-construction detail comes back into scope later.
"""

from .models import Rule, RiskCategory, ProductFeatures, FragilityClass, BodyRegion


RULES: list[Rule] = [

    # ---------------------------------------------------------------
    # DROP TEST RISK  (now inferred indirectly — no box/cushion data available)
    # ---------------------------------------------------------------

    Rule(
        rule_id="R-DT-009", evidence_id="E002_E017", category=RiskCategory.DROP_TEST,
        description="Too few support/attachment points for an articulated, fragile product",
        condition=lambda f: f.support_points < 2 and f.product_fragility in (FragilityClass.MEDIUM, FragilityClass.HIGH),
        severity=3,
        explanation_template=(
            "Only {support_points} support point(s) detected for a {product_fragility} fragility "
            "product; fewer attachment points concentrate contact stress and allow more internal "
            "movement during drops (cushion pattern / support distribution evidence, Hammou et al. "
            "2012; Yang et al. 2023)."
        ),
        source_reference="Hammou et al. 2012; Yang et al. 2023",
        confidence="Medium",
    ),
    Rule(
        rule_id="R-DT-011", evidence_id="E001_E033-inferred", category=RiskCategory.DROP_TEST,
        description="High product mass with low stability index — drop survival concern",
        condition=lambda f: f.product_mass_kg > 0.13 and f.stability_index < 5.0,
        severity=2,
        explanation_template=(
            "Product mass is {product_mass_kg}kg with a low stability index ({stability_index}); "
            "heavier, less-stable products transmit more kinetic energy on impact and are more "
            "prone to tipping/rotating on drop (general drop-test mechanics, Hammou et al. 2012 — "
            "NOTE: without box/cushion data this is a coarse proxy, not a direct RPKB rule "
            "translation)."
        ),
        source_reference="Hammou et al. 2012 (indirect proxy — construction detail unavailable)",
        confidence="Low",
    ),

    # ---------------------------------------------------------------
    # MOVEMENT RISK
    # ---------------------------------------------------------------

    Rule(
        rule_id="R-MV-001", evidence_id="E016", category=RiskCategory.MOVEMENT,
        description="Significant center-of-gravity offset couples vertical vibration into rocking",
        condition=lambda f: f.mass_offset_mm > 10.0,
        severity=2,
        explanation_template=(
            "Center-of-gravity offset is {mass_offset_mm}mm (above the 10mm threshold); this "
            "couples vertical transport vibration into pitching/rotational motion, amplifying "
            "displacement at the package extremities (Yang, Li, Sun, Cai, Zhou & Zhong 2023)."
        ),
        source_reference="Yang et al. 2023, Applied Sciences 13(15)",
        confidence="High",
    ),
    Rule(
        rule_id="R-MV-005", evidence_id="E002", category=RiskCategory.MOVEMENT,
        description="Very few support points combined with an off-center mass",
        condition=lambda f: f.support_points < 2 and f.mass_offset_mm > 10.0,
        severity=3,
        explanation_template=(
            "Only {support_points} support point(s) with a {mass_offset_mm}mm mass offset; "
            "insufficient support combined with an unbalanced load compounds rocking/pitching risk "
            "beyond what either factor alone would cause (Yang et al. 2023)."
        ),
        source_reference="Yang et al. 2023, Applied Sciences 13(15)",
        confidence="Medium",
    ),
    Rule(
        rule_id="R-MV-006", evidence_id="pose-derived", category=RiskCategory.MOVEMENT,
        description="High-movement pose (e.g. Arms Open, Walking) without adequate support",
        condition=lambda f: f.pose_movement_score >= 6.0 and f.support_points < 3,
        severity=2,
        explanation_template=(
            "Pose movement score is {pose_movement_score} (high) with only {support_points} "
            "support point(s); dynamic/open poses have more limbs extended away from the body's "
            "main mass, giving vibration more leverage to move them (pose-derived proxy, "
            "consistent with the anatomical risk mapping in Phase 1A)."
        ),
        source_reference="Phase 1A anatomical risk mapping (pose-derived proxy)",
        confidence="Low",
    ),
    Rule(
        rule_id="R-MV-007", evidence_id="complexity-derived", category=RiskCategory.MOVEMENT,
        description="High packaging complexity score with low overall support",
        condition=lambda f: f.complexity_score >= 7.0 and f.support_points < 3,
        severity=1,
        explanation_template=(
            "Complexity score is {complexity_score}/10 with only {support_points} support "
            "point(s); more complex products (more articulation points, accessories, geometry) "
            "generally need proportionally more attachment points to stay stable in transit."
        ),
        source_reference="General packaging engineering principle (not yet a specific RPKB citation)",
        confidence="Low",
    ),

    # NOTE — Accessory Loss Risk is computed PER-ITEM in engine.py
    # (predict_accessory_loss_by_item), not via aggregate Rule objects here.
]
