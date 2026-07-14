"""
PackWise Risk Prediction Engine — Data Models
================================================
Defines the input feature schema (what the CV + Packaging Recommendation +
Packaging Feature Generator stages hand off to the Risk Prediction Engine),
and the internal Rule / MatchedRule / RiskResult structures used by the
inference engine.

This corresponds to DFD Level 1, Process 5.1 (Load Product & Packaging
Features) input contract.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Optional


class RiskCategory(str, Enum):
    DROP_TEST = "Drop Test Risk"
    MOVEMENT = "Movement Risk"
    ACCESSORY_LOSS = "Accessory Loss Risk"


class FragilityClass(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class AccessoryRetention(str, Enum):
    NONE = "None"
    THERMOFORM_CAVITY = "Thermoform_Cavity"
    TWIST_TIE = "Twist_Tie"
    SNAP_FIT_LOCK = "Snap_Fit_Lock"


class BodyRegion(str, Enum):
    HEAD = "Head"
    WAIST = "Waist"
    ARMS = "Arms"
    LEGS = "Legs"


@dataclass
class AccessoryItem:
    """One removable accessory, as sourced from Accessory_Master / packaging_dataset.csv."""
    name: str
    weight_g: float
    retention_type: AccessoryRetention = AccessoryRetention.NONE
    fragility: Optional[float] = None  # 1-5 scale, from Accessory_Master if available


@dataclass
class ProductFeatures:
    """
    Input contract for the Risk Prediction Engine (DFD 5.1).

    SCOPE UPDATE: the team confirmed physical packaging-construction
    engineering (box thickness, cushion density/thickness, clearance,
    housing material, fastener ductility, window cutout ratio, shipping
    temperature range) is OUT OF SCOPE for this project. Those fields have
    been removed. The engine now works purely from product/pose/accessory
    features that actually exist in the team's dataset
    (packaging_dataset.csv / Salinan_Engineering_Database.xlsx).

    This does shrink what Drop Test Risk can meaningfully evaluate — most of
    the box/cushion RPKB evidence (Phase 1A-1B) is no longer usable input,
    since the system will never receive those values. Drop Test Risk is now
    inferred indirectly via support_points, fragility, and mass — a real,
    but noticeably thinner, evidence base. Flagged for discussion if the
    team wants Drop Test Risk to carry more weight later.
    """

    # --- CV-derived product features ---
    product_mass_kg: float
    product_fragility: FragilityClass
    mass_offset_mm: float = 0.0          # center-of-gravity eccentricity (see mapping.py)
    accessories: list[AccessoryItem] = field(default_factory=list)
    support_points: int = 0              # sum of current_head/waist/hand/leg_strap counts (CV-detected)

    # --- Pose / product-level scores (from dataset: Pose_Master, Product_Master) ---
    pose_movement_score: float = 0.0     # 0-10ish, from Pose_Master.movement_score
    complexity_score: float = 0.0        # 1-10, from Product_Master / dataset
    stability_index: float = 0.0         # higher = more stable, from Product_Master / dataset

    # --- Body-region attachment coverage (0.0-1.0), from Attachment Recommendation Engine ---
    body_region_coverage: dict[BodyRegion, float] = field(default_factory=lambda: {
        BodyRegion.HEAD: 0.5, BodyRegion.WAIST: 0.5, BodyRegion.ARMS: 0.5, BodyRegion.LEGS: 0.8,
    })

    @property
    def accessory_count(self) -> int:
        return len(self.accessories)


@dataclass
class Rule:
    """
    A single executable RPKB rule.
    `condition` takes ProductFeatures and returns True if the rule fires
    (i.e. the risk-contributing condition is present).
    `severity` is a 1-3 weight (1=minor, 2=moderate, 3=critical) used in
    scoring — this is a curator judgment call pending real test calibration.
    """
    rule_id: str
    evidence_id: str
    category: RiskCategory
    description: str
    condition: Callable[[ProductFeatures], bool]
    severity: int
    explanation_template: str
    source_reference: str
    confidence: str  # High / Medium / Low, from RPKB


@dataclass
class MatchedRule:
    rule: Rule
    explanation: str


@dataclass
class CategoryResult:
    category: RiskCategory
    matched_rules: list[MatchedRule] = field(default_factory=list)
    raw_severity_sum: int = 0
    risk_percentage: float = 0.0
    risk_level: str = "Low"
    pass_probability: Optional[float] = None  # only meaningful for DROP_TEST


@dataclass
class RiskReport:
    """Final output — corresponds to DFD 5.5 (Generate Risk Report)."""
    results: dict[RiskCategory, CategoryResult]
    overall_risk_level: str
    explanation_trace: list[str]
    movement_by_region: dict = field(default_factory=dict)
    accessory_loss_by_item: list = field(default_factory=list)
