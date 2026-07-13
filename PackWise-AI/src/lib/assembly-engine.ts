/**
 * PackWise AI — Assembly Time & Attachment Engine
 *
 * Implements DFA/MTM heuristic standards for packaging attachment
 * analysis, material recommendation, and assembly time estimation.
 *
 * Rules:
 *   - Blister / Inner Tray                 → flat 15 s per unit
 *   - Elastic Strap / Rubber Band          → 2.5 s – 4.0 s per attachment point
 *   - EVA Strap / PET / Cardboard support  → 3.0 s – 5.0 s per attachment point
 *   - Fastener                             → 4.0 s per attachment point
 *   - Complex pose penalty                 → +15 % on total assembly time
 *
 * Complexity is flagged when poseComplexityScore ≥ 70 (matching the
 * existing product-analysis page threshold).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type MaterialOption =
  | "Rubber Band"
  | "Elastic Strap"
  | "EVA Strap"
  | "Blister"
  | "Inner Tray"
  | "PET Support"
  | "Cardboard Support"
  | "Fastener";

export interface SkeletonKeypoint {
  name: string;
  x: number;
  y: number;
  confidence?: number;
}

export interface EngineInput {
  /** Product weight in grams */
  weightGrams: number;
  /** Free-text accessories list */
  accessories: string[];
  /** YOLOv8 skeleton keypoints (optional — mocked when absent) */
  skeletonKeypoints?: SkeletonKeypoint[];
  /** 0–100 pose complexity score from product analysis; defaults to 0 */
  poseComplexityScore?: number;
}

export interface RetentionZone {
  zone: string;
  bodyRegion: string;
  keypointSource: string;
  reason: string;
}

export interface EngineOutput {
  retention_zones: RetentionZone[];
  recommended_material: MaterialOption;
  attachment_points: number;
  assembly_time_seconds: number;
  is_complex_pose: boolean;
  calculation_breakdown: string;
}

// ─── Skeleton zone mapping ────────────────────────────────────────────────────

/**
 * Maps YOLOv8 / COCO keypoint names to human-readable packaging zones.
 * Only keypoints with confidence ≥ 0.4 are considered.
 */
const KEYPOINT_ZONE_MAP: Record<string, { zone: string; bodyRegion: string; reason: string }> = {
  nose:           { zone: "Head",         bodyRegion: "Head / Hair",    reason: "Head attachment prevents forward lean during transit" },
  left_eye:       { zone: "Head",         bodyRegion: "Head / Hair",    reason: "Facial region — constraint prevents head rotation" },
  right_eye:      { zone: "Head",         bodyRegion: "Head / Hair",    reason: "Facial region — constraint prevents head rotation" },
  left_ear:       { zone: "Head",         bodyRegion: "Head / Hair",    reason: "Ear-level attachment point for lateral stability" },
  right_ear:      { zone: "Head",         bodyRegion: "Head / Hair",    reason: "Ear-level attachment point for lateral stability" },
  left_shoulder:  { zone: "Shoulder",     bodyRegion: "Torso / Waist",  reason: "Shoulder node is a primary torso stability point" },
  right_shoulder: { zone: "Shoulder",     bodyRegion: "Torso / Waist",  reason: "Shoulder node is a primary torso stability point" },
  left_elbow:     { zone: "Left Elbow",   bodyRegion: "Left Arm",       reason: "Elbow bend creates displacement risk — restraint required" },
  right_elbow:    { zone: "Right Elbow",  bodyRegion: "Right Arm",      reason: "Elbow bend creates displacement risk — restraint required" },
  left_wrist:     { zone: "Left Wrist",   bodyRegion: "Left Arm",       reason: "Wrist is the highest movement-risk extremity point" },
  right_wrist:    { zone: "Right Wrist",  bodyRegion: "Right Arm",      reason: "Wrist is the highest movement-risk extremity point" },
  left_hip:       { zone: "Waist",        bodyRegion: "Torso / Waist",  reason: "Hip anchors the centre-of-mass — key stability zone" },
  right_hip:      { zone: "Waist",        bodyRegion: "Torso / Waist",  reason: "Hip anchors the centre-of-mass — key stability zone" },
  left_knee:      { zone: "Left Knee",    bodyRegion: "Left Leg",       reason: "Knee angle increases leg splay probability" },
  right_knee:     { zone: "Right Knee",   bodyRegion: "Right Leg",      reason: "Knee angle increases leg splay probability" },
  left_ankle:     { zone: "Left Ankle",   bodyRegion: "Left Leg",       reason: "Ankle / foot point is the lowest extremity anchor" },
  right_ankle:    { zone: "Right Ankle",  bodyRegion: "Right Leg",      reason: "Ankle / foot point is the lowest extremity anchor" },
};

