import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, CheckCircle2, XCircle, DollarSign, Leaf, Clock, Zap, Info, ShieldAlert, ImageIcon, FileDown
} from "lucide-react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, loadApprovalRequests, updateApprovalStatus, type AnalysisResult } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { recommendPose } from "@/lib/pose-recommendation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import SubmitPlanContent from "@/components/SubmitPlanContent";

// Feedback Modal Component
function FeedbackModal({ mode, onConfirm, onCancel }: { mode: "Approved" | "Rejected", onConfirm: (fb: string) => void, onCancel: () => void }) {
  const [feedback, setFeedback] = useState("");
  const isReject = mode === "Rejected";

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReject ? "Reject Plan" : "Approve Plan"}</DialogTitle>
          <DialogDescription>
            {isReject
              ? "Please provide mandatory feedback explaining why this plan is rejected so the engineer can fix it."
              : "Optional: Add any final comments or notes before approving this plan."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Feedback {isReject ? "*" : "(Optional)"}</Label>
            <Textarea
              placeholder={isReject ? "e.g., The right wrist zone is too high risk, try using wire tie instead." : "Looks good, ready for production."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={() => onConfirm(feedback)}
            disabled={isReject && feedback.trim().length < 5}
            className={isReject ? "bg-destructive text-white hover:bg-destructive/90" : "bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"}
          >
            Confirm {mode}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/app/approvals/$id")({
  head: () => ({ meta: [{ title: "Approval Details — PackWise AI" }] }),
  component: ApprovalDetailsPage,
});

const RISK_BADGE: Record<string, string> = {
  low:    "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  high:   "bg-destructive/10 text-destructive border-transparent",
};
const RISK_FILL: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#ef4444",
};
const RISK_STROKE: Record<string, string> = {
  low: "#16a34a", medium: "#d97706", high: "#dc2626",
};

const ZONE_POSITIONS: Record<string, { cx: number; cy: number }> = {
  "Hair":        { cx: 100, cy: 10  },
  "Waist":       { cx: 148, cy: 162 },
  "Right Wrist": { cx: 182, cy: 188 },
  "Left Foot":   { cx: 72,  cy: 358 },
};

// Removed ZONE_DETAIL since we now fetch it dynamically from AttachmentZone

