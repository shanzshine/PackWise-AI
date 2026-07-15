/**
 * PackWise AI — Pose Blueprint Visualization
 *
 * Lightweight SVG component that draws:
 * - Current pose skeleton (red/faded)
 * - Recommended pose skeleton (blue/bright)
 * - Attachment zone markers (green circles with labels)
 * - Adjustment arrows
 *
 * Kept minimal to avoid heavy rendering with many blueprints.
 */

import { memo, useMemo, useState } from "react";
import {
  type Keypoint,
  type PoseRecommendation,
  SKELETON_CONNECTIONS,
  KEYPOINT_NAMES,
} from "@/lib/pose-recommendation";

// ─── SVG dimensions ──────────────────────────────────────────────────────────

const W = 400;
const H = 500;
const PAD = 40;

// ─── Normalize keypoints to SVG viewport ─────────────────────────────────────

function normalizeKeypoints(kps: Keypoint[]): Keypoint[] {
  if (kps.length === 0) return [];

  const validKps = kps.filter(k => k.x > 0 && k.y > 0 && k.confidence > 0.1);
  if (validKps.length === 0) return kps;

  const minX = Math.min(...validKps.map(k => k.x));
  const maxX = Math.max(...validKps.map(k => k.x));
  const minY = Math.min(...validKps.map(k => k.y));
  const maxY = Math.max(...validKps.map(k => k.y));

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = Math.min((W - PAD * 2) / rangeX, (H - PAD * 2) / rangeY);

  const offsetX = (W - rangeX * scale) / 2;
  const offsetY = (H - rangeY * scale) / 2;

  return kps.map(k => ({
    ...k,
    x: (k.x - minX) * scale + offsetX,
    y: (k.y - minY) * scale + offsetY,
  }));
}

// ─── Skeleton drawer ─────────────────────────────────────────────────────────

const CONNECTION_LABELS: Record<string, string> = {
  "5-7": "Upper Arm (L)",
  "7-9": "Forearm (L)",
  "6-8": "Upper Arm (R)",
  "8-10": "Forearm (R)",
  "11-13": "Thigh (L)",
  "13-15": "Calf (L)",
  "12-14": "Thigh (R)",
  "14-16": "Calf (R)"
};