/** Fallback zones used when no skeleton data is provided */
const DEFAULT_ZONES: RetentionZone[] = [
  { zone: "Head / Hair",   bodyRegion: "Head / Hair",   keypointSource: "heuristic", reason: "Head region always requires elastic or foam restraint to prevent forward lean" },
  { zone: "Waist",         bodyRegion: "Torso / Waist", keypointSource: "heuristic", reason: "Waist is the centre-of-mass anchor — PET or EVA support recommended" },
  { zone: "Right Wrist",   bodyRegion: "Right Arm",     keypointSource: "heuristic", reason: "Distal limb extremities carry highest displacement risk" },
  { zone: "Left Ankle",    bodyRegion: "Left Leg",      keypointSource: "heuristic", reason: "Ankle zone anchors lower extremity during vertical shipping stress" },
];

// ─── Material selector ────────────────────────────────────────────────────────

/**
 * Selects the optimal material based on weight and number of zones.
 *
 * Strategy:
 *   ≥ 5 zones or ≥ 300 g  → Blister (complete containment)
 *   ≥ 3 zones             → EVA Strap (balance between rigidity & cost)
 *   1–2 zones, light      → Elastic Strap or Rubber Band
 *   High-weight single    → PET Support
 */
function selectMaterial(
  weightGrams: number,
  zoneCount: number,
  complexPose: boolean,
): MaterialOption {
  if (weightGrams >= 400 || zoneCount >= 6) return "Blister";
  if (weightGrams >= 250 || zoneCount >= 4) return "Inner Tray";
  if (complexPose && zoneCount >= 3) return "EVA Strap";
  if (zoneCount >= 3) return "PET Support";
  if (weightGrams >= 150) return "EVA Strap";
  if (weightGrams >= 80) return "Elastic Strap";
  return "Rubber Band";
}

// ─── Time-per-point rates (seconds) ──────────────────────────────────────────

const TIME_RATES: Record<MaterialOption, { rate: number; flat?: number }> = {
  "Rubber Band":        { rate: 2.5  },
  "Elastic Strap":      { rate: 3.0  },
  "EVA Strap":          { rate: 3.5  },
  "Blister":            { flat: 15.0, rate: 0 },
  "Inner Tray":         { flat: 15.0, rate: 0 },
  "PET Support":        { rate: 3.8  },
  "Cardboard Support":  { rate: 3.2  },
  "Fastener":           { rate: 4.0  },
};

// ─── Minimum attachment points per zone ──────────────────────────────────────

/**
 * Recommends the minimum number of attachment points needed.
 * Blister/tray = 1 (the tray itself), else 1 point per zone minimum.
 */
function recommendPoints(material: MaterialOption, zoneCount: number): number {
  if (material === "Blister" || material === "Inner Tray") return 1;
  // High-risk materials benefit from 2 points at the most critical zones
  const highRiskBonus = ["EVA Strap", "PET Support", "Fastener"].includes(material)
    ? Math.min(2, Math.floor(zoneCount / 2))
    : 0;
  return zoneCount + highRiskBonus;
}

// ─── Overlap / complex-pose detection ────────────────────────────────────────

/**
 * Detects overlapping limbs using bounding-box proximity on keypoints.
 * If skeleton data is absent, falls back to the poseComplexityScore.
 */
