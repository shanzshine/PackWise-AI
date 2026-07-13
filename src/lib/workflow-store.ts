/**
 * Lightweight client-side store for the PackWise AI workflow.
 * Persists the analysis result so that downstream pages (Attachment Planner,
 * Attachment Visualizer, Risk Assessment, Cost & Sustainability) can read it.
 */

const KEY = "packwise_analysis";
const IMG_KEY = "packwise_image";

export interface AttachmentZone {
  zone: string;
  bodyRegion: string;
  riskLevel: "low" | "medium" | "high";
  recommendedMethod: string;
}

export interface AnalysisResult {
  // Core identity
  productName: string;
  category: string;
  imageDataUrl: string | null;
  productType: string;
  dimensions: string;
  analysedAt: string;

  // XGBoost features
  product_family: string;
  articulation: string;
  pose: string;
  product_weight_g: number;
  height_cm: number;
  center_of_gravity: string;
  hair_length: string;
  dress_length: string;
  accessory_count: number;
  accessory_weight_g: number;
  selected_accessories: string[];
  cvDetections?: any[];
  raw_keypoints?: any[];

  // Detected elements
  accessories: string[];
  bodyRegions: string[];
  attachmentZones: AttachmentZone[];

  // Risk & quality scores (0–100)
  poseComplexityScore: number;
  poseStabilityScore: number;
  movementRiskScore: number;
  accessoryLossRisk: number;
}

export const DEMO_RESULT: AnalysisResult = {
  productName: "Glamour Doll – Sparkle Edition",
  category: "Collectible Doll",
  imageDataUrl: null,
  productType: "Collectible Doll",
  dimensions: "28 × 8 × 5 cm",
  analysedAt: new Date().toISOString(),

  product_family: "Fashionistas",
  articulation: "Standard",
  pose: "Arms Open",
  product_weight_g: 120,
  height_cm: 29.0,
  center_of_gravity: "Center",
  hair_length: "Long",
  dress_length: "Short",
  accessory_count: 5,
  accessory_weight_g: 30,
  selected_accessories: ["Handbag", "Shoes", "Glasses", "Crown", "Dress Stand"],

  accessories: ["Handbag", "Shoes", "Glasses", "Crown", "Dress Stand"],
  bodyRegions: ["Head / Hair", "Torso / Waist", "Right Arm", "Left Arm", "Right Leg", "Left Leg"],

  attachmentZones: [
    { zone: "Hair", bodyRegion: "Head / Hair", riskLevel: "medium", recommendedMethod: "Elastic Strap" },
    { zone: "Waist", bodyRegion: "Torso / Waist", riskLevel: "low", recommendedMethod: "PET Support" },
    { zone: "Right Wrist", bodyRegion: "Right Arm", riskLevel: "high", recommendedMethod: "EVA Strap" },
    { zone: "Left Foot", bodyRegion: "Left Leg", riskLevel: "low", recommendedMethod: "No Attachment Required" },
  ],

  poseComplexityScore: 82,
  poseStabilityScore: 76,
  movementRiskScore: 44,
  accessoryLossRisk: 61,
};

export function saveAnalysis(result: AnalysisResult) {
  try {
    // Store image separately in sessionStorage (avoids localStorage 5MB limit)
    if (result.imageDataUrl) {
      sessionStorage.setItem(IMG_KEY, result.imageDataUrl);
    }
    // Store everything else in localStorage (without the heavy image data)
    const { imageDataUrl, ...rest } = result;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch (e) { console.warn("saveAnalysis failed", e); }
}

export function loadAnalysis(): AnalysisResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Backward compatibility if user has old localStorage state
    if (parsed.retentionZones && !parsed.attachmentZones) {
      parsed.attachmentZones = parsed.retentionZones;
    }
    // Return null to reset if state is still invalid
    if (!parsed.attachmentZones || !Array.isArray(parsed.attachmentZones)) {
      return null;
    }
    // Re-attach the image from sessionStorage
    const img = sessionStorage.getItem(IMG_KEY);
    if (img) parsed.imageDataUrl = img;
    return parsed as AnalysisResult;
  } catch { return null; }
}

export function clearAnalysis() {
  try { localStorage.removeItem(KEY); } catch { }
}

// ─── Plan persistence (Attachment Planner → Cost page) ─────────────────────

const PLAN_KEY = "packwise_plan";

export interface PlanZoneRow {
  zone: string;
  currentMethod: string;
  recommendedMethod: string;
  action: "Keep" | "Add" | "Remove" | "Replace";
  cvDetected: boolean;
  xgbRecommended: boolean;
  cost: number;
  laborMins: number;
  sustainability: number;
  stability: number;
  riskReduction: number;
}

export interface PlanResult {
  zones: PlanZoneRow[];
  totalCost: number;
  avgStability: number;
  avgSustainability: number;
  recommendedMaterial: string | null;
}

export function savePlan(plan: PlanResult) {
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) { console.warn("savePlan failed", e); }
}

export function loadPlan(): PlanResult | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? JSON.parse(raw) as PlanResult : null;
  } catch { return null; }
}
