import { useMemo, useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { loadAnalysis, loadPlan } from "@/lib/workflow-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wand2,
  Activity,
  AlertTriangle,
  Factory,
  Warehouse,
  Truck,
  Store,
  Gauge,
  FileText,
} from "lucide-react";

type Attachment = { region: string; type: string; coverage: number };
type Accessory = { name: string; secured: boolean; small: boolean };
type ScenarioKey = "normal" | "rough" | "collector" | "cost";

type ScenarioConditions = {
  dropHeight: string;
  transport: string;
  vibration: string;
  compression: string;
  temperature: string;
  humidity: string;
};

const SCENARIOS: Record<
  ScenarioKey,
  {
    label: string;
    sub: string;
    mv: number;
    ac: number;
    dr: number;
    conf: number;
    icon: typeof Truck;
    conditions: ScenarioConditions;
  }
> = {
  normal: {
    label: "Normal Shipping", sub: "Baseline ISTA 1A",
    mv: 1.0, ac: 1.0, dr: 1.0, conf: 0, icon: Truck,
    conditions: {
      dropHeight: "0.8 m",
      transport: "Palletized · Road",
      vibration: "Low (5–50 Hz)",
      compression: "3-pallet stack",
      temperature: "10–30 °C",
      humidity: "40–60% RH",
    },
  },
  rough: {
    label: "Rough Handling", sub: "Drop · vibration · 1.2m",
    mv: 1.35, ac: 1.4, dr: 0.78, conf: -6, icon: Activity,
    conditions: {
      dropHeight: "1.2 m",
      transport: "Parcel · Multi-modal",
      vibration: "High (5–200 Hz)",
      compression: "5-pallet stack",
      temperature: "-10–40 °C",
      humidity: "20–85% RH",
    },
  },
  collector: {
    label: "Collector Grade", sub: "Mint-in-box tolerance",
    mv: 0.85, ac: 0.7, dr: 1.08, conf: 4, icon: ShieldCheck,
    conditions: {
      dropHeight: "0.45 m",
      transport: "White-glove · Air",
      vibration: "Very Low (5–20 Hz)",
      compression: "Single-layer",
      temperature: "18–24 °C",
      humidity: "45–55% RH",
    },
  },
  cost: {
    label: "Cost Optimized", sub: "Reduced foam · thin tray",
    mv: 1.15, ac: 1.2, dr: 0.92, conf: -3, icon: Gauge,
    conditions: {
      dropHeight: "0.8 m",
      transport: "Palletized · Road",
      vibration: "Medium (5–100 Hz)",
      compression: "4-pallet stack",
      temperature: "5–35 °C",
      humidity: "30–70% RH",
    },
  },
};


const REGION_WEIGHTS: Record<string, number> = {
  Arms: 0.28,
  Head: 0.34,
  Legs: 0.22,
  Waist: 0.16,
};

type FailureModeMap = Record<"Assembly" | "Warehouse" | "Transport" | "Shelf", string>;
const FAILURE_MODES: FailureModeMap = {
  Assembly: "Operator Mis-Alignment",
  Warehouse: "Compression Set",
  Transport: "Vibration Loosening",
  Shelf: "Consumer Handling",
};

type FailureEvidence = { evidenceId: string; suggestedRule: string };
const EVIDENCE_MAP: Record<string, FailureEvidence> = {
  Head: { evidenceId: "E003", suggestedRule: "Increase Cushion Thickness" },
  Arms: { evidenceId: "E002", suggestedRule: "Add Shoulder Restraint Strap" },
  Legs: { evidenceId: "E004", suggestedRule: "Reinforce Knee-Joint Cradle" },
  Waist: { evidenceId: "E001", suggestedRule: "Molded Torso Cradle" },
  Glasses: { evidenceId: "E005", suggestedRule: "Micro-Blister Recess" },
  Handbag: { evidenceId: "E007", suggestedRule: "Elastic Loop Retention" },
  Crown: { evidenceId: "E005", suggestedRule: "Micro-Clip Retention" },
  Shoes: { evidenceId: "E004", suggestedRule: "Paired Foot Cradle" },
  "Dress Stand": { evidenceId: "E006", suggestedRule: "PET Base Lock" },
};