function detectComplexPose(
  keypoints: SkeletonKeypoint[] | undefined,
  poseComplexityScore: number,
): boolean {
  if (keypoints && keypoints.length > 0) {
    // Check for overlapping limb pairs: wrist ↔ opposite hip, elbow ↔ knee
    const get = (name: string) => keypoints.find((k) => k.name === name);
    const lw = get("left_wrist"), rw = get("right_wrist");
    const lh = get("left_hip"),   rh = get("right_hip");
    const le = get("left_elbow"), re = get("right_elbow");
    const lk = get("left_knee"),  rk = get("right_knee");

    const proximity = (a?: SkeletonKeypoint, b?: SkeletonKeypoint, threshold = 0.08) => {
      if (!a || !b) return false;
      if ((a.confidence ?? 1) < 0.4 || (b.confidence ?? 1) < 0.4) return false;
      const dx = a.x - b.x, dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy) < threshold;
    };

    if (
      proximity(lw, rh) || proximity(rw, lh) ||
      proximity(le, lk) || proximity(re, rk)
    ) return true;
  }
  return poseComplexityScore >= 70;
}

// ─── Zone extractor ───────────────────────────────────────────────────────────

/**
 * Derives retention zones from skeleton keypoints.
 * De-duplicates by bodyRegion (takes only the most-reliable keypoint).
 */
function extractZones(keypoints?: SkeletonKeypoint[]): RetentionZone[] {
  if (!keypoints || keypoints.length === 0) return DEFAULT_ZONES;

  const seen = new Set<string>();
  const zones: RetentionZone[] = [];

  // Sort by confidence desc so we take the best reading per region
  const sorted = [...keypoints].sort(
    (a, b) => (b.confidence ?? 1) - (a.confidence ?? 1),
  );

  for (const kp of sorted) {
    if ((kp.confidence ?? 1) < 0.4) continue;
    const mapping = KEYPOINT_ZONE_MAP[kp.name];
    if (!mapping || seen.has(mapping.bodyRegion)) continue;
    seen.add(mapping.bodyRegion);
    zones.push({
      zone: mapping.zone,
      bodyRegion: mapping.bodyRegion,
      keypointSource: kp.name,
      reason: mapping.reason,
    });
  }

  return zones.length > 0 ? zones : DEFAULT_ZONES;
}

// ─── Main engine function ─────────────────────────────────────────────────────

export function runAssemblyEngine(input: EngineInput): EngineOutput {
  const {
    weightGrams,
    accessories,
    skeletonKeypoints,
    poseComplexityScore = 0,
  } = input;

  // 1. Zone analysis
  const zones = extractZones(skeletonKeypoints);

  // 2. Complexity detection
  const isComplexPose = detectComplexPose(skeletonKeypoints, poseComplexityScore);

  // 3. Material selection
  const material = selectMaterial(weightGrams, zones.length, isComplexPose);

  // 4. Minimum attachment points
  const attachmentPoints = recommendPoints(material, zones.length);

  // 5. Base assembly time
  const timing = TIME_RATES[material];
  let baseTime: number;
  if (timing.flat !== undefined) {
    // Blister / Inner Tray — flat rate regardless of points
    baseTime = timing.flat;
  } else {
    baseTime = timing.rate * attachmentPoints;
  }

  // 6. Complexity penalty (+15 %)
  const penaltyMultiplier = isComplexPose ? 1.15 : 1.0;
  const finalTime = parseFloat((baseTime * penaltyMultiplier).toFixed(2));

  // 7. Build breakdown string
  const breakdownParts: string[] = [];
  if (timing.flat !== undefined) {
    breakdownParts.push(`${material} flat-rate = ${timing.flat}s`);
  } else {
    breakdownParts.push(`${material} @ ${timing.rate}s × ${attachmentPoints} points = ${(timing.rate * attachmentPoints).toFixed(1)}s`);
  }
  if (isComplexPose) {
    breakdownParts.push(`Complex pose penalty +15% → ×1.15`);
  }
  breakdownParts.push(`Total = ${finalTime}s`);
  if (accessories.length > 0) {
    breakdownParts.push(`Accessories noted (${accessories.join(", ")}) — add 2–4s/accessory for individual tying if loose`);
  }

  return {
    retention_zones: zones,
    recommended_material: material,
    attachment_points: attachmentPoints,
    assembly_time_seconds: finalTime,
    is_complex_pose: isComplexPose,
    calculation_breakdown: breakdownParts.join(" | "),
  };
}
