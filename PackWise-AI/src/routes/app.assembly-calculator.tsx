import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, Sparkles, RotateCcw, Copy, CheckCheck, Plus, X, ChevronDown, ChevronUp, Zap, Package, Clock, Target, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { runAssemblyEngine, type EngineInput, type EngineOutput, type MaterialOption } from "@/lib/assembly-engine";

export const Route = createFileRoute("/app/assembly-calculator")({
  head: () => ({ meta: [{ title: "Assembly Calculator — PackWise AI" }] }),
  component: AssemblyCalculatorPage,
});

const MATERIALS: MaterialOption[] = [
  "Rubber Band", "Elastic Strap", "EVA Strap",
  "Blister", "Inner Tray", "PET Support", "Cardboard Support", "Fastener",
];

const RISK_DOT: Record<string, string> = {
  low: "bg-[color:var(--success)]",
  medium: "bg-[color:var(--warning)]",
  high: "bg-destructive",
};

function JsonViewer({ data }: { data: EngineOutput }) {
  const [copied, setCopied] = useState(false);

  const exportObj = {
    retention_zones: data.retention_zones.map((z) => ({
      zone: z.zone,
      body_region: z.bodyRegion,
      keypoint_source: z.keypointSource,
      reason: z.reason,
    })),
    recommended_material: data.recommended_material,
    attachment_points: data.attachment_points,
    assembly_time_seconds: data.assembly_time_seconds,
    is_complex_pose: data.is_complex_pose,
    calculation_breakdown: data.calculation_breakdown,
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">JSON Output</CardTitle>
          <CardDescription>Pure JSON — ready for YOLOv8 pipeline integration</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={copy} id="copy-json-btn">
          {copied ? <><CheckCheck className="h-3.5 w-3.5 text-[color:var(--success)]" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 text-[11px] leading-relaxed text-foreground font-mono border border-border/60 max-h-80">
          {jsonStr}
        </pre>
      </CardContent>
    </Card>
  );
}

function AssemblyCalculatorPage() {
  const [weight, setWeight] = useState("");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [accessoryInput, setAccessoryInput] = useState("");
  const [skeletonJson, setSkeletonJson] = useState("");
  const [poseScore, setPoseScore] = useState("");
  const [result, setResult] = useState<EngineOutput | null>(null);
  const [skeletonError, setSkeletonError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);

  const addAccessory = () => {
    const trimmed = accessoryInput.trim();
    if (trimmed && !accessories.includes(trimmed)) {
      setAccessories((prev) => [...prev, trimmed]);
    }
    setAccessoryInput("");
  };

  const removeAccessory = (a: string) =>
    setAccessories((prev) => prev.filter((x) => x !== a));

  const handleRun = () => {
    setSkeletonError("");
    let keypoints: EngineInput["skeletonKeypoints"] | undefined;

    if (skeletonJson.trim()) {
      try {
        const parsed = JSON.parse(skeletonJson.trim());
        const arr = Array.isArray(parsed) ? parsed : parsed?.keypoints ?? parsed?.predictions ?? null;
        if (!Array.isArray(arr)) throw new Error("Expected an array of keypoints");
        keypoints = arr;
      } catch (e: unknown) {
        setSkeletonError(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
    }

    const input: EngineInput = {
      weightGrams: parseFloat(weight) || 0,
      accessories,
      skeletonKeypoints: keypoints,
      poseComplexityScore: parseFloat(poseScore) || 0,
    };

    setResult(runAssemblyEngine(input));
  };

  const handleReset = () => {
    setWeight(""); setAccessories([]); setAccessoryInput("");
    setSkeletonJson(""); setPoseScore(""); setResult(null); setSkeletonError("");
  };

  const canRun = weight.trim() !== "" && parseFloat(weight) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assembly Time Calculator"
        description="Senior Packaging IE heuristic engine — enter product data to get optimal attachment system and DFA/MTM assembly time."
        actions={<Badge variant="outline" className="border-border/70 font-normal"><Sparkles className="mr-1 h-3 w-3 text-primary" />DFA / MTM</Badge>}
      />

      {!result ? (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Input form */}
          <div className="space-y-5 lg:col-span-3">
            {/* Product Weight */}
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Product Data</CardTitle>
                <CardDescription>Enter weight and accessories. Skeleton coordinates are optional — defaults will be used if omitted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight-input">Product Weight (grams) <span className="text-destructive">*</span></Label>
                  <Input
                    id="weight-input"
                    type="number"
                    min="0"
                    placeholder="e.g. 185"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                {/* Accessories */}
                <div className="space-y-2">
                  <Label>Accessories</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accessory-input"
                      placeholder="e.g. Handbag, Crown, Shoes…"
                      value={accessoryInput}
                      onChange={(e) => setAccessoryInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAccessory(); } }}
                    />
                    <Button variant="outline" size="sm" onClick={addAccessory} id="add-accessory-btn">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {accessories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {accessories.map((a) => (
                        <Badge key={a} variant="secondary" className="gap-1 bg-[color:var(--primary-soft)] text-primary">
                          {a}
                          <button onClick={() => removeAccessory(a)} className="ml-0.5 hover:opacity-70">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pose Complexity Score */}
                <div className="space-y-2">
                  <Label htmlFor="pose-score-input">Pose Complexity Score (0–100)</Label>
                  <Input
                    id="pose-score-input"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 82 — from Product Analysis page"
                    value={poseScore}
                    onChange={(e) => setPoseScore(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">≥ 70 triggers the complex-pose +15% assembly time penalty.</p>
                </div>
              </CardContent>
            </Card>

            {/* Skeleton JSON (collapsible) */}
            <Card className="border-border/70 shadow-none">
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setShowSkeleton((v) => !v)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">YOLOv8 Skeleton Coordinates</CardTitle>
                    <CardDescription>Optional — paste your JSON keypoint array. Engine uses heuristic zones if empty.</CardDescription>
                  </div>
                  {showSkeleton ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardHeader>
              {showSkeleton && (
                <CardContent className="space-y-3">
                  <textarea
                    id="skeleton-json-input"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-36 resize-y"
                    placeholder={`[\n  { "name": "left_wrist", "x": 0.32, "y": 0.78, "confidence": 0.91 },\n  { "name": "right_wrist", "x": 0.68, "y": 0.41, "confidence": 0.87 },\n  ...\n]`}
                    value={skeletonJson}
                    onChange={(e) => setSkeletonJson(e.target.value)}
                  />
                  {skeletonError && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{skeletonError}
                    </p>
                  )}
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs font-semibold mb-1">Expected keypoint names (COCO format)</p>
                    <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                      nose · left_eye · right_eye · left_ear · right_ear ·<br />
                      left_shoulder · right_shoulder · left_elbow · right_elbow ·<br />
                      left_wrist · right_wrist · left_hip · right_hip ·<br />
                      left_knee · right_knee · left_ankle · right_ankle
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            <Button size="lg" className="w-full" onClick={handleRun} disabled={!canRun} id="run-engine-btn">
              <Calculator className="h-4 w-4" /> Run Assembly Engine
            </Button>
          </div>

          {/* Info sidebar */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="border-border/70 shadow-none bg-[color:var(--primary-soft)]/40">
              <CardHeader>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Calculator className="h-4 w-4" />
                </div>
                <CardTitle className="text-base mt-2">Calculation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Blister / Inner Tray", desc: "Flat rate → 15 s per unit" },
                  { label: "Elastic / Rubber Band", desc: "2.5 s – 3.0 s per attachment point" },
                  { label: "EVA / PET / Cardboard", desc: "3.2 s – 3.8 s per attachment point" },
                  { label: "Fastener", desc: "4.0 s per attachment point" },
                  { label: "Complex Pose Penalty", desc: "+15% on total assembly time" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded bg-primary/10 text-primary">
                      <Zap className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold">Material Priority Matrix</p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">≥ 400 g or ≥ 6 zones</span> → Blister</p>
                  <p><span className="font-medium text-foreground">≥ 250 g or ≥ 4 zones</span> → Inner Tray</p>
                  <p><span className="font-medium text-foreground">Complex + ≥ 3 zones</span> → EVA Strap</p>
                  <p><span className="font-medium text-foreground">≥ 3 zones</span> → PET Support</p>
                  <p><span className="font-medium text-foreground">≥ 150 g</span> → EVA Strap</p>
                  <p><span className="font-medium text-foreground">≥ 80 g</span> → Elastic Strap</p>
                  <p><span className="font-medium text-foreground">Light / simple</span> → Rubber Band</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ─── Results ─────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Recommended Material",
                value: result.recommended_material,
                sub: "Optimal for weight & zone count",
                icon: Package,
                color: "text-primary",
              },
              {
                label: "Attachment Points",
                value: `${result.attachment_points}`,
                sub: "Minimum required",
                icon: Target,
                color: "text-foreground",
              },
              {
                label: "Assembly Time",
                value: `${result.assembly_time_seconds}s`,
                sub: result.is_complex_pose ? "Incl. +15% complexity penalty" : "Standard rate",
                icon: Clock,
                color: result.assembly_time_seconds > 20 ? "text-[color:var(--warning-foreground)]" : "text-[color:var(--success)]",
              },
              {
                label: "Pose Complexity",
                value: result.is_complex_pose ? "Complex" : "Standard",
                sub: result.is_complex_pose ? "Penalty applied" : "No penalty",
                icon: AlertTriangle,
                color: result.is_complex_pose ? "text-[color:var(--warning-foreground)]" : "text-[color:var(--success)]",
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label} className="border-border/70 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  </div>
                  <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Retention Zones */}
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Retention Zones ({result.retention_zones.length})</CardTitle>
                <CardDescription>
                  {result.retention_zones[0]?.keypointSource === "heuristic"
                    ? "Derived from packaging heuristics — add skeleton JSON for precision"
                    : "Derived from YOLOv8 skeleton keypoints"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.retention_zones.map((z, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${RISK_DOT.medium}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{z.zone}</p>
                        <Badge variant="outline" className="text-[10px] border-border/70 font-normal">{z.bodyRegion}</Badge>
                        {z.keypointSource !== "heuristic" && (
                          <Badge variant="secondary" className="text-[10px] font-mono">{z.keypointSource}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{z.reason}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Calculation Breakdown */}
            <div className="space-y-4">
              <Card className="border-border/70 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Calculation Breakdown</CardTitle>
                  <CardDescription>Step-by-step DFA/MTM assembly time derivation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.calculation_breakdown.split(" | ").map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Material pill */}
              <Card className="border-[color:var(--primary)]/25 bg-[color:var(--primary-soft)]/30 shadow-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{result.recommended_material}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.attachment_points} attachment point{result.attachment_points !== 1 ? "s" : ""} ·{" "}
                      {result.assembly_time_seconds}s total assembly
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* JSON Output */}
          <JsonViewer data={result} />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} id="reset-calculator-btn">
              <RotateCcw className="h-4 w-4" /> New Calculation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
