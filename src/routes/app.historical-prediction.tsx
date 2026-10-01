import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  Layers3,
  Loader2,
  Package,
  PackageCheck,
  RefreshCw,
  Ruler,
  Scale,
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
import { clearAllWorkflowData, saveAnalysis, type AnalysisResult, type PackagingPrediction } from "@/lib/workflow-store";

export const Route = createFileRoute("/app/historical-prediction")({
  head: () => ({ meta: [{ title: "Historical ML Prediction - PackWise AI" }] }),
  component: HistoricalPredictionPage,
});

type Prediction = PackagingPrediction;
type FormStep = 1 | 2 | 3;

const FORM_STEPS: Array<{ id: FormStep; label: string; shortLabel: string }> = [
  { id: 1, label: "Product basics", shortLabel: "Basics" },
  { id: 2, label: "Packaging factors", shortLabel: "Factors" },
  { id: 3, label: "Review & predict", shortLabel: "Review" },
];

const PRODUCT_PRESETS: Record<string, {
  articulation: string;
  weight: number;
  height: number;
  hairLength: string;
  dressLength: string;
  complexity: number;
  stability: number;
  fragility: number;
}> = {
  Dreamtopia: { articulation: "Standard", weight: 120, height: 29, hairLength: "Long", dressLength: "Long", complexity: 7, stability: 5, fragility: 4 },
  Fashionistas: { articulation: "Standard", weight: 120, height: 29, hairLength: "Short", dressLength: "Short", complexity: 3, stability: 8, fragility: 4 },
  Careers: { articulation: "Standard", weight: 125, height: 29, hairLength: "Medium", dressLength: "Knee", complexity: 5, stability: 7, fragility: 4 },
  Signature: { articulation: "Standard", weight: 130, height: 29, hairLength: "Long", dressLength: "Long", complexity: 8, stability: 6, fragility: 4 },
  Extra: { articulation: "Curvy", weight: 145, height: 29, hairLength: "Very Long", dressLength: "Short", complexity: 6, stability: 6, fragility: 4 },
  "Made to Move": { articulation: "Made to Move", weight: 135, height: 29, hairLength: "Medium", dressLength: "Short", complexity: 7, stability: 5, fragility: 4 },
};

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
  const [step, setStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [productName, setProductName] = useState("New Fashionistas Product");
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
  const [fragileParts, setFragileParts] = useState(1);

  const historicalProfile = PRODUCT_PRESETS[productFamily] ?? PRODUCT_PRESETS.Fashionistas;
  const complexityScore = historicalProfile.complexity;
  const stabilityIndex = historicalProfile.stability;
  const fragilityScore = historicalProfile.fragility;

  const accessories = useMemo(
    () => Array.from({ length: Math.max(0, accessoryCount) }, (_, index) => `Accessory ${index + 1}`),
    [accessoryCount],
  );

  useEffect(() => {
    setPrediction(null);
    setAnalysis(null);
    setError(null);
  }, [
    productName,
    productFamily,
    articulation,
    pose,
    weight,
    height,
    centerOfGravity,
    hairLength,
    dressLength,
    accessoryCount,
    accessoryWeight,
    fragileParts,
  ]);

  const applyFamilyPreset = (family: string) => {
    const previousDefaultName = `New ${productFamily} Product`;
    setProductFamily(family);
    if (!productName.trim() || productName === previousDefaultName) {
      setProductName(`New ${family} Product`);
    }

    const preset = PRODUCT_PRESETS[family];
    if (!preset) return;
    setArticulation(preset.articulation);
    setWeight(preset.weight);
    setHeight(preset.height);
    setHairLength(preset.hairLength);
    setDressLength(preset.dressLength);
  };

  const resetDefaults = () => {
    const preset = PRODUCT_PRESETS[productFamily];
    if (!preset) return;
    setArticulation(preset.articulation);
    setWeight(preset.weight);
    setHeight(preset.height);
    setHairLength(preset.hairLength);
    setDressLength(preset.dressLength);
    setPose("Arms Open");
    setCenterOfGravity("Center");
    setAccessoryCount(1);
    setAccessoryWeight(15);
    setFragileParts(1);
  };

  const canContinue = productName.trim().length > 0 && weight > 0 && height > 0;

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
        throw new Error(`Prediction service returned ${response.status}. Please make sure the backend is running.`);
      }

      const data = await response.json() as Prediction;
      const nextAnalysis: AnalysisResult = {
        id: crypto.randomUUID(),
        productName: productName.trim(),
        category: "Historical ML Prediction",
        imageDataUrl: null,
        productType: "Fashion Doll",
        dimensions: `${height} cm height`,
        analysedAt: new Date().toISOString(),
        analysisMode: "historical-ml",
        mlPrediction: data,
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
        description="Create a packaging recommendation for a new product - no photo or physical sample needed."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/analysis-method" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Change method
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.75fr)]">
        <Card className="overflow-hidden border-border/70 shadow-none">
          <div className="border-b border-border/70 bg-muted/20 px-5 py-5 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">New Product Input</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">About 2 minutes to complete</p>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={resetDefaults}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reset defaults
              </Button>
            </div>
            <StepIndicator currentStep={step} />
          </div>

          <CardContent className="p-5 sm:p-6">
            {step === 1 && (
              <div className="space-y-6">
                <SectionHeading
                  icon={<Package className="h-5 w-5" />}
                  title="Tell us about the product"
                  description="Start with the information normally available on a product specification sheet."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Product name" hint="Use a name your team will recognize" className="sm:col-span-2">
                    <Input value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="e.g. Dreamtopia Mermaid Doll" />
                  </Field>
                  <Field label="Product family" hint="Selecting a family applies editable defaults">
                    <Select value={productFamily} onChange={applyFamilyPreset} options={Object.keys(PRODUCT_PRESETS)} />
                  </Field>
                  <Field label="Articulation" hint="How flexible are the body joints?">
                    <Select value={articulation} onChange={setArticulation} options={["Standard", "Made to Move", "Curvy"]} />
                  </Field>
                  <Field label="Display pose" hint="Main pose inside the retail package">
                    <Select value={pose} onChange={setPose} options={["Arms Open", "Standing Straight", "One Hand Up", "Two Hands Up", "One Hand on Hip", "One Leg Bent", "Walking", "Sitting"]} />
                  </Field>
                  <Field label="Center of gravity" hint="Where most of the product weight sits">
                    <Select value={centerOfGravity} onChange={setCenterOfGravity} options={["Center", "Back", "Left"]} />
                  </Field>
                  <NumberField label="Product weight" hint="Product only, without accessories" value={weight} onChange={setWeight} min={1} unit="g" />
                  <NumberField label="Product height" hint="Top to bottom in display pose" value={height} onChange={setHeight} min={1} step={0.1} unit="cm" />
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We applied typical values for <strong className="text-foreground">{productFamily}</strong>. Review and adjust them if this product is different.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <SectionHeading
                  icon={<Layers3 className="h-5 w-5" />}
                  title="Packaging factors"
                  description="Add styling, accessories, and simple engineering ratings. Exact lab values are not required."
                />

                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Style and accessories</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Hair length" hint="Longer hair may need extra retention">
                      <Select value={hairLength} onChange={setHairLength} options={["Short", "Medium", "Long", "Very Long"]} />
                    </Field>
                    <Field label="Clothing length" hint="Longest dress or pants layer">
                      <Select value={dressLength} onChange={setDressLength} options={["Short", "Knee", "Long"]} />
                    </Field>
                    <NumberField label="Number of accessories" hint="Count all loose items in the pack" value={accessoryCount} onChange={setAccessoryCount} min={0} unit="items" />
                    <NumberField label="Combined accessory weight" hint="Estimated total is acceptable" value={accessoryWeight} onChange={setAccessoryWeight} min={0} step={0.1} unit="g" />
                    <NumberField label="Fragile parts" hint="Thin or breakable product areas" value={fragileParts} onChange={setFragileParts} min={0} unit="parts" />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Model-only engineering fields are filled from the historical profile for <strong className="text-foreground">{productFamily}</strong>, so you do not need to guess subjective scores.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <SectionHeading icon={<CheckCircle2 className="h-5 w-5" />} title="Review before prediction" description="Check the summary below. You can go back and edit any value." />

                <div className="rounded-xl border border-border/70 bg-muted/15 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                      <p className="font-semibold">{productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{productFamily} · {articulation} · {pose}</p>
                    </div>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ReviewItem icon={<Scale />} label="Weight" value={`${weight} g`} />
                    <ReviewItem icon={<Ruler />} label="Height" value={`${height} cm`} />
                    <ReviewItem icon={<Package />} label="Accessories" value={`${accessoryCount} items / ${accessoryWeight} g`} />
                    <ReviewItem icon={<Package />} label="Fragile parts" value={`${fragileParts} parts`} />
                    <ReviewItem icon={<ShieldCheck />} label="Center of gravity" value={centerOfGravity} />
                    <ReviewItem icon={<Sparkles />} label="Hair / clothing" value={`${hairLength} / ${dressLength}`} />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
                  <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">The model compares these attributes with historical packaging records to recommend straps, supports, and material. It does not require an image.</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Prediction service unavailable</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-5">
              <Button variant="ghost" onClick={() => step === 1 ? navigate({ to: "/app/analysis-method" }) : setStep((step - 1) as FormStep)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {step === 1 ? "Methods" : "Back"}
              </Button>

              {step < 3 ? (
                <Button disabled={!canContinue} onClick={() => setStep((step + 1) as FormStep)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" disabled={loading || !canContinue} onClick={runPrediction}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                  {loading ? "Running prediction..." : "Predict packaging"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg"><PackageCheck className="h-5 w-5 text-primary" /> Prediction Result</CardTitle>
                  <CardDescription className="mt-1">Recommended packaging configuration</CardDescription>
                </div>
                {prediction && <Badge className="bg-[color:var(--success)] text-white">Complete</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
                  <Loader2 className="h-9 w-9 animate-spin text-primary" />
                  <p className="mt-4 text-sm font-medium">Analyzing historical patterns</p>
                  <p className="mt-1 text-xs text-muted-foreground">This should only take a moment.</p>
                </div>
              ) : !prediction ? (
                <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BrainCircuit className="h-7 w-7" /></div>
                  <p className="mt-4 text-sm font-medium">Complete the 3 input steps</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">Your strap, support, and material recommendations will appear here.</p>
                  <div className="mt-5 flex items-center gap-1.5">
                    {FORM_STEPS.map((item) => <span key={item.id} className={`h-1.5 rounded-full ${item.id <= step ? "w-6 bg-primary" : "w-3 bg-border"}`} />)}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {recommendationFields.map(([key, label]) => {
                      const quantity = Number(prediction[key] ?? 0);
                      const recommended = isRecommended(quantity);
                      return (
                        <div key={key} className={`flex items-center gap-3 rounded-lg border p-3 ${recommended ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/20"}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${recommended ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {recommended ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{label}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {recommended ? `${quantity} ${quantity === 1 ? "attachment" : "attachments"}` : "Not required"}
                            </p>
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
            <p>The Attachment Planner turns the result into zone-by-zone methods, quantities, cost, labor, and sustainability estimates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: FormStep }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Product input progress">
      {FORM_STEPS.map((item) => {
        const complete = item.id < currentStep;
        const active = item.id === currentStep;
        return (
          <li key={item.id} className="relative">
            <div className={`mb-2 h-1 rounded-full ${item.id <= currentStep ? "bg-primary" : "bg-border"}`} />
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-primary text-primary-foreground" : active ? "border-2 border-primary bg-background text-primary" : "bg-muted text-muted-foreground"}`}>
                {complete ? <CheckCircle2 className="h-4 w-4" /> : item.id}
              </span>
              <span className={`hidden text-xs font-medium sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
              <span className={`text-[11px] font-medium sm:hidden ${active ? "text-foreground" : "text-muted-foreground"}`}>{item.shortLabel}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function SectionHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <Label>{label}</Label>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function NumberField({ label, hint, value, onChange, min, max, step = 1, unit }: { label: string; hint?: string; value: number; onChange: (value: number) => void; min: number; max?: number; step?: number; unit?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <Input className="h-10 pr-14" type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted-foreground">{unit}</span>}
      </div>
    </Field>
  );
}

function ReviewItem({ icon, label, value }: { icon: React.ReactElement<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-background p-3">
      <span className="text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}