function YoloImageOverlay({ imageUrl, detections, threshold }: { imageUrl: string; detections: any[]; threshold: number }) {
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [imgRendered, setImgRendered] = useState({ w: 0, h: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
    setImgRendered({ w: el.clientWidth, h: el.clientHeight });
  };

  const filteredDetections = detections.filter(d => d.confidence >= threshold);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Product Uploaded"
          className="max-h-[300px] max-w-full object-contain rounded drop-shadow-md block"
          onLoad={handleLoad}
        />
        {imgRendered.w > 0 && filteredDetections.map((d, i) => {
          const { xmin, ymin, xmax, ymax } = d.box;
          const scaleX = imgRendered.w / imgNatural.w;
          const scaleY = imgRendered.h / imgNatural.h;
          return (
            <div key={i} className="absolute border-2 border-primary bg-primary/15 pointer-events-none" style={{
              left: `${xmin * scaleX}px`,
              top: `${ymin * scaleY}px`,
              width: `${(xmax - xmin) * scaleX}px`,
              height: `${(ymax - ymin) * scaleY}px`,
            }}>
              <span className="absolute -top-[20px] left-0 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-t font-semibold whitespace-nowrap shadow-sm">
                {d.class_name} {Math.round(d.confidence * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs">
        {filteredDetections.length > 0 ? (
          <span className="bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30 rounded-full px-2 py-0.5 font-semibold">
            ✓ {filteredDetections.length} zone{filteredDetections.length > 1 ? "s" : ""} detected
          </span>
        ) : (
          <span className="bg-muted/50 text-muted-foreground rounded-full px-2 py-0.5">
            No zones detected
          </span>
        )}
      </div>
    </div>
  );
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

function shortId(id: string) {
  return `#${id.split('-')[0].toUpperCase()}`;
}

function ApprovalDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [approvalReq, setApprovalReq] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"Approved" | "Rejected" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = getUser();
  const isApprover = user?.role === "manager";

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('approval').select('*').eq('req_id', id).single();
      if (data) {
        setApprovalReq({
          id: data.req_id,
          sku: data.sku,
          engineer: data.engineer_name,
          date: new Date(data.submitted_at).toLocaleString(),
          risk: data.risk_level,
          cost: data.est_cost,
          laborTime: data.labor_time,
          status: data.status,
          reportSnapshot: data.report_snapshot,
          assessment_id: data.assessment_id,
        });
      }
      
      const a = loadAnalysis();
      if (a) {
        setAnalysis(a);
        setSelected(a.attachmentZones?.[0]?.zone ?? null);
      } else if (data?.report_snapshot?.zones?.length) {
        setSelected(data.report_snapshot.zones[0]?.zone ?? null);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [id]);

  const zones = analysis?.attachmentZones
    ?? (approvalReq?.reportSnapshot?.zones?.map((z: any) => ({
        zone: z.zone,
        bodyRegion: z.zone,
        riskLevel: "medium" as const,
        recommendedMethod: z.recommendedMethod,
        cost: `$${Number(z.cost).toFixed(2)}`,
        labor: `${z.laborMins} min`,
        sustainability: z.sustainability,
      })) ?? []);
  const productName = analysis?.productName ?? approvalReq?.sku ?? "Unknown Product";
  const imageUrl = analysis?.imageDataUrl ?? approvalReq?.reportSnapshot?.imageDataUrl;
  const sel = zones.find((z: any) => z.zone === selected);

  const handleDecision = (status: "Approved" | "Rejected", feedback: string) => {
    updateApprovalStatus(id, status, feedback || undefined);
    setModalMode(null);
    toast[status === "Approved" ? "success" : "error"](
      `Request ${shortId(id)} ${status.toLowerCase()}.`
    );
    navigate({ to: "/app/approvals" });
  };

  const onExportPdf = () => {
    if (!approvalReq) return;
    const snap = approvalReq.reportSnapshot;
    const repId = approvalReq.id ? shortId(approvalReq.id) : `#${Math.floor(Math.random() * 90000) + 10000}`;

    const zonesHtml = (snap?.zones || []).map((z: any) => `
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

    const stringRationalesHtml = snap?.zones?.map((z: any) => {
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
<title>PackWise AI — ${repId}</title>
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
      <p>${approvalReq.sku} &nbsp;·&nbsp; Report ID: ${repId} &nbsp;·&nbsp; Submitted: ${approvalReq.date}</p>
    </div>
    <div style="text-align:right;">
      <span class="${approvalReq.status === "Approved" ? "badge-approved" : approvalReq.status === "Rejected" ? "badge-rejected" : "badge-approved"}" style="${approvalReq.status === "Pending" ? "background:#fef3c7; color:#92400e;" : ""}">${approvalReq.status}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Summary Metrics</div>
    <div class="metrics">
      <div class="metric"><div class="mlabel">Risk Level</div><div class="mval">${approvalReq.risk}</div></div>
      <div class="metric"><div class="mlabel">Est. Cost</div><div class="mval">${approvalReq.cost}</div></div>
      ${approvalReq.laborTime ? `<div class="metric"><div class="mlabel">Labor Time</div><div class="mval">${approvalReq.laborTime}</div></div>` : ""}
      ${snap?.avgSustainability ? `<div class="metric"><div class="mlabel">Sustainability</div><div class="mval">${snap.avgSustainability}%</div></div>` : ""}
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
      <div class="kvi"><div class="kvl">Product Name</div><div class="kvv">${approvalReq.sku}</div></div>
      <div class="kvi"><div class="kvl">Detected Pose</div><div class="kvv">${snap?.detectedPoses?.join(", ") || "—"}</div></div>
      <div class="kvi"><div class="kvl">Accessories</div><div class="kvv">${snap?.accessories?.join(", ") || "None"}</div></div>
      <div class="kvi"><div class="kvl">ID</div><div class="kvv">#${(approvalReq.id || "").split("-")[0].toUpperCase()}</div></div>
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
    <div>PackWise AI · Report ID: ${repId}</div>
    <div>Engineer: ${approvalReq.engineer} · Submitted: ${approvalReq.date}</div>
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

  const activeZones = zones.filter((z: any) => z.recommendedMethod !== "No Attachment Required" && z.recommendedMethod !== "Not needed");
  const totalLabor = activeZones.reduce((acc: number, z: any) => acc + (parseFloat(z.labor ?? "0") || 0), 0);
  const avgSustain = activeZones.length > 0 ? Math.round(activeZones.reduce((acc: number, z: any) => acc + (z.sustainability ?? 100), 0) / activeZones.length) : 100;
  const poseStab = analysis?.poseStabilityScore ?? 100;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Approval Request: ${shortId(id)}`}
          description="Retrieving approval request details..."
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/approvals"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Approvals</Link>
            </Button>
          }
        />
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/10 py-16 text-center">
          <Clock className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Retrieving request data...</p>
          <p className="text-xs text-muted-foreground">Connecting to database, please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modalMode && (
        <FeedbackModal
          mode={modalMode}
          onConfirm={(fb) => handleDecision(modalMode, fb)}
          onCancel={() => setModalMode(null)}
        />
      )}
      <PageHeader
        title={`Approval Request: ${shortId(id)}`}
        description={`Reviewing attachment plan for ${productName}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onExportPdf} disabled={!approvalReq}>
              <FileDown className="h-4 w-4 mr-1.5" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/approvals"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Approvals</Link>
            </Button>
          </div>
        }
      />

      {/* SubmitPlanContent Render (Looks exactly like PE) */}
      <div className="mt-8 border-t border-border/70 pt-8">
        <SubmitPlanContent snapshot={{ ...approvalReq?.reportSnapshot, id, sku: approvalReq?.sku }} hideActions={true} />
      </div>

      {/* Decision panel — only show if still Pending */}
      {approvalReq?.status === "Pending" && (
        isApprover ? (
          <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/30 shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-base font-semibold">Make a Decision</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Approve this attachment plan to move it to production, or reject it back to the engineer.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => setModalMode("Rejected")}>
                  <XCircle className="mr-2 h-4 w-4" /> Reject Plan
                </Button>
                <Button className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90" onClick={() => setModalMode("Approved")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 bg-muted/20 shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-base font-semibold">Status: Under Review</p>
                <p className="mt-0.5 text-sm text-muted-foreground">This attachment plan is currently waiting for Product Manager approval.</p>
              </div>
              <Badge variant="outline" className="border-[color:var(--warning)] text-[color:var(--warning-foreground)] px-3 py-1 text-xs">
                Pending
              </Badge>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
