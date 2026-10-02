import type { PackagingPrediction } from "@/lib/workflow-store";

export interface RuntimeFeedbackRow {
  id: string;
  reason_category: string;
  reason_text: string;
  product_features: Record<string, unknown>;
  corrected_prediction: PackagingPrediction;
  runtime_weight?: number;
}

export interface RuntimeFeedbackResult {
  prediction: PackagingPrediction;
  applied: boolean;
  evidenceCount: number;
  reasons: string[];
}

const TARGETS: Array<keyof PackagingPrediction> = [
  "recommended_head_strap",
  "recommended_waist_strap",
  "recommended_hand_strap",
  "recommended_leg_strap",
  "recommended_back_support",
  "recommended_base_support",
  "recommended_material",
];

function similarity(current: Record<string, unknown>, past: Record<string, unknown>) {
  let score = 0;
  if (current.product_family === past.product_family) score += 5;
  if (current.pose === past.pose) score += 3;
  if (current.articulation === past.articulation) score += 2;
  if (current.center_of_gravity === past.center_of_gravity) score += 1;
  if (current.hair_length === past.hair_length) score += 1;
  if (current.dress_length === past.dress_length) score += 1;

  const currentWeight = Number(current.product_weight_g ?? 0);
  const pastWeight = Number(past.product_weight_g ?? 0);
  if (Math.abs(currentWeight - pastWeight) <= 15) score += 1;

  const currentAccessories = Number(current.accessory_count ?? 0);
  const pastAccessories = Number(past.accessory_count ?? 0);
  if (Math.abs(currentAccessories - pastAccessories) <= 1) score += 1;
  return score;
}

export function applyRuntimeFeedback(
  basePrediction: PackagingPrediction,
  currentFeatures: Record<string, unknown>,
  rows: RuntimeFeedbackRow[],
): RuntimeFeedbackResult {
  const candidates = rows
    .map((row) => ({ row, score: similarity(currentFeatures, row.product_features) }))
    .filter(({ score }) => score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // One correction is not enough evidence to override a production prediction.
  if (candidates.length < 2) {
    return { prediction: basePrediction, applied: false, evidenceCount: candidates.length, reasons: [] };
  }

  const prediction = { ...basePrediction };
  let changed = false;

  for (const target of TARGETS) {
    const votes = new Map<string, { value: PackagingPrediction[typeof target]; weight: number; count: number }>();
    for (const { row, score } of candidates) {
      const value = row.corrected_prediction?.[target];
      if (value === undefined || value === null) continue;
      const key = String(value);
      const vote = votes.get(key) ?? { value, weight: 0, count: 0 };
      vote.weight += score * Number(row.runtime_weight ?? 1);
      vote.count += 1;
      votes.set(key, vote);
    }

    const winner = [...votes.values()].sort((a, b) => b.weight - a.weight)[0];
    if (winner?.count >= 2 && winner.value !== prediction[target]) {
      (prediction as Record<string, string | number>)[target] = winner.value;
      changed = true;
    }
  }

  return {
    prediction,
    applied: changed,
    evidenceCount: candidates.length,
    reasons: candidates.slice(0, 3).map(({ row }) => `${row.reason_category}: ${row.reason_text}`),
  };
}
