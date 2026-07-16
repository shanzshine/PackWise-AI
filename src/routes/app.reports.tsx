import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FileBarChart2,
  Download,
  FileText,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  Leaf,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  BarChart3,
  FileDown,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type ApprovalRequest } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";
import { recommendPose } from "@/lib/pose-recommendation";
import { PoseBlueprint } from "@/components/pose-blueprint";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — PackWise AI" }] }),
  component: ReportsPage,
});

// Build a Report from an ApprovalRequest
interface DerivedReport {
  id: string;
  reqId: string;
  name: string;
  product: string;
  engineer: string;
  date: string;
  status: "Approved" | "Rejected";
  decidedAt?: string;
  risk: string;
  cost: string;
  laborTime?: string;
  sustainability?: number;
  snapshot?: ApprovalRequest["reportSnapshot"];
}

function toReport(req: any): DerivedReport {
  return {
    id: req.req_id ? `REP-${req.req_id.slice(-4)}` : `REP-${Math.floor(Math.random() * 10000)}`,
    reqId: req.req_id,
    name: `${req.sku} - Attachment Plan Report`,
    product: req.sku,
    engineer: req.engineer_name,
    date: new Date(req.submitted_at).toLocaleDateString(),
    status: req.status,
    decidedAt: req.decided_at,
    risk: req.risk_level,
    cost: req.est_cost,
    laborTime: req.labor_time,
    sustainability: req.sustainability,
    snapshot: req.report_snapshot,
  };
}

function getOrGenerateKeypoints(analysis: any): any[] {
  if (analysis?.raw_keypoints && analysis.raw_keypoints.length >= 17) {
    return analysis.raw_keypoints;
  }

  const base = [
    { id: 0, part: "nose", x: 200, y: 100, confidence: 0.95 },
    { id: 1, part: "left_eye", x: 190, y: 90, confidence: 0.95 },
    { id: 2, part: "right_eye", x: 210, y: 90, confidence: 0.95 },
    { id: 3, part: "left_ear", x: 180, y: 95, confidence: 0.95 },
    { id: 4, part: "right_ear", x: 220, y: 95, confidence: 0.95 },
    { id: 5, part: "left_shoulder", x: 170, y: 140, confidence: 0.95 },
    { id: 6, part: "right_shoulder", x: 230, y: 140, confidence: 0.95 },
    { id: 7, part: "left_elbow", x: 155, y: 195, confidence: 0.95 },
    { id: 8, part: "right_elbow", x: 245, y: 195, confidence: 0.95 },
    { id: 9, part: "left_wrist", x: 145, y: 250, confidence: 0.95 },
    { id: 10, part: "right_wrist", x: 255, y: 250, confidence: 0.95 },
    { id: 11, part: "left_hip", x: 185, y: 260, confidence: 0.95 },
    { id: 12, part: "right_hip", x: 215, y: 260, confidence: 0.95 },
    { id: 13, part: "left_knee", x: 185, y: 345, confidence: 0.95 },
    { id: 14, part: "right_knee", x: 215, y: 345, confidence: 0.95 },
    { id: 15, part: "left_ankle", x: 185, y: 430, confidence: 0.95 },
    { id: 16, part: "right_ankle", x: 215, y: 430, confidence: 0.95 }
  ];

  const p = (analysis?.pose || "Arms Open").toLowerCase();
  
  if (p.includes("open") || p.includes("t-pose") || p.includes("wide")) {
    base[9].x = 120; base[9].y = 200;
    base[7].x = 145; base[7].y = 170;
    base[10].x = 280; base[10].y = 200;
    base[8].x = 255; base[8].y = 170;
    base[15].x = 155; base[15].y = 430;
    base[16].x = 245; base[16].y = 430;
    base[0].x = 188;
  } else if (p.includes("raised") || p.includes("up") || p.includes("vogue") || p.includes("high")) {
    base[9].x = 145; base[9].y = 75;
    base[7].x = 135; base[7].y = 110;
    base[10].x = 245; base[10].y = 220;
    base[8].x = 255; base[8].y = 180;
  } else if (p.includes("sitting") || p.includes("sit")) {
    base[13].x = 145; base[13].y = 280;
    base[14].x = 255; base[14].y = 280;
    base[15].x = 145; base[15].y = 360;
    base[16].x = 255; base[16].y = 360;
    base[9].x = 135; base[9].y = 230;
    base[10].x = 265; base[10].y = 230;
  }
  
  return base;
}

