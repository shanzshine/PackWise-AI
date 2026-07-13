import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft, Eye, CheckCircle2, Sparkles, BarChart3, Brain, ChevronRight, Info, ScanLine, ImageIcon
} from "lucide-react";
import {
  Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { loadAnalysis, saveAnalysis, savePlan, DEMO_RESULT, type AnalysisResult, type AttachmentZone } from "@/lib/workflow-store";
import { runAssemblyEngine } from "@/lib/assembly-engine";
import { ATTACHMENT_METHODS } from "@/lib/mock-data";

export const Route = createFileRoute("/app/packaging-planner")({
  head: () => ({ meta: [{ title: "Attachment Planner — PackWise AI" }] }),
  component: AttachmentPlannerPage,
});

const WORKFLOW_STEPS = [
  { label: "Product Input", active: false },
  { label: "Analysis Results", active: false },
  { label: "Attachment Planner", active: true },
  { label: "Risk Assessment", active: false },
  { label: "Cost & Sustainability", active: false },
];






const radialData = [
  { name: "Pose Quality", value: 88, fill: "var(--color-chart-1)" },
  { name: "Drop Test", value: 84, fill: "var(--color-chart-2)" },
  { name: "Cost Score", value: 72, fill: "var(--color-chart-3)" },
  { name: "Sustain.", value: 80, fill: "var(--color-chart-4)" },
];

const RISK_COLOR: Record<string, string> = {
  low: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  high: "bg-destructive/10 text-destructive border-transparent",
};

function WorkflowBar({ steps }: { steps: typeof WORKFLOW_STEPS }) {
  return (
    <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
      {steps.map((s, i, arr) => (
        <div key={s.label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${s.active ? "bg-primary text-primary-foreground" : i < steps.findIndex(x => x.active) ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground"}`}>
              {i < steps.findIndex(x => x.active) ? "✓" : i + 1}
            </div>
            <span className={`hidden text-[9px] font-medium sm:block ${s.active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
          </div>
          {i < arr.length - 1 && <div className={`mx-1 h-px flex-1 ${i < steps.findIndex(x => x.active) ? "bg-[color:var(--success)]" : s.active ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

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
          alt="Doll YOLO"
          className="max-h-[280px] max-w-full object-contain rounded drop-shadow-md block"
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
      {/* Detection count */}
      <div className="flex items-center gap-2 text-xs">
        {filteredDetections.length > 0 ? (
          <span className="bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30 rounded-full px-2 py-0.5 font-semibold">
            ✓ {filteredDetections.length} strap zone{filteredDetections.length > 1 ? "s" : ""} detected
          </span>
        ) : (
          <span className="bg-muted/50 text-muted-foreground rounded-full px-2 py-0.5">
            No straps detected in this image
          </span>
        )}
      </div>
    </div>
  );
}

// Real method properties — single source of truth for KPI calculations
const METHOD_PROPS: Record<string, { cost: number; laborMins: number; sustainability: number; stability: number; riskReduction: number }> = {
  "Elastic Strap": { cost: 0.08, laborMins: 0.5, sustainability: 68, stability: 85, riskReduction: 62 },
  "PET Support": { cost: 0.18, laborMins: 1.1, sustainability: 78, stability: 94, riskReduction: 81 },
  "EVA Strap": { cost: 0.12, laborMins: 0.7, sustainability: 82, stability: 90, riskReduction: 74 },
  "Cardboard Support": { cost: 0.15, laborMins: 0.8, sustainability: 90, stability: 95, riskReduction: 85 },
  "No Attachment Required": { cost: 0.00, laborMins: 0.0, sustainability: 100, stability: 100, riskReduction: 0 },
};

// YOLO class → zone mapping for merging detections with XGBoost
const YOLO_TO_ZONE: Record<string, { zone: string; bodyRegion: string; xgbKey: string; defaultMethod: string }> = {
  "hair_strap": { zone: "Head/Hair", bodyRegion: "Head / Hair", xgbKey: "recommended_head_strap", defaultMethod: "Elastic Strap" },
  "neck_strap": { zone: "Neck", bodyRegion: "Neck", xgbKey: "recommended_head_strap", defaultMethod: "Elastic Strap" },
  "waist_strap": { zone: "Waist", bodyRegion: "Torso / Waist", xgbKey: "recommended_waist_strap", defaultMethod: "PET Support" },
  "wrist_strap": { zone: "Hands/Wrists", bodyRegion: "Right Arm", xgbKey: "recommended_hand_strap", defaultMethod: "EVA Strap" },
  "ankle_strap": { zone: "Legs/Feet", bodyRegion: "Left Leg", xgbKey: "recommended_leg_strap", defaultMethod: "Elastic Strap" },
};

function buildZonePlan(xgbData: Record<string, any>, detections: any[], threshold: number) {
  type PlanRow = {
    zone: string;
    currentMethod: string;      // What CV sees on the product RIGHT NOW
    recommendedMethod: string;  // What AI (XGBoost) recommends
    action: "Keep" | "Add" | "Remove" | "Replace";
    cvDetected: boolean;
    xgbRecommended: boolean;
    cost: number;
    laborMins: number;
    laborLabel: string;
    sustainability: number;
    stability: number;
    riskReduction: number;
    reasoning: string;
  };

  const plan: PlanRow[] = [];
  const vizZones: AttachmentZone[] = [];

  const xgbMap: Record<string, { zone: string; bodyRegion: string; method: string }> = {
    recommended_head_strap:  { zone: "Head/Hair",    bodyRegion: "Head / Hair",   method: "Elastic Strap"     },
    recommended_waist_strap: { zone: "Waist",        bodyRegion: "Torso / Waist", method: "PET Support"       },
    recommended_hand_strap:  { zone: "Hands/Wrists", bodyRegion: "Right Arm",     method: "EVA Strap"         },
    recommended_leg_strap:   { zone: "Legs/Feet",    bodyRegion: "Left Leg",      method: "Elastic Strap"     },
    recommended_back_support:{ zone: "Back",         bodyRegion: "Back",          method: "Cardboard Support" },
    recommended_base_support:{ zone: "Base",         bodyRegion: "Base",          method: "Cardboard Support" },
  };

  // Build a map of what YOLO currently sees
  const cvDetectedZones = new Map<string, { method: string; bodyRegion: string }>();
  for (const det of detections) {
    if (det.confidence < threshold) continue;
    const mapping = YOLO_TO_ZONE[det.class_name];
    if (mapping && !cvDetectedZones.has(mapping.zone)) {
      cvDetectedZones.set(mapping.zone, { method: mapping.defaultMethod, bodyRegion: mapping.bodyRegion });
    }
  }

  // Iterate ALL possible zones from XGBoost map
  const processedZones = new Set<string>();
  for (const [key, meta] of Object.entries(xgbMap)) {
    const xgbRecommended = xgbData[key] === 1;
    const cvDetected = cvDetectedZones.has(meta.zone);
    processedZones.add(meta.zone);

    if (!xgbRecommended && !cvDetected) continue; // Neither sees it, skip

    const cvMethod = cvDetected ? (cvDetectedZones.get(meta.zone)?.method ?? "Unknown") : "None";
    const aiMethod = xgbRecommended ? meta.method : "None";
    const finalMethod = xgbRecommended ? meta.method : cvMethod;
    const p = METHOD_PROPS[finalMethod] ?? METHOD_PROPS["No Attachment Required"];
    const laborLabel = p.laborMins === 0 ? "None" : p.laborMins < 0.7 ? "Low" : "Medium";
    const risk: "low"|"medium"|"high" = finalMethod === "No Attachment Required" ? "low" : p.stability >= 92 ? "low" : p.stability >= 85 ? "medium" : "high";

    let action: "Keep" | "Add" | "Remove" | "Replace" = "Keep";
    let reasoning = "";
    if (xgbRecommended && cvDetected) {
      action = "Keep";
      reasoning = "CV confirms attachment exists, AI agrees it is needed";
    } else if (xgbRecommended && !cvDetected) {
      action = "Add";
      reasoning = "AI recommends this attachment but CV did not detect it on current product — should be added";
    } else if (!xgbRecommended && cvDetected) {
      action = "Remove";
      reasoning = "CV detected this attachment on current product but AI says it is unnecessary — can be removed to save cost";
    }

    plan.push({
      zone: meta.zone,
      currentMethod: cvDetected ? cvMethod : "—",
      recommendedMethod: xgbRecommended ? aiMethod : "Not needed",
      action,
      cvDetected,
      xgbRecommended,
      cost: p.cost,
      laborMins: p.laborMins,
      laborLabel,
      sustainability: p.sustainability,
      stability: p.stability,
      riskReduction: p.riskReduction,
      reasoning,
    });

    if (action !== "Remove") {
      vizZones.push({ zone: meta.bodyRegion.split("/")[0].trim(), bodyRegion: meta.bodyRegion, riskLevel: risk, recommendedMethod: finalMethod });
    }
  }

  // Add any CV-detected zones not in xgbMap (edge case)
  for (const [zone, cv] of cvDetectedZones) {
    if (!processedZones.has(zone)) {
      const p = METHOD_PROPS[cv.method] ?? METHOD_PROPS["No Attachment Required"];
      const laborLabel = p.laborMins === 0 ? "None" : p.laborMins < 0.7 ? "Low" : "Medium";
      plan.push({
        zone,
        currentMethod: cv.method,
        recommendedMethod: "Not needed",
        action: "Remove",
        cvDetected: true,
        xgbRecommended: false,
        cost: p.cost,
        laborMins: p.laborMins,
        laborLabel,
        sustainability: p.sustainability,
        stability: p.stability,
        riskReduction: p.riskReduction,
        reasoning: "CV detected this but AI deems it unnecessary",
      });
    }
  }

  if (plan.length === 0) {
    plan.push({
      zone: "General", currentMethod: "—", recommendedMethod: "No Attachment Required",
      action: "Keep", cvDetected: false, xgbRecommended: false,
      cost: 0, laborMins: 0, laborLabel: "None", sustainability: 100, stability: 100, riskReduction: 0,
      reasoning: "No attachments needed",
    });
  }

  return { plan, vizZones };
}

function AttachmentPlannerPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [zonePlan, setZonePlan] = useState<ReturnType<typeof buildZonePlan>["plan"]>([]);
  const [recommendedMaterial, setRecommendedMaterial] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.15);
  const [xgbData, setXgbData] = useState<any>(null);

  useEffect(() => {
    const a = loadAnalysis() ?? DEMO_RESULT;
    setAnalysis(a);

    async function fetchPredictions() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/predict-packaging", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_family: a.product_family ?? "Fashionistas",
            articulation: a.articulation ?? "Standard",
            pose: a.pose ?? "Arms Open",
            product_weight_g: a.product_weight_g ?? 120,
            height_cm: a.height_cm ?? 29.0,
            center_of_gravity: a.center_of_gravity ?? "Center",
            hair_length: a.hair_length ?? "Short",
            dress_length: a.dress_length ?? "Short",
            accessory_count: a.accessory_count ?? 1,
            accessory_weight_g: a.accessory_weight_g ?? 15,
            selected_accessories: a.selected_accessories ?? []
          })
        });
        const data = await res.json();
        setXgbData(data);
        setRecommendedMaterial(data.recommended_material ?? null);
      } catch (err) {
        console.error("Failed to fetch predictions", err);
      }
    }

    fetchPredictions();
  }, []);

  useEffect(() => {
    if (xgbData && analysis) {
      const detections = analysis.cvDetections ?? [];
      const { plan: newPlan, vizZones: newAttachmentZones } = buildZonePlan(xgbData, detections, threshold);
      setZonePlan(newPlan);
      saveAnalysis({ ...analysis, attachmentZones: newAttachmentZones });

      // Persist plan for Cost & Sustainability page
      const active = newPlan.filter(z => z.action !== "Remove" && z.recommendedMethod !== "Not needed");
      savePlan({
        zones: newPlan.map(z => ({
          zone: z.zone, currentMethod: z.currentMethod, recommendedMethod: z.recommendedMethod,
          action: z.action, cvDetected: z.cvDetected, xgbRecommended: z.xgbRecommended,
          cost: z.cost, laborMins: z.laborMins, sustainability: z.sustainability,
          stability: z.stability, riskReduction: z.riskReduction,
        })),
        totalCost: parseFloat(active.reduce((s, z) => s + z.cost, 0).toFixed(2)),
        avgStability: active.length > 0 ? Math.round(active.reduce((s, z) => s + z.stability, 0) / active.length) : 100,
        avgSustainability: active.length > 0 ? Math.round(active.reduce((s, z) => s + z.sustainability, 0) / active.length) : 100,
        recommendedMaterial,
      });
    }
  }, [xgbData, analysis, threshold]);

  const productName = analysis?.productName ?? "Glamour Doll – Sparkle Edition";

  // Run user's custom Assembly Engine rules
  const engineInput = {
    weightGrams: analysis?.product_weight_g ?? 120,
    accessories: analysis?.selected_accessories ?? [],
    skeletonKeypoints: analysis?.raw_keypoints ?? [],
    poseComplexityScore: analysis?.poseComplexityScore ?? 0,
  };
  const assemblyResult = runAssemblyEngine(engineInput);

  // Real computed KPIs from zone plan
  const activeZones = zonePlan.filter(z => z.action !== "Remove" && z.recommendedMethod !== "No Attachment Required" && z.recommendedMethod !== "Not needed");
  const totalCost = activeZones.reduce((s, z) => s + z.cost, 0).toFixed(2);
  const totalLaborMins = assemblyResult.assembly_time_seconds / 60; // Use DFA Engine instead of simple sum!
  const avgStability = activeZones.length > 0
    ? Math.round(activeZones.reduce((s, z) => s + z.stability, 0) / activeZones.length)
    : 100;
  const avgSustainability = activeZones.length > 0
    ? Math.round(activeZones.reduce((s, z) => s + z.sustainability, 0) / activeZones.length)
    : 100;
  const keepCount = zonePlan.filter(z => z.action === "Keep").length;
  const addCount = zonePlan.filter(z => z.action === "Add").length;
  const removeCount = zonePlan.filter(z => z.action === "Remove").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attachment Planner"
        description={`AI-recommended attachment methods for each attachment zone — ${productName}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/product-analysis" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Analysis
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })}>
              Proceed to Risk Assessment <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        }
      />
      <WorkflowBar steps={WORKFLOW_STEPS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/70 shadow-none overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" /> YOLO Vision Detections
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col items-center justify-center bg-zinc-950/5 relative min-h-[300px]">
            {analysis?.imageDataUrl ? (
              <YoloImageOverlay imageUrl={analysis.imageDataUrl} detections={analysis.cvDetections || []} threshold={threshold} />
            ) : (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 opacity-20" />
                No image uploaded
              </div>
            )}
          </CardContent>
          {analysis?.imageDataUrl && (
            <div className="p-4 border-t border-border/50 bg-background/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Confidence Threshold</span>
                <span className="text-xs font-semibold">{Math.round(threshold * 100)}%</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={([val]) => setThreshold(val)}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 border-[color:var(--primary)]/30 bg-gradient-to-br from-[color:var(--primary-soft)] to-[color:var(--primary-soft)]/20 shadow-none">
          <CardContent className="p-6 h-full flex flex-col justify-center">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">AI Recommended Plan</Badge>
                </div>
                <h2 className="text-xl font-semibold">Mixed Attachment Strategy</h2>
                <p className="text-sm text-muted-foreground max-w-[300px]">
                  {recommendedMaterial ? `Recommended Material: ${recommendedMaterial}. ` : ""}
                  AI generated optimized plan for pose quality and sustainability balance.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Avg. Pose Stability", value: `${avgStability}%` },
                  { label: "Total Cost / Unit", value: `$${totalCost}` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center bg-background/50 rounded-xl p-4 border border-border/50">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avg. Pose Stability", value: `${avgStability}%`, hint: `${activeZones.length} active attachment zones` },
          { label: "Total Cost / Unit", value: `$${totalCost}`, hint: removeCount > 0 ? `Saving possible by removing ${removeCount} zone(s)` : "All recommended materials" },
          { label: "Action Summary", value: `${keepCount} Keep · ${addCount} Add · ${removeCount} Remove`, hint: `${zonePlan.length} zones analyzed` },
          { label: "Sustainability Score", value: `${avgSustainability}/100`, hint: "Weighted avg across recommended materials" },
        ].map(({ label, value, hint }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current vs Recommended Comparison */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Current vs AI Recommendation</CardTitle>
            <CardDescription>Comparing what CV detects on the current product vs what the 7 AI models recommend</CardDescription>
          </div>
          <Badge variant="outline" className="border-border/70 text-xs font-normal">
            <Brain className="mr-1 h-3 w-3" /> AI + CV Analysis
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead className="text-center">Current (CV Detected)</TableHead>
                <TableHead className="text-center">AI Recommendation</TableHead>
                <TableHead className="text-center">Action</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Stability</TableHead>
                <TableHead>Reasoning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zonePlan.map((z) => (
                <TableRow key={z.zone} className={
                  z.action === "Keep"   ? "bg-[color:var(--success)]/5" :
                  z.action === "Add"    ? "bg-blue-500/5" :
                  z.action === "Remove" ? "bg-destructive/5" : ""
                }>
                  <TableCell className="font-medium">{z.zone}</TableCell>
                  {/* Current — what YOLO sees */}
                  <TableCell className="text-center">
                    {z.cvDetected ? (
                      <Badge className="bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/30 text-[10px]">
                        <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> {z.currentMethod}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not detected</span>
                    )}
                  </TableCell>
                  {/* AI Recommendation */}
                  <TableCell className="text-center">
                    {z.xgbRecommended ? (
                      <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                        <Brain className="mr-1 h-2.5 w-2.5" /> {z.recommendedMethod}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not needed</span>
                    )}
                  </TableCell>
                  {/* Action */}
                  <TableCell className="text-center">
                    {z.action === "Keep" && (
                      <Badge className="bg-[color:var(--success)] text-white border-0 font-semibold shadow-sm">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Keep
                      </Badge>
                    )}
                    {z.action === "Add" && (
                      <Badge className="bg-blue-500 text-white border-0 font-semibold shadow-sm">
                        Add
                      </Badge>
                    )}
                    {z.action === "Remove" && (
                      <Badge variant="destructive" className="font-semibold shadow-sm">
                        Remove
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {z.cost === 0 ? <span className="text-muted-foreground">—</span> : `$${z.cost.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right">
                    {z.stability > 0 ? (
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={z.stability} className="h-1.5 w-12" />
                        <span className="tabular-nums text-xs">{z.stability}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground leading-tight">{z.reasoning}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Action Legend */}
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> How to Read This Comparison
            </CardTitle>
            <CardDescription>The system compares what's currently on the product (CV) vs what AI recommends, then suggests an action</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 pt-4">

            <div className="flex flex-col gap-2 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/5 p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-[color:var(--success)] hover:bg-[color:var(--success)] text-white shadow-sm border-0 font-medium"><CheckCircle2 className="mr-1 h-3 w-3" /> Keep</Badge>
              </div>
              <p className="text-sm font-semibold mt-1">Current = Correct</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                CV detected this attachment on the current product, and the AI model confirms it <strong>should be there</strong>. No change needed.
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium shadow-sm">Add</Badge>
              </div>
              <p className="text-sm font-semibold mt-1">Missing Attachment</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                CV did <strong>not</strong> detect this on the current product, but the AI model says it <strong>should be added</strong> for safety/stability.
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="font-medium shadow-sm">Remove</Badge>
              </div>
              <p className="text-sm font-semibold mt-1">Unnecessary Attachment</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                CV detected this attachment on the current product, but the AI model says it's <strong>not necessary</strong>. Removing it can save cost.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Radial Chart */}
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Plan Score Breakdown</CardTitle>
            <CardDescription>Recommended plan evaluation across 4 dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="25%" outerRadius="100%" data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" background={{ fill: "var(--color-muted)" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {radialData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                  <span className="text-xs text-muted-foreground">{d.name}: <strong className="text-foreground">{d.value}%</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Methods Table */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Attachment Method Comparison</CardTitle>
          <CardDescription>Compare Pose stability, risk reduction & sustainability across all available methods</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Cost/Unit</TableHead>
                <TableHead className="text-right">Sustainability</TableHead>
                <TableHead className="text-right">Labor (min)</TableHead>
                <TableHead className="text-right">Pose Stability</TableHead>
                <TableHead className="text-right">Risk Reduction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...ATTACHMENT_METHODS].map((m) => {
                const isRec = ["Elastic Strap", "PET Support", "EVA Strap"].includes(m.method);
                return (
                  <TableRow key={m.method} className={isRec ? "bg-[color:var(--primary-soft)]/20" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isRec && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        {m.method}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.material}</TableCell>
                    <TableCell className="text-right tabular-nums">${m.costPerUnit.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={m.sustainability} className="h-1.5 w-12" />
                        <span className="tabular-nums text-xs">{m.sustainability}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{m.laborMins}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{m.poseStability}%</TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs font-semibold text-[color:var(--success)]">-{m.riskReduction}%</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold">Proceed to Risk Assessment</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Analyze potential packaging risks and mitigations based on the plan.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })} className="shrink-0">
            Risk Assessment <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
