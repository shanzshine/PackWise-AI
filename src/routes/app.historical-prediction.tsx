import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  Loader2,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAllWorkflowData, saveAnalysis, type AnalysisResult } from "@/lib/workflow-store";

export const Route = createFileRoute("/app/historical-prediction")({
  head: () => ({ meta: [{ title: "Historical ML Prediction — PackWise AI" }] }),
  component: HistoricalPredictionPage,
});

type Prediction = Record<string, string | number | boolean | null>;

const recommendationFields = [
  ["recommended_head_strap", "Head / hair strap"],
  ["recommended_waist_strap", "Waist strap"],
  ["recommended_hand_strap", "Hand strap"],
  ["recommended_leg_strap", "Leg strap"],
  ["recommended_back_support", "Back support"],
  ["recommended_base_support", "Base support"],
] as const;

function isRecommended(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return ["1", "true", "yes", "recommended", "required"].includes(String(value).toLowerCase());
}

function HistoricalPredictionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [productFamily, setProductFamily] = useState("Fashionistas");
  const [articulation, setArticulation] = useState("Standard");
  const [pose, setPose] = useState("Arms Open");
  const [weight, setWeight] = useState(120);
  const [height, setHeight] = useState(29);
  const [centerOfGravity, setCenterOfGravity] = useState("Center");
  const [hairLength, setHairLength] = useState("Short");
  const [dressLength, setDressLength] = useState("Short");
  const [accessoryCount, setAccessoryCount] = useState(1);
  const [accessoryWeight, setAccessoryWeight] = useState(15);
  const [complexityScore, setComplexityScore] = useState(5);
  const [stabilityIndex, setStabilityIndex] = useState(5);
  const [fragilityScore, setFragilityScore] = useState(5);
  const [fragileParts, setFragileParts] = useState(1);

  const accessories = useMemo(
    () => Array.from({ length: Math.max(0, accessoryCount) }, (_, index) => `Accessory ${index + 1}`),
    [accessoryCount],
  );

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/predict-packaging`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_family: productFamily,
          articulation,
          pose,
          product_weight_g: weight,
          height_cm: height,
          center_of_gravity: centerOfGravity,
          hair_length: hairLength,
          dress_length: dressLength,
          accessory_count: accessoryCount,
          accessory_weight_g: accessoryWeight,
          complexity_score: complexityScore,
          stability_index: stabilityIndex,
          fragility_score: fragilityScore,
          attachment_needed: 1,
          fragile_parts_count: fragileParts,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Prediction failed (${response.status})`);
      }

      const data = await response.json() as Prediction;
      const nextAnalysis: AnalysisResult = {
        id: crypto.randomUUID(),
        productName: `${productFamily} New Product`,
        category: "Historical ML Prediction",
        imageDataUrl: null,
        productType: "Fashion Doll",
        dimensions: `${height} cm height`,
        analysedAt: new Date().toISOString(),
        product_family: productFamily,
        articulation,
        pose,
        product_weight_g: weight,
        height_cm: height,
        center_of_gravity: centerOfGravity,
        hair_length: hairLength,
        dress_length: dressLength,
        accessory_count: accessoryCount,
        accessory_weight_g: accessoryWeight,
        selected_accessories: accessories,
        cvDetections: [],
        raw_keypoints: [],
        accessories,
        bodyRegions: ["Head / Hair", "Torso / Waist", "Hands / Wrists", "Legs / Feet", "Back", "Base"],
        attachmentZones: [],
        poseComplexityScore: complexityScore * 10,
        poseStabilityScore: stabilityIndex * 10,
        movementRiskScore: Math.max(0, 100 - stabilityIndex * 10),
        accessoryLossRisk: Math.min(100, accessoryCount * 10 + fragilityScore * 5),
      };

      clearAllWorkflowData();
      saveAnalysis(nextAnalysis);
      setAnalysis(nextAnalysis);
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the prediction service.");
    } finally {
      setLoading(false);
    }
  };

  const openPlanner = () => {
    if (analysis) saveAnalysis(analysis);
    navigate({ to: "/app/packaging-planner" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical ML Prediction"
        description="Enter the new product's engineering attributes to predict straps, supports, and material from previous packaging data."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/analysis-method" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Change method
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg"><Database className="h-5 w-5 text-primary" /> New Product Data</CardTitle>
                <CardDescription className="mt-1">No image is required. Fields match the historical model's training features.</CardDescription>
              </div>
              <Badge variant="secondary">XGBoost</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Product family">
                <Select value={productFamily} onChange={setProductFamily} options={["Dreamtopia", "Fashionistas", "Careers", "Signature", "Extra", "Made to Move"]} />
              </Field>
              <Field label="Articulation">
                <Select value={articulation} onChange={setArticulation} options={["Standard", "Made to Move", "Curvy"]} />
              </Field>
              <Field label="Pose">
                <Select value={pose} onChange={setPose} options={["Arms Open", "Standing Neutral", "Arms Raised", "Sitting"]} />
              </Field>
              <NumberField label="Weight (g)" value={weight} onChange={setWeight} min={1} />
              <NumberField label="Height (cm)" value={height} onChange={setHeight} min={1} step={0.1} />
              <Field label="Center of gravity">
                <Select value={centerOfGravity} onChange={setCenterOfGravity} options={["Center", "Front", "Back", "Left", "Right"]} />
              </Field>
              <Field label="Hair length">
                <Select value={hairLength} onChange={setHairLength} options={["Short", "Medium", "Long", "Very Long"]} />
              </Field>
              <Field label="Dress / pants length">
                <Select value={dressLength} onChange={setDressLength} options={["Short", "Knee", "Long"]} />
              </Field>
              <NumberField label="Accessory count" value={accessoryCount} onChange={setAccessoryCount} min={0} />
              <NumberField label="Total accessory weight (g)" value={accessoryWeight} onChange={setAccessoryWeight} min={0} step={0.1} />
              <NumberField label="Complexity score (1–10)" value={complexityScore} onChange={setComplexityScore} min={1} max={10} />
              <NumberField label="Stability index (1–10)" value={stabilityIndex} onChange={setStabilityIndex} min={1} max={10} />
              <NumberField label="Fragility score (1–10)" value={fragilityScore} onChange={setFragilityScore} min={1} max={10} />
              <NumberField label="Fragile parts" value={fragileParts} onChange={setFragileParts} min={0} />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Prediction service unavailable</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button size="lg" className="w-full" disabled={loading} onClick={runPrediction}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
              {loading ? "Running historical model..." : "Predict packaging requirements"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><PackageCheck className="h-5 w-5 text-primary" /> Predicted Configuration</CardTitle>
              <CardDescription>Recommendations become available after the model runs.</CardDescription>
            </CardHeader>
            <CardContent>
              {!prediction ? (
                <div className="flex min-h-[310px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BrainCircuit className="h-7 w-7" /></div>
                  <p className="mt-4 text-sm font-medium">Waiting for product data</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">Run the historical model to see which attachment zones and supports are recommended.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {recommendationFields.map(([key, label]) => {
                      const recommended = isRecommended(prediction[key]);
                      return (
                        <div key={key} className={`flex items-center gap-3 rounded-lg border p-3 ${recommended ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/20"}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${recommended ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {recommended ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{label}</p>
                            <p className="text-[11px] text-muted-foreground">{recommended ? "Recommended" : "Not required"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <p className="text-xs text-muted-foreground">Recommended material</p>
                    <p className="mt-1 text-lg font-semibold">{String(prediction.recommended_material ?? "Model default")}</p>
                  </div>
                  <Button size="lg" className="w-full" onClick={openPlanner}>
                    Open Attachment Planner <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>The Attachment Planner will turn these predictions into zone-by-zone methods, quantities, cost, labor, and sustainability estimates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function NumberField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min: number; max?: number; step?: number }) {
  return (
    <Field label={label}>
      <Input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </Field>
  );
}