function evidenceFor(region: string): FailureEvidence {
  return EVIDENCE_MAP[region] ?? { evidenceId: "E000", suggestedRule: "Review with engineer" };
}

type ImprovementBenefit = {
  title: string;
  detail: string;
  icon: typeof TrendingDown;
  benefits: { label: string; value: string; positive: boolean }[];
};

function level(score: number): { label: "LOW" | "MEDIUM" | "HIGH"; tone: string } {
  if (score < 30) return { label: "LOW", tone: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" };
  if (score < 60) return { label: "MEDIUM", tone: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" };
  return { label: "HIGH", tone: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" };
}

function dropLevel(score: number): { label: "LOW" | "MEDIUM" | "HIGH"; tone: string } {
  // Inverted: higher drop score is better
  if (score >= 75) return { label: "LOW", tone: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" };
  if (score >= 55) return { label: "MEDIUM", tone: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" };
  return { label: "HIGH", tone: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" };
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(n * 10) / 10;

export default function RiskAssessmentContent() {
  const [product, setProduct] = useState({
    name: "—",
    category: "—",
    complexity: 50,
    support: 3,
  });

  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [scenario, setScenario] = useState<ScenarioKey>("normal");
  const sc = SCENARIOS[scenario];

  const [apiData, setApiData] = useState<any>(null);

  // Hydrate from real analysis data
  useEffect(() => {
    const a = loadAnalysis();
    if (a) {
      setProduct({
        name: a.productName ?? "—",
        category: a.category ?? a.productType ?? "—",
        complexity: a.poseComplexityScore ?? 50,
        support: 3,
      });

      // Map accessories from selected_accessories list
      const SMALL_ACCESSORIES = new Set(["glasses", "crown", "ring", "earring", "clip", "pin", "badge"]);
      const accList: Accessory[] = (a.selected_accessories ?? a.accessories ?? []).map((name: string) => ({
        name,
        secured: false,
        small: SMALL_ACCESSORIES.has(name.toLowerCase()),
      }));
      if (accList.length > 0) setAccessories(accList);

      // Map attachment zones → Attachment[]
      const RISK_TO_COVERAGE: Record<string, number> = { high: 50, medium: 70, low: 88 };
      const METHOD_TO_TYPE: Record<string, string> = {
        "Elastic Strap": "Elastic Strap",
        "EVA Strap": "EVA Strap",
        "PET Support": "PET Support",
        "Cardboard Support": "Cardboard Support",
        "Blister Support": "Blister Support",
      };
      const zones = (a.attachmentZones ?? []).filter(
        (z: any) => z.recommendedMethod && z.recommendedMethod !== "No Attachment Required" && z.recommendedMethod !== "Not needed"
      );
      if (zones.length > 0) {
        setAttachments(zones.map((z: any) => ({
          region: z.zone,
          type: METHOD_TO_TYPE[z.recommendedMethod] ?? z.recommendedMethod,
          coverage: RISK_TO_COVERAGE[z.riskLevel] ?? 70,
        })));
      }

      // Re-connect the backend AI model
      const token = getToken();
      if (token) {
        fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            plan_id: 1,
            product_weight_g: a.product_weight_g ?? 250,
            height_cm: a.height_cm ?? 30.0,
            fragility_score: 5,
            center_of_gravity: a.center_of_gravity ?? "Center",
            accessory_count: a.accessory_count ?? 5,
            accessory_weight_g: a.accessory_weight_g ?? 45,
            movement_score: 7,
            complexity_score: a.poseComplexityScore ? Math.round(a.poseComplexityScore / 10) : 8,
            stability_index: a.poseStabilityScore ? Math.round(a.poseStabilityScore / 10) : 4,
            recommended_head_strap: zones.some((z: any) => z.zone.toLowerCase().includes("head") || z.zone.toLowerCase().includes("hair")) ? 1 : 0,
            recommended_waist_strap: zones.some((z: any) => z.zone.toLowerCase().includes("waist") || z.zone.toLowerCase().includes("torso")) ? 1 : 0,
            recommended_hand_strap: zones.some((z: any) => z.zone.toLowerCase().includes("arm") || z.zone.toLowerCase().includes("wrist") || z.zone.toLowerCase().includes("hand")) ? 1 : 0,
            recommended_leg_strap: zones.some((z: any) => z.zone.toLowerCase().includes("leg") || z.zone.toLowerCase().includes("foot") || z.zone.toLowerCase().includes("ankle")) ? 1 : 0,
          })
        })
          .then(res => res.json())
          .then(data => setApiData(data))
          .catch(err => console.error("Failed to fetch risk assessment API:", err));
      }
    }
  }, []);

  const attachmentCoverage = useMemo(
    () => attachments.length > 0
      ? attachments.reduce((s, a) => s + a.coverage, 0) / attachments.length
      : 0,
    [attachments],
  );

  const movementRisk = useMemo(
    () => {
      if (apiData?.categories?.["Movement Risk"]) {
        return clamp(apiData.categories["Movement Risk"].risk_percentage * sc.mv);
      }
      return clamp((0.5 * product.complexity - 0.2 * (product.support * 10) - 0.3 * attachmentCoverage + 35) * sc.mv);
    },
    [apiData, product, attachmentCoverage, sc.mv],
  );

  const unsecuredSmall = accessories.filter((a) => !a.secured && a.small).length;
  const securedCount = accessories.filter((a) => a.secured).length;
  const securedSmall = accessories.filter((a) => a.secured && a.small).length;

  const accessoryLoss = useMemo(
    () => {
      if (apiData?.categories?.["Accessory Loss Risk"]) {
        const base = apiData.categories["Accessory Loss Risk"].risk_percentage;
        return clamp((base - 15 * securedSmall - 10 * securedCount) * sc.ac);
      }
      return clamp((20 + 15 * unsecuredSmall - 10 * securedCount + 25) * sc.ac);
    },
    [apiData, unsecuredSmall, securedCount, securedSmall, sc.ac],
  );

  const poseStability = useMemo(
    () => clamp(100 - 0.45 * product.complexity + 6 * product.support + 0.25 * attachmentCoverage),
    [product, attachmentCoverage],
  );

  const dropScore = useMemo(
    () => {
      if (apiData?.categories?.["Drop Test Risk"]) {
        const base = apiData.categories["Drop Test Risk"].pass_probability;
        const lossRiskDelta = (15 * securedSmall) + (10 * securedCount);
        return clamp((base + (lossRiskDelta * 0.2)) * sc.dr);
      }
      return clamp((100 - movementRisk * 0.4 - accessoryLoss * 0.2 + poseStability * 0.3) * sc.dr);
    },
    [apiData, movementRisk, accessoryLoss, poseStability, sc.dr, securedSmall, securedCount],
  );

  // Alt plans (deterministic deltas)
  const altA = clamp(dropScore + 6.2);
  const altB = clamp(dropScore + 11.4);
  const noAttach = clamp(dropScore - 28.5);

  const regionRisks = useMemo(() => {
    return Object.entries(REGION_WEIGHTS).map(([region, w]) => {
      const covered = attachments.some((a) =>
        a.region.toLowerCase().includes(region.toLowerCase().slice(0, 3)),
      );
      const base = movementRisk * (0.6 + w);
      const adjusted = covered ? base * 0.7 : base;
      return { region, value: clamp(adjusted) };
    });
  }, [movementRisk, attachments]);

  const accessoryRisks = useMemo(
    () =>
      accessories.map((a) => {
        let p = 18 + (a.small ? 22 : 8);
        if (!a.secured) p += 28;
        if (a.secured) p -= 6;
        return { name: a.name, value: clamp(p) };
      }),
    [accessories],
  );

  const confidence = useMemo(
    () => clamp(70 + attachmentCoverage * 0.12 + securedCount * 1.6 + sc.conf),
    [attachmentCoverage, securedCount, sc.conf],
  );

  // Survival timeline — deterministic per-stage probability
  const timeline = useMemo(() => {
    const assembly = clamp(100 - movementRisk * 0.10 - accessoryLoss * 0.05);
    const warehouse = clamp(100 - accessoryLoss * 0.30 - movementRisk * 0.08);
    const transport = clamp(dropScore - (sc.dr < 1 ? 6 : 0));
    const shelf = clamp(100 - accessoryLoss * 0.55 - (unsecuredSmall * 4));
    return [
      {
        stage: "Assembly", icon: Factory, value: assembly,
        reason: assembly < 80 ? "Operator handling stresses unsecured arms" : "Within line-tolerance"
      },
      {
        stage: "Warehouse", icon: Warehouse, value: warehouse,
        reason: warehouse < 80 ? "Stack pressure shifts loose accessories" : "Stable under 3-pallet stack"
      },
      {
        stage: "Transport", icon: Truck, value: transport,
        reason: transport < 75 ? "Vibration + 1.2m drop axis exceeds attachment hold" : "Survives ISTA 1A profile"
      },
      {
        stage: "Shelf", icon: Store, value: shelf,
        reason: shelf < 80 ? `${unsecuredSmall} small part(s) prone to consumer tampering` : "Retail-ready"
      },
    ];
  }, [movementRisk, accessoryLoss, dropScore, unsecuredSmall, sc.dr]);

  // Critical failure zones
  const failureZones = useMemo(() => {
    const zones: { region: string; reason: string; severity: number }[] = [];
    const regionMap: Record<string, string> = {
      Head: "Hair displacement & face-paint scuff under lateral inertia",
      Arms: "Articulation breakage at shoulder joint on drop axis",
      Legs: "Knee-joint loosening from repeated vibration",
      Waist: "Torso shift against blister cradle",
    };
    for (const r of Object.keys(REGION_WEIGHTS)) {
      const w = REGION_WEIGHTS[r];
      const covered = attachments.some((a) =>
        a.region.toLowerCase().includes(r.toLowerCase().slice(0, 3)),
      );
      const sev = clamp(movementRisk * (0.6 + w) * (covered ? 0.7 : 1));
      if (sev > 45) zones.push({ region: r, reason: regionMap[r], severity: sev });
    }
    accessories
      .filter((a) => !a.secured)
      .forEach((a) =>
        zones.push({
          region: a.name,
          reason: a.small
            ? "Sub-5g part — escapes blister window under vibration"
            : "Unrestrained mass strikes adjacent components",
          severity: clamp(40 + (a.small ? 25 : 10) + accessoryLoss * 0.3),
        }),
      );
    return zones.sort((a, b) => b.severity - a.severity).slice(0, 5);
  }, [movementRisk, accessories, attachments, accessoryLoss]);



  // Primary causes per metric — deterministic engineering reasoning
  const primaryCauses = useMemo(() => {
    const mv =
      attachmentCoverage < 70 ? "Large Internal Clearance"
        : product.support < 4 ? "Insufficient Support Points"
          : "High Product Complexity";
    const ac =
      unsecuredSmall > 1 ? "Low Attachment Coverage"
        : unsecuredSmall === 1 ? "Sub-5g Part Unsecured"
          : "Blister Window Tolerance";
    const ps =
      product.support < 4 ? "Insufficient Support Points"
        : "CoG Offset vs Cradle Axis";
    const dr =
      movementRisk > 55 ? "High CoG Offset"
        : accessoryLoss > 50 ? "Accessory Mass Displacement"
          : "Cushion Thickness Margin";
    return { mv, ac, ps, dr };
  }, [attachmentCoverage, product.support, unsecuredSmall, movementRisk, accessoryLoss]);

  // Improvement suggestions with engineering benefit breakdown (DYNAMIC LOGIC)
  const improvementSuggestions = useMemo<ImprovementBenefit[]>(() => {
    const suggestions: ImprovementBenefit[] = [];

    // 1. Accessory rule
    const unsecuredAccessories = accessories.filter((a) => !a.secured);
    if (unsecuredAccessories.length > 0) {
      // Prioritize small accessories, then fallback to any
      const target = unsecuredAccessories.find((a) => a.small) || unsecuredAccessories[0];
      suggestions.push({
        icon: ShieldCheck,
        title: `Secure ${target.name} with micro-clip`,
        detail: `Locks the ${target.small ? 'lightest' : 'largest'} unsecured part; eliminates major loss vector.`,
        benefits: [
          { label: "Accessory Loss", value: `-${round(accessoryLoss * 0.42)}%`, positive: true },
          { label: "Drop Survival", value: `+${round((100 - dropScore) * 0.09)}`, positive: true },
          { label: "Packaging Cost", value: "+$0.03", positive: false },
          { label: "Sustainability", value: "±0% material", positive: true },
        ],
      });
    }

    // 2. Movement Risk / Strap rule
    if (movementRisk > 30 && regionRisks.length > 0) {
      // Find region with highest risk
      const highestRegion = [...regionRisks].sort((a, b) => b.value - a.value)[0];
      suggestions.push({
        icon: TrendingDown,
        title: `Add EVA strap on ${highestRegion.region.toLowerCase()}`,
        detail: `Increases attachment coverage on the ${highestRegion.region.toLowerCase()} cluster by 18%.`,
        benefits: [
          { label: "Movement Risk", value: `-${round(movementRisk * 0.34)}`, positive: true },
          { label: "Drop Survival", value: `+${round((100 - dropScore) * 0.18)}`, positive: true },
          { label: "Packaging Cost", value: "+$0.08", positive: false },
          { label: "Sustainability", value: "-4% material", positive: true },
        ],
      });
    }

    // 3. Complexity / Support rule
    if (product.complexity > 50) {
      suggestions.push({
        icon: CheckCircle2,
        title: "Switch to custom molded cradle",
        detail: "Distributes shock for high-complexity pose; improves stability under 1.2 m drop.",
        benefits: [
          { label: "Movement Risk", value: `-${round(movementRisk * 0.22)}`, positive: true },
          { label: "Drop Survival", value: `+${round((100 - dropScore) * 0.22)}`, positive: true },
          { label: "Packaging Cost", value: "+$0.15", positive: false },
          { label: "Sustainability", value: "-8% material", positive: true },
        ],
      });
    } else if (suggestions.length < 3) {
      // Fill up if we have less than 3
      suggestions.push({
        icon: CheckCircle2,
        title: "Increase cushion thickness",
        detail: "Improves general shock absorption for transport.",
        benefits: [
          { label: "Movement Risk", value: `-${round(movementRisk * 0.1)}`, positive: true },
          { label: "Drop Survival", value: `+${round((100 - dropScore) * 0.08)}`, positive: true },
          { label: "Packaging Cost", value: "+$0.05", positive: false },
          { label: "Sustainability", value: "-2% material", positive: true },
        ],
      });
    }

    return suggestions.slice(0, 3);
  }, [movementRisk, accessoryLoss, dropScore, accessories, regionRisks, product.complexity]);

  const toggleSecured = (name: string) =>
    setAccessories((arr) =>
      arr.map((a) => (a.name === name ? { ...a, secured: !a.secured } : a)),
    );

  return (
    <div className="w-full text-foreground pb-12">
      <main className="mx-auto w-full max-w-full">
        {/* Title */}
        <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[color:var(--pink)]">
              Module 04 / Risk Assessment
            </div>
            <h1 className="mt-1 text-[34px] font-semibold leading-tight tracking-tight">
              Predicting in-pack movement, accessory loss & drop survival.
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
              Deterministic risk inference for the current attachment plan. Adjust inputs to see the explainable model
              recompute every score live.
            </p>
          </div>
          <div className="flex items-center rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--pink-soft)]">
                <ShieldCheck className="h-5 w-5 text-[color:var(--pink)]" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Assessment Score</div>
                <div className="text-lg font-semibold tabular-nums">{Math.round(confidence)}%</div>
              </div>
            </div>
            <div className="ml-4 h-10 w-px bg-border" />
            <div className="ml-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Run</div>
              <div className="text-sm font-medium">
                {apiData?.assessment_id ? `#${apiData.assessment_id.split("-")[0].toUpperCase()}` : "Syncing DB..."}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 space-y-6 lg:col-span-3">
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoField label="Name" value={product.name} />
                <InfoField label="Category" value={product.category} />
                <InfoField label="Complexity Score" value={product.complexity < 40 ? "Low" : product.complexity < 70 ? "Medium" : "High"} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Accessories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {accessories.map((a) => (
                  <label
                    key={a.name}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:border-[color:var(--pink)]/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox checked={a.secured} onCheckedChange={() => toggleSecured(a.name)} />
                      <span className="font-medium">{a.name}</span>
                    </div>
                    <span
                      className={[
                        "text-[10.5px] font-semibold uppercase tracking-wider",
                        a.secured ? "text-emerald-600" : "text-rose-600",
                      ].join(" ")}
                    >
                      {a.secured ? "Secured" : "Loose"}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Attachment Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {attachments.map((a) => (
                  <div
                    key={a.region}
                    className="flex items-center justify-between rounded-lg bg-[color:var(--pink-soft)]/50 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-semibold">{a.region}</div>
                      <div className="text-[11px] text-muted-foreground">{a.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground">Coverage</div>
                      <div className="text-sm font-semibold text-[color:var(--pink)]">{a.coverage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <section className="col-span-12 space-y-6 lg:col-span-9">
            {/* Spacer — removed hardcoded Packaging Config & KB Status cards */}

            {/* Scenario selector */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[color:var(--pink)]" />
                    <CardTitle className="text-[15px] font-semibold tracking-tight">
                      Engineering Test Scenario
                    </CardTitle>
                  </div>
                  <Badge className="bg-[color:var(--pink-soft)] text-[color:var(--pink)]">
                    Live recompute
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {(Object.keys(SCENARIOS) as ScenarioKey[]).map((k) => {
                    const s = SCENARIOS[k];
                    const Icon = s.icon;
                    const active = scenario === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setScenario(k)}
                        className={[
                          "group rounded-xl border p-3 text-left transition-all duration-300",
                          active
                            ? "border-[color:var(--pink)] bg-[color:var(--pink-soft)]/60 shadow-md scale-[1.02]"
                            : "border-border bg-card hover:border-[color:var(--pink)]/40 hover:shadow-sm",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={[
                              "grid h-8 w-8 place-items-center rounded-lg transition",
                              active ? "text-white" : "bg-muted text-foreground",
                            ].join(" ")}
                            style={active ? { backgroundColor: "#d946ef" } : undefined}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-[13px] font-semibold tracking-tight">{s.label}</div>
                        </div>
                        <div className="mt-2 text-[11.5px] text-muted-foreground">{s.sub}</div>
                        <div className="mt-3 space-y-1 border-t border-border/60 pt-2 text-[11px]">
                          <ScenarioCondRow k="Drop" v={s.conditions.dropHeight} />
                          <ScenarioCondRow k="Trans" v={s.conditions.transport} />
                          <ScenarioCondRow k="Vib" v={s.conditions.vibration} />
                          <ScenarioCondRow k="Comp" v={s.conditions.compression} />
                          <ScenarioCondRow k="Temp" v={s.conditions.temperature} />
                          <ScenarioCondRow k="RH" v={s.conditions.humidity} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top metric cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Movement Risk" value={movementRisk} suffix="" tone={level(movementRisk)} hint="Inertial drift score" primaryCause={primaryCauses.mv} />
              <MetricCard label="Accessory Loss Risk" value={accessoryLoss} suffix="%" tone={level(accessoryLoss)} hint="Loss probability index" primaryCause={primaryCauses.ac} />
              <MetricCard label="Pose Stability" value={poseStability} suffix="" tone={level(100 - poseStability)} hint="Articulation hold" primaryCause={primaryCauses.ps} />
              <MetricCard label="Drop-Test Prediction" value={dropScore} suffix="/100" tone={dropLevel(dropScore)} hint="Survival score" primaryCause={primaryCauses.dr} highlight />
            </div>


            {/* Survival Timeline */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[color:var(--pink)]" />
                    <CardTitle className="text-[15px] font-semibold tracking-tight">
                      Packaging Lifecycle Survival
                    </CardTitle>
                  </div>
                  <Badge className="bg-muted text-muted-foreground">{sc.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative grid grid-cols-1 gap-4 md:grid-cols-4">
                  {timeline.map((t, i) => {
                    const Icon = t.icon;
                    const lv = dropLevel(t.value);
                    const failureMode = FAILURE_MODES[t.stage as keyof FailureModeMap];
                    return (
                      <div key={t.stage} className="relative">
                        {i < timeline.length - 1 && (
                          <div className="pointer-events-none absolute right-[-12px] top-6 hidden h-px w-6 bg-border md:block" />
                        )}
                        <div className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--pink-soft)]">
                                <Icon className="h-4 w-4 text-[color:var(--pink)]" />
                              </div>
                              <div className="text-[13px] font-semibold tracking-tight">{t.stage}</div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lv.tone}`}>
                              {lv.label}
                            </span>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-2xl font-semibold tabular-nums transition-all duration-500">
                              {round(t.value)}
                            </span>
                            <span className="text-xs text-muted-foreground">% survival</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${t.value}%`, backgroundColor: "#d946ef" }}
                            />
                          </div>
                          <div className="mt-2 space-y-1 text-[11.5px] leading-snug">
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Reason: </span>
                              {t.reason}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Failure Mode: </span>
                              <span className="text-[color:var(--pink)] font-medium">{failureMode}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Charts row */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold tracking-tight">
                      Movement Risk by Body Region
                    </CardTitle>
                    <Badge className="bg-muted text-muted-foreground">Inertial model</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {regionRisks.map((r) => {
                    const lv = level(r.value);
                    return (
                      <div key={r.region}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{r.region}</span>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums text-muted-foreground">{round(r.value)}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lv.tone}`}>
                              {lv.label}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${r.value}%`,
                              backgroundColor: "#d946ef",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold tracking-tight">
                      Accessory Loss Probability
                    </CardTitle>
                    <Badge className="bg-muted text-muted-foreground">{accessories.length} parts</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {accessoryRisks.map((a) => {
                    const lv = level(a.value);
                    return (
                      <div key={a.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{a.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums text-muted-foreground">{round(a.value)}%</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lv.tone}`}>
                              {lv.label}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${a.value}%`,
                              backgroundColor: "#d946ef",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Drop-test performance */}
              <Card className="rounded-2xl border-border shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold tracking-tight">
                      Drop-Test Survival
                    </CardTitle>
                    <Badge className="bg-[color:var(--pink-soft)] text-[color:var(--pink)]">ISTA 1A</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center pt-4 pb-6">
                  {(() => {
                    const c = { label: "Current Plan", v: dropScore, active: true };
                    const lv = dropLevel(c.v);
                    return (
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-3xl font-bold tabular-nums">{round(c.v)}<span className="text-muted-foreground text-xl">%</span></div>
                        <div className="relative flex h-32 w-full max-w-[100px] items-end overflow-hidden rounded-xl bg-muted">
                          <div
                            className="w-full rounded-xl transition-all"
                            style={{
                              height: `${c.v}%`,
                              backgroundColor: "#d946ef",
                            }}
                          />
                        </div>
                        <div className="text-center mt-2">
                          <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider ${lv.tone}`}>
                            {lv.label} RISK
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Critical Failure Zones */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[color:var(--pink)]" />
                  <CardTitle className="text-[15px] font-semibold tracking-tight">
                    Critical Failure Zones
                  </CardTitle>
                  <Badge className="ml-auto bg-muted text-muted-foreground">
                    {failureZones.length} detected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {failureZones.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No critical zones above threshold for this scenario.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Body Region / Part</th>
                          <th className="px-4 py-2 text-left font-medium">Failure Reason</th>
                          <th className="px-4 py-2 text-left font-medium">Evidence</th>
                          <th className="px-4 py-2 text-left font-medium">Suggested Rule</th>
                          <th className="px-4 py-2 text-right font-medium">Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failureZones.map((z) => {
                          const lv = level(z.severity);
                          const ev = evidenceFor(z.region);
                          return (
                            <tr key={z.region} className="border-t border-border">
                              <td className="px-4 py-3 font-semibold">{z.region}</td>
                              <td className="px-4 py-3 text-muted-foreground">{z.reason}</td>
                              <td className="px-4 py-3 font-mono text-[12px] text-[color:var(--pink)]">{ev.evidenceId}</td>
                              <td className="px-4 py-3 text-muted-foreground">{ev.suggestedRule}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <span className="tabular-nums">{round(z.severity)}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lv.tone}`}>
                                    {lv.label}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* AI suggestions */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--pink)]" />
                  <CardTitle className="text-[15px] font-semibold tracking-tight">
                    Engineering Improvement Suggestions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {improvementSuggestions.map((s) => (
                    <Suggestion key={s.title} icon={s.icon} title={s.title} detail={s.detail} benefits={s.benefits} />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--pink-soft)]">
                      <CircleAlert className="h-5 w-5 text-[color:var(--pink)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Assessment Score {Math.round(confidence)}% · {dropLevel(dropScore).label} drop-failure risk
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        Based on {accessories.length} accessories, {attachments.length} attachments, complexity {product.complexity}.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  tone,
  hint,
  highlight,
  primaryCause,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: { label: string; tone: string };
  hint: string;
  highlight?: boolean;
  primaryCause?: string;
}) {
  return (
    <Card
      className={[
        "relative overflow-hidden rounded-2xl border-border shadow-sm",
        highlight ? "ring-2 ring-[color:var(--pink)]/40" : "",
      ].join(" ")}
    >
      {highlight && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25"
          style={{ backgroundColor: "#d946ef" }}
        />
      )}
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.tone}`}>{tone.label}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-[34px] font-semibold tracking-tight tabular-nums">{round(value)}</span>
          {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
        </div>
        <Progress
          value={value}
          className="mt-3 h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-[#d946ef]"
        />
        <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>
        {primaryCause && (
          <div className="mt-3 border-t border-border pt-2">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Primary Cause
            </div>
            <div className="mt-0.5 text-[12px] font-medium text-[color:var(--pink)]">
              {primaryCause}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Explain({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 text-[13px] font-semibold tracking-tight">{title}</div>
      <ul className="space-y-1.5 text-[12.5px] text-muted-foreground">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--pink)]" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Suggestion({
  icon: Icon,
  title,
  detail,
  benefits,
}: {
  icon: typeof TrendingDown;
  title: string;
  detail: string;
  benefits: { label: string; value: string; positive: boolean }[];
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition hover:border-[color:var(--pink)]/40 hover:shadow-md">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--pink-soft)]">
          <Icon className="h-4 w-4 text-[color:var(--pink)]" />
        </div>
      </div>
      <div className="mt-3 text-[13.5px] font-semibold tracking-tight">{title}</div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{detail}</p>
      <div className="mt-3 space-y-1 rounded-lg bg-muted/40 p-2">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Expected Engineering Benefit
        </div>
        {benefits.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">{b.label}</span>
            <span className={`font-semibold tabular-nums ${b.positive ? "text-emerald-600" : "text-rose-600"}`}>
              {b.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium leading-tight">{value}</div>
    </div>
  );
}

function KbStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-[color:var(--pink)]">{value}</div>
    </div>
  );
}

function ScenarioCondRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

function RuleStatusBadge({ status }: { status: "Triggered" | "Monitoring" | "Inactive" }) {
  const tone =
    status === "Triggered"
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      : status === "Monitoring"
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{status}</span>
  );
}

function BeforeAfter({
  label,
  before,
  after,
  invert,
}: {
  label: string;
  before: number;
  after: number;
  invert?: boolean;
}) {
  const delta = round(after - before);
  const improved = invert ? delta < 0 : delta > 0;
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Before</div>
          <div className="text-lg font-semibold tabular-nums">{round(before)}</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-muted-foreground/40 transition-all duration-500"
              style={{ width: `${before}%` }}
            />
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">After</div>
          <div className="text-lg font-semibold tabular-nums text-[color:var(--pink)]">
            {round(after)}
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${after}%`, backgroundColor: "#d946ef" }}
            />
          </div>
        </div>
      </div>
      <div
        className={`mt-2 text-right text-[11px] font-semibold ${improved ? "text-emerald-600" : "text-rose-600"
          }`}
      >
        {delta > 0 ? "+" : ""}
        {delta} {improved ? "✓" : ""}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium leading-tight text-foreground">{value || "—"}</div>
    </div>
  );
}