function getPoseRationaleAndStrings(analysis: any) {
  const p = (analysis?.pose || "Arms Open").toLowerCase();
  
  let poseRationale = "";
  let stringRationales: Record<string, string> = {
    "Head/Hair": "Holds the doll's neck/head securely against drop-test shock loads. Placed behind the crown line to prevent indentations in hair styling.",
    "Waist": "Locks the doll's main center of mass to the backing card. Uses PET contour support to hold firmly without crushing clothes.",
    "Hands/Wrists": "EVA soft strap restrains arms close to the body, preventing hands from shifting and scratching the packaging front plastic window.",
    "Legs/Feet": "Elastic straps anchor ankles to prevent vertical translation and rotational shifting in transit.",
    "Back": "Reinforces backing card rigidity for heavier fashion dress packages.",
    "Base": "Base plate tray support protects ankle joints and absorbs vertical impact under transit drop testing."
  };

  if (p.includes("open") || p.includes("t-pose") || p.includes("wide")) {
    poseRationale = "Lowering the wide-stretched arms closer to the body reduces box width by up to 35% and avoids limbs catching on the packaging edges. Narrowing the spread legs allows a clean, contoured insert tray, preventing rotation and saving cardboard costs.";
  } else if (p.includes("raised") || p.includes("up") || p.includes("vogue") || p.includes("high")) {
    poseRationale = "Lowering the raised left arm prevents high impact stress at the shoulder joint in drop tests. Straightening the bent right arm flush to the backing card provides a stable parallel posture, reducing required package depth and lowering structural profile vulnerabilities.";
  } else if (p.includes("sitting") || p.includes("sit")) {
    poseRationale = "Straightening the legs and body from sitting to standing neutral distributes drop impacts along standard load-bearing lines. It reduces retail packaging depth by over 50%, enabling compact pallet stacking and significantly lower transport carbon emissions.";
  } else {
    poseRationale = "The current standing neutral pose is compact. Minimal adjustments are needed. The limbs are well within the protective clearance zone, minimizing assembly complexity and attachment strap counts.";
  }

  return { poseRationale, stringRationales };
}