function SkeletonLines({
  kps,
  color,
  opacity = 1,
  strokeWidth = 2,
  showLabels = false,
}: {
  kps: Keypoint[];
  color: string;
  opacity?: number;
  strokeWidth?: number;
  showLabels?: boolean;
}) {
  if (kps.length < 17) return null;
  return (
    <g opacity={opacity}>
      {SKELETON_CONNECTIONS.map(([a, b], i) => {
        const ka = kps[a], kb = kps[b];
        if (!ka || !kb || (ka.x === 0 && ka.y === 0) || (kb.x === 0 && kb.y === 0)) return null;
        
        const key = `${a}-${b}`;
        const label = CONNECTION_LABELS[key];
        const midX = (ka.x + kb.x) / 2;
        const midY = (ka.y + kb.y) / 2;

        return (
          <g key={i}>
            <line
              x1={ka.x} y1={ka.y}
              x2={kb.x} y2={kb.y}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {showLabels && label && (
              <text
                x={midX}
                y={midY - 4}
                fontSize={7}
                fontWeight="600"
                fill="#475569"
                textAnchor="middle"
                style={{
                  paintOrder: "stroke",
                  stroke: "white",
                  strokeWidth: 2.5,
                  strokeLinejoin: "round",
                  fontFamily: "system-ui"
                }}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
      {kps.map((k, i) => {
        if (k.x === 0 && k.y === 0) return null;
        return (
          <circle
            key={`j${i}`}
            cx={k.x} cy={k.y}
            r={i === 0 ? 5 : 3.5}
            fill={color}
          />
        );
      })}
    </g>
  );
}

// ─── Attachment markers ──────────────────────────────────────────────────────

function AttachmentMarkers({
  placements,
  kps,
}: {
  placements: PoseRecommendation["attachmentPlacements"];
  kps: Keypoint[];
}) {
  if (kps.length < 17) return null;
  return (
    <g>
      {placements.map((p, i) => {
        const kp = kps[p.keypointIndex];
        if (!kp || (kp.x === 0 && kp.y === 0)) return null;
        const cx = kp.x + p.offsetX * W;
        const cy = kp.y + p.offsetY * H;
        return (
          <g key={i}>
            {/* Pulse ring */}
            <circle cx={cx} cy={cy} r={14} fill="none" stroke={p.color} strokeWidth={1.5} opacity={0.3}>
              <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Marker */}
            <circle cx={cx} cy={cy} r={8} fill={p.color} opacity={0.9} />
            <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.8} />
            {/* Label */}
            <text
              x={cx + 14} y={cy + 4}
              fontSize={9} fontWeight="600" fill={p.color}
              fontFamily="system-ui"
            >
              {p.method}
            </text>
            <text
              x={cx + 14} y={cy + 14}
              fontSize={7} fill="#94a3b8"
              fontFamily="system-ui"
            >
              {p.zone}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ─── Main Blueprint Component ────────────────────────────────────────────────

interface PoseBlueprintProps {
  recommendation: PoseRecommendation;
  currentKeypoints: Keypoint[];
  imageUrl?: string;
  className?: string;
}

export const PoseBlueprint = memo(function PoseBlueprint({
  recommendation,
  currentKeypoints,
  imageUrl,
  className = "",
}: PoseBlueprintProps) {
  const [imgDim, setImgDim] = useState({ w: 0, h: 0 });

  const normalizedCurrent = useMemo(() => normalizeKeypoints(currentKeypoints), [currentKeypoints]);
  const normalizedRecommended = useMemo(() => normalizeKeypoints(recommendation.recommendedKeypoints), [recommendation.recommendedKeypoints]);

  const hasValidSkeleton = currentKeypoints.length >= 17 && currentKeypoints.some(k => k.x > 0 && k.y > 0);

  if (!hasValidSkeleton) {
    return (
      <div className={`flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800 ${className}`} style={{ minHeight: 300 }}>
        <p className="text-slate-500 text-sm text-center px-8">No skeleton data available.<br />Run Product Analysis first.</p>
      </div>
    );
  }

  // Overlay Mode: When imageUrl is provided, we draw raw keypoints over the image
  if (imageUrl) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img 
          src={imageUrl} 
          alt="Doll Blueprint Overlay" 
          className="max-h-[380px] w-auto rounded object-contain block opacity-50"
          onLoad={(e) => setImgDim({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />
        {imgDim.w > 0 && (
          <svg 
            viewBox={`0 0 ${imgDim.w} ${imgDim.h}`} 
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Current pose (faded slate) */}
            <SkeletonLines kps={currentKeypoints} color="#94a3b8" opacity={0.6} strokeWidth={imgDim.w * 0.006} />

            {/* Recommended pose (bright pink matching brand) */}
            <SkeletonLines kps={recommendation.recommendedKeypoints} color="#ec4899" opacity={1} strokeWidth={imgDim.w * 0.01} showLabels={true} />

            {/* Attachment markers */}
            {/* We scale the offset manually based on image dimensions instead of W/H */}
            <g>
              {recommendation.attachmentPlacements.map((p, i) => {
                const kp = recommendation.recommendedKeypoints[p.keypointIndex];
                if (!kp || (kp.x === 0 && kp.y === 0)) return null;
                // p.offsetX/Y are percentages (-0.5 to 0.5) intended for the normalized 400x500 box.
                // We map them to the image dimensions.
                const cx = kp.x + (p.offsetX * imgDim.w * 0.5);
                const cy = kp.y + (p.offsetY * imgDim.h * 0.5);
                const baseR = imgDim.w * 0.02;
                return (
                  <g key={i}>
                    {/* Marker */}
                    <circle cx={cx} cy={cy} r={baseR} fill={p.color} opacity={0.9} />
                    <circle cx={cx} cy={cy} r={baseR * 0.5} fill="white" opacity={0.8} />
                    {/* Label */}
                    <text
                      x={cx + baseR * 1.5} y={cy + baseR * 0.5}
                      fontSize={baseR * 1.2} fontWeight="600" fill={p.color}
                      fontFamily="system-ui"
                    >
                      {p.method}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
    );
  }

  // Grid Mode (Fallback)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full h-auto ${className}`}
      style={{ maxHeight: 380 }}
    >
      {/* Background */}
      <rect width={W} height={H} fill="#ffffff" rx={8} />

      {/* Grid */}
      <g opacity={0.5}>
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`gx${i}`} x1={i * 20} y1={0} x2={i * 20} y2={H} stroke="#e2e8f0" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 25 }, (_, i) => (
          <line key={`gy${i}`} x1={0} y1={i * 20} x2={W} y2={i * 20} stroke="#e2e8f0" strokeWidth={0.5} />
        ))}
      </g>

      {/* Title */}
      <text x={W / 2} y={22} textAnchor="middle" fontSize={11} fontWeight="700" fill="#0f172a" fontFamily="system-ui">
        RECOMMENDED POSE BLUEPRINT
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui">
        {recommendation.poseName} — Risk: {recommendation.currentPoseRisk} → {recommendation.recommendedPoseRisk}
      </text>

      {/* Current pose (faded slate) */}
      <SkeletonLines kps={normalizedCurrent} color="#94a3b8" opacity={0.4} strokeWidth={1.5} />

      {/* Recommended pose (bright pink matching brand) */}
      <SkeletonLines kps={normalizedRecommended} color="#ec4899" opacity={1} strokeWidth={2.5} showLabels={true} />

      {/* Attachment markers */}
      <AttachmentMarkers placements={recommendation.attachmentPlacements} kps={normalizedRecommended} />

      {/* Legend */}
      <g transform={`translate(12, ${H - 50})`}>
        <rect x={-4} y={-8} width={130} height={46} rx={4} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1} />
        <circle cx={8} cy={4} r={4} fill="#94a3b8" opacity={0.5} />
        <text x={18} y={7} fontSize={8} fill="#334155" fontFamily="system-ui">Current Pose</text>
        <circle cx={8} cy={18} r={4} fill="#ec4899" />
        <text x={18} y={21} fontSize={8} fill="#334155" fontFamily="system-ui">Recommended Pose</text>
        <circle cx={8} cy={32} r={4} fill="#22c55e" />
        <text x={18} y={35} fontSize={8} fill="#334155" fontFamily="system-ui">Attachment Point</text>
      </g>
    </svg>
  );
});