function buildReportBlueprintSvg(analysis: any, plan: any): string {
  const activeKeypoints = getOrGenerateKeypoints(analysis);
  if (!activeKeypoints || activeKeypoints.length < 17) return "";
  
  const W = 400;
  const H = 500;
  const PAD = 40;

  const recResult = recommendPose(
    activeKeypoints,
    null,
    plan?.zones || [],
    analysis?.product_weight_g ?? 120,
    analysis?.accessory_count ?? 1,
    analysis?.hair_length ?? "Short",
    analysis?.selected_accessories ?? []
  );

  const combined = [...activeKeypoints.map(k => ({ ...k })), ...recResult.recommendedKeypoints.map(k => ({ ...k }))];
  const validKps = combined.filter(k => k.x > 0 && k.y > 0 && (k.confidence ?? 1) > 0.1);
  const minX = validKps.length > 0 ? Math.min(...validKps.map(k => k.x)) : 0;
  const maxX = validKps.length > 0 ? Math.max(...validKps.map(k => k.x)) : W;
  const minY = validKps.length > 0 ? Math.min(...validKps.map(k => k.y)) : 0;
  const maxY = validKps.length > 0 ? Math.max(...validKps.map(k => k.y)) : H;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = Math.min((W - PAD * 2) / rangeX, (H - PAD * 2) / rangeY);
  const offsetX = (W - rangeX * scale) / 2;
  const offsetY = (H - rangeY * scale) / 2;

  const normalizeKp = (k: any) => ({
    ...k,
    x: (k.x - minX) * scale + offsetX,
    y: (k.y - minY) * scale + offsetY,
  });

  const currentKps = activeKeypoints.map(normalizeKp);
  const recKps = recResult.recommendedKeypoints.map(normalizeKp);

  const SKELETON_CONNECTIONS = [
    [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // arms
    [5, 11], [6, 12], [11, 12], // torso
    [11, 13], [13, 15], [12, 14], [14, 16] // legs
  ];

  let linesHtml = "";

  // 1. Recommended pose lines (solid pink)
  for (const [a, b] of SKELETON_CONNECTIONS) {
    const ka = recKps[a];
    const kb = recKps[b];
    if (ka && kb && ka.x > 0 && ka.y > 0 && kb.x > 0 && kb.y > 0) {
      linesHtml += `<line x1="${ka.x}" y1="${ka.y}" x2="${kb.x}" y2="${kb.y}" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>`;
    }
  }

  // 1b. Recommended pose joints (pink)
  for (const kp of recKps) {
    if (kp.x > 0 && kp.y > 0) {
      linesHtml += `<circle cx="${kp.x}" cy="${kp.y}" r="3.5" fill="#ec4899" />`;
    }
  }

  // 2. Current pose lines (faded gray dashed)
  for (const [a, b] of SKELETON_CONNECTIONS) {
    const ka = currentKps[a];
    const kb = currentKps[b];
    if (ka && kb && ka.x > 0 && ka.y > 0 && kb.x > 0 && kb.y > 0) {
      linesHtml += `<line x1="${ka.x}" y1="${ka.y}" x2="${kb.x}" y2="${kb.y}" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3,3" opacity="0.8" stroke-linecap="round"/>`;
    }
  }

  // 2b. Current pose joints (faded gray)
  for (const kp of currentKps) {
    if (kp.x > 0 && kp.y > 0) {
      linesHtml += `<circle cx="${kp.x}" cy="${kp.y}" r="3" fill="#94a3b8" opacity="0.8" />`;
    }
  }

  const activePlacements = recResult.attachmentPlacements;
  for (const p of activePlacements) {
    const kp = recKps[p.keypointIndex];
    if (kp && kp.x > 0 && kp.y > 0) {
      const cx = kp.x + p.offsetX * W;
      const cy = kp.y + p.offsetY * H;
      
      linesHtml += `
        <g>
          <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${p.color || '#22c55e'}" stroke-width="1.2" opacity="0.3" />
          <circle cx="${cx}" cy="${cy}" r="7" fill="${p.color || '#22c55e'}" opacity="0.9" />
          <circle cx="${cx}" cy="${cy}" r="3.5" fill="white" opacity="0.8" />
          <text x="${cx + 11}" y="${cy + 2.5}" font-family="Inter,sans-serif" font-size="8px" font-weight="700" fill="${p.color || '#22c55e'}">${p.method}</text>
          <text x="${cx + 11}" y="${cy + 10.5}" font-family="Inter,sans-serif" font-size="6.5px" fill="#94a3b8">${p.zone}</text>
        </g>
      `;
    }
  }

  return `
    <svg viewBox="0 0 400 500" style="background:#ffffff; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; height: 100%;">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      ${linesHtml}
      
      <g transform="translate(15, 450)" font-family="Inter,sans-serif" font-size="8px" font-weight="600">
        <rect x="-4" y="-8" width="245" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.7" />
        
        <circle cx="8" cy="2" r="3.5" fill="#94a3b8" opacity="0.5" />
        <text x="18" y="5" fill="#475569">Current Pose (Gray / Dash)</text>
        
        <circle cx="128" cy="2" r="3.5" fill="#ec4899" />
        <text x="138" y="5" fill="#ec4899">Recommended Pose (Pink / Solid)</text>

        <circle cx="8" cy="18" r="4.5" fill="#22c55e" />
        <text x="18" y="21" fill="#15803d">Strap / Attachment Anchor</text>
      </g>
    </svg>
  `;
}

function ReportDetailModal({ report, onClose }: { report: DerivedReport; onClose: () => void }) {
  const snap = report.snapshot;

  const activeKeypoints = getOrGenerateKeypoints(snap);
  const recBlueprint = recommendPose(
    activeKeypoints,
    null,
    snap?.zones || [],
    snap?.product_weight_g ?? 120,
    snap?.accessory_count ?? 1,
    snap?.hair_length ?? "Short",
    snap?.selected_accessories ?? []
  );

  const onExportPdf = () => {
    const zonesHtml = (snap?.zones || []).map((z) => `
      <tr>
        <td><strong>${z.zone}</strong></td>
        <td>${z.recommendedMethod}</td>
        <td>${z.action}</td>
        <td>$${Number(z.cost).toFixed(2)}</td>
        <td>${Number(z.laborMins).toFixed(1)} min</td>
        <td>${z.sustainability}%</td>
      </tr>`).join("");

    const imageUrl = snap?.imageDataUrl || "";
    const annotatedUrl = snap?.annotatedImageDataUrl || "";
    const blueprintSvg = buildReportBlueprintSvg(snap, snap);
    const { poseRationale, stringRationales } = getPoseRationaleAndStrings(snap);

    const stringRationalesHtml = snap?.zones?.map(z => {
      const rationale = stringRationales[z.zone] || "Secures the joint against transit displacement.";
      return `
        <div style="font-size: 8.5px; padding: 4px 8px; border-left: 2.5px solid #22c55e; background: #f8fafc; border-top-right-radius: 4px; border-bottom-right-radius: 4px; margin-bottom: 3px; line-height: 1.3;">
          <strong style="color: #0f172a;">${z.zone} (${z.recommendedMethod}):</strong> ${rationale}
        </div>
      `;
    }).join("") || "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PackWise AI — ${report.id}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
  @page { margin: 12mm 15mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter','Segoe UI',sans-serif; color: #1e293b; background: #fff; font-size: 10px; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .page { padding: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; border-bottom: 2.5px solid #ec4899; margin-bottom: 18px; }
  .header h1 { font-size: 18px; font-weight: 900; color: #ec4899; letter-spacing: -0.5px; }
  .header p  { font-size: 10px; color: #64748b; margin-top: 2px; }
  .header-meta { text-align: right; font-size: 9px; color: #94a3b8; line-height: 1.6; font-family: monospace; }

  .dash { display: grid; grid-template-columns: 130px 1fr; gap: 14px; margin-bottom: 18px; }
  .grade-card { background: linear-gradient(135deg,#fdf2f8,#fce7f6); border: 1px solid #fbcfe8; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; justify-content: center; }
  .grade-letter { font-size: 42px; font-weight: 900; color: #ec4899; line-height: 1; }
  .grade-sub { font-size: 9px; font-weight: 700; color: #64748b; }
  .badge-approved { display: inline-block; background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 99px; font-size: 8px; font-weight: 800; text-transform: uppercase; }
  .badge-rejected { display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 99px; font-size: 8px; font-weight: 800; text-transform: uppercase; }

  .metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
  .metric { background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 8px 12px; }
  .mlabel { font-size: 8px; text-transform: uppercase; color: #db2777; font-weight: 700; margin-bottom: 2px; }
  .mval { font-size: 16px; font-weight: 900; color: #1a1a2e; }

  .section { margin-bottom: 18px; page-break-inside: avoid; }
  .stitle { font-size: 9px; font-weight: 900; color: #ec4899; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 4px; border-bottom: 1px solid #fce7f6; margin-bottom: 10px; }

  .kv { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
  .kvi { padding: 6px 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; }
  .kvl { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700; margin-bottom: 2px; }
  .kvv { font-size: 9.5px; font-weight: 600; color: #111827; }

  .visual-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px; }
  .visual-box { border: 1px solid #fbcfe8; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; background: #fff; }
  .visual-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #db2777; font-weight: 700; padding: 5px 9px; border-bottom: 1px solid #fbcfe8; background: #fdf2f8; }
  .visual-box img { width: 100%; height: 210px; object-fit: contain; display: block; background: #fff; }
  .visual-svg-container { width: 100%; height: 210px; padding: 4px; display: flex; justify-content: center; align-items: center; overflow: hidden; }

  .photo-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
  .photo-box { border: 1px solid #fbcfe8; border-radius: 8px; overflow: hidden; }
  .photo-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #db2777; font-weight: 700; padding: 5px 9px; border-bottom: 1px solid #fbcfe8; background: #fdf2f8; }

  table { width: 100%; border-collapse: collapse; }
  th { background: #fdf2f8; color: #be185d; font-weight: 700; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.06em; padding: 6px 8px; text-align: left; border-bottom: 1.5px solid #fbcfe8; }
  td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; font-size: 9.5px; }
  tr:last-child td { border-bottom: none; }

  .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- Page 1: Visuals & Metrics -->
  <div class="header">
    <div>
      <h1>📦 PackWise AI — Engineering Report</h1>
      <p>${report.product} &nbsp;·&nbsp; Report ID: ${report.id} &nbsp;·&nbsp; Submitted: ${report.date}</p>
    </div>
    <div style="text-align:right;">
      <span class="${report.status === "Approved" ? "badge-approved" : "badge-rejected"}">${report.status}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Summary Metrics</div>
    <div class="metrics">
      <div class="metric"><div class="mlabel">Risk Level</div><div class="mval">${report.risk}</div></div>
      <div class="metric"><div class="mlabel">Est. Cost</div><div class="mval">${report.cost}</div></div>
      ${report.laborTime ? `<div class="metric"><div class="mlabel">Labor Time</div><div class="mval">${report.laborTime}</div></div>` : ""}
      ${report.sustainability ? `<div class="metric"><div class="mlabel">Sustainability</div><div class="mval">${report.sustainability}%</div></div>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="stitle">AI Pose &amp; Attachment Visual Comparison</div>
    <div class="visual-grid">
      <div class="visual-box">
        <div class="visual-lbl">Original Captured Image</div>
        ${imageUrl ? `<img src="${imageUrl}" alt="Original" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:9px;">No image capture</div>`}
      </div>
      <div class="visual-box">
        <div class="visual-lbl">CV Detected Attachments</div>
        ${annotatedUrl ? `<img src="${annotatedUrl}" alt="Detected" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:9px;">No detection overlay</div>`}
      </div>
      <div class="visual-box">
        <div class="visual-lbl">AI Pose Blueprint Overlay</div>
        <div class="visual-svg-container">
          ${blueprintSvg || '<div style="color:#9ca3af;font-size:9px;">No blueprint SVG</div>'}
        </div>
      </div>
    </div>
  </div>

  <div class="section" style="margin-bottom: 0px;">
    <div class="stitle">Product Detection Details</div>
    <div class="kv">
      <div class="kvi"><div class="kvl">Product Name</div><div class="kvv">${report.product}</div></div>
      <div class="kvi"><div class="kvl">Detected Pose</div><div class="kvv">${snap?.detectedPoses?.join(", ") || "—"}</div></div>
      <div class="kvi"><div class="kvl">Accessories</div><div class="kvv">${snap?.accessories?.join(", ") || "None"}</div></div>
      <div class="kvi"><div class="kvl">Run ID</div><div class="kvv">${report.reqId}</div></div>
    </div>
  </div>

  <div class="section" style="margin-top: 10px;">
    <div class="stitle">Attachment Zones Plan</div>
    <table>
      <thead>
        <tr>
          <th>Zone</th>
          <th>Recommended Method</th>
          <th>Action</th>
          <th>Cost</th>
          <th>Labor</th>
          <th>Sustainability</th>
        </tr>
      </thead>
      <tbody>
        ${zonesHtml}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="stitle">AI Recommendation Rationale</div>
    <div class="photo-row" style="grid-template-columns: 1fr 1fr; gap: 14px; page-break-inside: avoid;">
      <div class="photo-box">
        <div class="photo-lbl">Pose Transformation Rationale</div>
        <div style="padding: 10px; font-size: 9px; color: #475569; line-height: 1.4; background: #faf5ff;">
          ${poseRationale}
        </div>
      </div>
      <div class="photo-box">
        <div class="photo-lbl">Recommended Attachment Zones</div>
        <div style="padding: 8px; display: flex; flex-direction: column; gap: 3px;">
          ${stringRationalesHtml || '<div style="font-size:9px; color:#64748b; font-style:italic;">No active attachment placements recommended.</div>'}
        </div>
      </div>
    </div>
  </div>

  ${snap?.finalRecommendation ? `
  <div class="section">
    <div class="stitle">Final Recommendation</div>
    <div class="kv" style="grid-template-columns: repeat(5, 1fr);">
      <div class="kvi"><div class="kvl">Packaging</div><div class="kvv">${snap.finalRecommendation.packaging}</div></div>
      <div class="kvi"><div class="kvl">Cushion</div><div class="kvv">${snap.finalRecommendation.cushion}</div></div>
      <div class="kvi"><div class="kvl">Attachment</div><div class="kvv">${snap.finalRecommendation.attachment}</div></div>
      <div class="kvi"><div class="kvl">Support</div><div class="kvv">${snap.finalRecommendation.support}</div></div>
      <div class="kvi"><div class="kvl">ISTA Standard</div><div class="kvv">${snap.finalRecommendation.ista}</div></div>
    </div>
  </div>` : ""}

  <div class="footer">
    <div>PackWise AI · Report ID: ${report.id}</div>
    <div>Engineer: ${report.engineer} · Submitted: ${report.date}</div>
  </div>
</div>
</body>
</html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-border/70 text-xs font-mono">{report.id}</Badge>
            <Badge
              variant="outline"
              className={`text-xs font-semibold border-transparent ${
                report.status === "Approved"
                  ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {report.status === "Approved" ? <CheckCircle2 className="mr-1 h-3 w-3 inline" /> : <XCircle className="mr-1 h-3 w-3 inline" />}
              {report.status}
            </Badge>
          </div>
          <DialogTitle className="text-left text-base leading-snug">{report.name}</DialogTitle>
          <DialogDescription className="text-left text-xs text-muted-foreground">
            {report.engineer} · {report.date}
            {report.decidedAt && ` · Decided: ${report.decidedAt}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Risk Level", value: report.risk },
              { label: "Est. Cost", value: report.cost },
              report.laborTime ? { label: "Labor Time", value: report.laborTime } : null,
              report.sustainability ? { label: "Sustainability", value: `${report.sustainability}%` } : null,
              snap ? { label: "Drop Survival", value: `${snap.dropSurvival}/100` } : null,
              snap ? { label: "Movement Risk", value: String(snap.movementRisk) } : null,
            ].filter(Boolean).map((item) => (
              <div key={item!.label} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wide">{item!.label}</p>
                <p className="text-base font-bold text-foreground mt-0.5">{item!.value}</p>
              </div>
            ))}
          </div>

          {/* Photos */}
          {(snap?.imageDataUrl) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product Design &amp; AI Blueprint</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20 flex flex-col h-40">
                  <p className="text-[9px] uppercase font-semibold text-muted-foreground px-2 py-1 border-b border-border/40">Original Captured Image</p>
                  <img src={snap.imageDataUrl} alt="product" className="w-full flex-1 object-contain bg-white min-h-0" />
                </div>
                <div className="rounded-lg border border-border/60 overflow-hidden bg-white flex flex-col h-40">
                  <p className="text-[9px] uppercase font-semibold text-muted-foreground px-2 py-1 border-b border-border/40 bg-muted/20">AI Pose Blueprint</p>
                  <div className="flex-1 flex items-center justify-center p-1 min-h-0 overflow-hidden">
                    <PoseBlueprint 
                      mode="overlay" 
                      recommendation={recBlueprint} 
                      currentKeypoints={activeKeypoints} 
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zones */}
          {snap?.zones && snap.zones.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachment Zones</p>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Zone</th>
                      <th className="px-3 py-2 text-left font-medium">Method</th>
                      <th className="px-3 py-2 text-left font-medium">Cost</th>
                      <th className="px-3 py-2 text-left font-medium">Labor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.zones.map((z, i) => (
                      <tr key={i} className="border-t border-border/40">
                        <td className="px-3 py-2 font-medium">{z.zone}</td>
                        <td className="px-3 py-2 text-muted-foreground">{z.recommendedMethod}</td>
                        <td className="px-3 py-2">${Number(z.cost).toFixed(2)}</td>
                        <td className="px-3 py-2">{Number(z.laborMins).toFixed(1)} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final recommendation */}
          {snap?.finalRecommendation && (
            <div className="rounded-lg border border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 p-3 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final Recommendation</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Packaging:</span> {snap.finalRecommendation.packaging}</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Cushion:</span> {snap.finalRecommendation.cushion}</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Attachment:</span> {snap.finalRecommendation.attachment}</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">ISTA:</span> {snap.finalRecommendation.ista}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1" onClick={onExportPdf}>
              <FileDown className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState<DerivedReport[]>([]);
  const [selected, setSelected] = useState<DerivedReport | null>(null);
  const [tab, setTab] = useState<"approved" | "rejected">("approved");

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('approval_requests')
        .select('*')
        .in('status', ['Approved', 'Rejected']);
      
      if (data) {
        setReports(data.map(toReport));
      }
    }
    fetchData();
  }, []);

  const approved = reports.filter((r) => r.status === "Approved");
  const rejected = reports.filter((r) => r.status === "Rejected");
  const displayed = tab === "approved" ? approved : rejected;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Accepted and rejected attachment plan reports from the approval workflow."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/70 font-normal text-[color:var(--success)]">
              <CheckCircle2 className="mr-1 h-3 w-3" /> {approved.length} approved
            </Badge>
            <Badge variant="outline" className="border-border/70 font-normal text-destructive">
              <XCircle className="mr-1 h-3 w-3" /> {rejected.length} rejected
            </Badge>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Reports", value: reports.length.toString(), icon: FileText, hint: "Decided by manager" },
          { label: "Approved", value: approved.length.toString(), icon: CheckCircle2, hint: "Ready for production" },
          { label: "Rejected", value: rejected.length.toString(), icon: XCircle, hint: "Returned to engineer" },
          { label: "System Status", value: "Online", icon: Sparkles, hint: "All services operational" },
        ].map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/70">
        {(["approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "approved"
              ? <><CheckCircle2 className="h-3.5 w-3.5" /> Approved Reports</>
              : <><XCircle className="h-3.5 w-3.5" /> Rejected Plans</>}
          </button>
        ))}
      </div>

      {/* Report list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-foreground">
            No {tab} reports yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "approved"
              ? "Once the Operations Manager approves a plan, the report will appear here."
              : "Rejected plans will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="group flex items-start gap-3 rounded-xl border border-border/60 p-4 text-left transition hover:border-primary/40 hover:bg-[color:var(--primary-soft)]/20"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${r.status === "Approved" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : "bg-destructive/10 text-destructive"}`}>
                {r.status === "Approved" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{r.product}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.date}</p>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.risk === "Low" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : r.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}`}>
                    {r.risk} Risk
                  </span>
                  <span className="text-[10px] text-muted-foreground">{r.cost}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100">
                  View report <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <ReportDetailModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
