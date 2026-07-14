import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { getToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Download,
  FileJson,
  FileText,
  GitBranch,
  Layers,
  Package,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Activity,
  Gauge,
  Wrench,
  ClipboardList,
  Award,
  Table as TableIcon,
  Zap,
} from "lucide-react";

export type ReportSummary = {
  grade: string;
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  dropSurvival: number;
  movementRisk: number;
  accessoryLoss: number;
  packagingCost: string;
  sustainability: number;
  confidence: number;
};

export type ReportConfig = {
  productName: string;
  packagingType: string;
  packagingMethod: string;
  attachmentMethod: string;
  supportPoints: number;
  centerOfGravity: string;
  internalClearance: string;
  cushionMaterial: string;
  cushionThickness: string;
  istaStandard: string;
  scenario: string;
  weight: string;
  dimensions: string;
  accessoriesDetected: number;
};

export type ReportRiskMetrics = {
  movementRisk: number;
  accessoryLoss: number;
  poseStability: number;
  dropSurvival: number;
  criticalFailureCount: number;
  triggeredRules: number;
  literatureCoverage: number;
  ruleCoverage: number;
};

export type Finding = { status: "pass" | "warn" | "fail"; text: string };

export type TriggeredRule = {
  id: string;
  evidence: string;
  rule: string;
  severity: "Low" | "Medium" | "High";
  recommendation: string;
};

export type OptimizationRow = { label: string; before: string; after: string; delta: string; positive: boolean };

export type TraceStep = { stage: string; label: string; detail: string };

export type FinalRecommendation = {
  packaging: string;
  cushion: string;
  attachment: string;
  support: string;
  ista: string;
  status: string;
};

export type ReportMetadata = {
  generatedAt: string;
  runId: string;
  modelVersion: string;
  ruleEngineVersion: string;
  knowledgeBaseVersion: string;
  literaturePapers: number;
  rulesEvaluated: number;
  confidence: number;
};

const DEFAULT_SUMMARY: ReportSummary = {
  grade: "A",
  overallRisk: "LOW",
  dropSurvival: 100,
  movementRisk: 48,
  accessoryLoss: 45,
  packagingCost: "$0.82",
  sustainability: 87,
  confidence: 84,
};

const DEFAULT_CONFIG: ReportConfig = {
  productName: "Glamour Doll — Sparkle Edition",
  packagingType: "Rigid Paperboard Window Box",
  packagingMethod: "Plastic-free Display Box",
  attachmentMethod: "PET Strap + Paperboard Insert",
  supportPoints: 3,
  centerOfGravity: "Offset (12 mm)",
  internalClearance: "6.5 mm",
  cushionMaterial: "EPE Foam",
  cushionThickness: "15 mm",
  istaStandard: "ISTA 3A",
  scenario: "Normal Shipping",
  weight: "412 g",
  dimensions: "310 × 145 × 62 mm",
  accessoriesDetected: 5,
};

const DEFAULT_METRICS: ReportRiskMetrics = {
  movementRisk: 48,
  accessoryLoss: 45,
  poseStability: 72,
  dropSurvival: 100,
  criticalFailureCount: 3,
  triggeredRules: 5,
  literatureCoverage: 92,
  ruleCoverage: 94,
};

const DEFAULT_FINDINGS: Finding[] = [
  { status: "pass", text: "Product secured successfully within blister cradle" },
  { status: "pass", text: "Support points satisfy minimum requirement (3 ≥ 3)" },
  { status: "warn", text: "Internal clearance (6.5 mm) exceeds recommendation (≤ 5 mm)" },
  { status: "warn", text: "Crown attachment unstable — micro-clip retention advised" },
  { status: "pass", text: "Drop survival exceeds ISTA 3A requirement at 1.2 m" },
  { status: "pass", text: "EPE cushion thickness adequate for 400 g class product" },
  { status: "warn", text: "Glasses accessory unsecured — sub-5 g escape risk" },
];

const DEFAULT_RULES: TriggeredRule[] = [
  { id: "R-DT-001", evidence: "E001", rule: "Higher product weight increases transmitted force on cushion", severity: "Medium", recommendation: "Retain 15 mm EPE foam base cradle" },
  { id: "R-SP-002", evidence: "E002", rule: "Support points below threshold for articulated toys", severity: "High", recommendation: "Increase to 4-point support" },
  { id: "R-CL-003", evidence: "E003", rule: "Large internal clearance increases in-pack movement", severity: "High", recommendation: "Reduce clearance to 2 mm via molded insert" },
  { id: "R-AC-004", evidence: "E004", rule: "Unsecured sub-5 g accessories escape blister windows", severity: "High", recommendation: "Add micro-clip retention for Crown & Glasses" },
  { id: "R-CG-005", evidence: "E005", rule: "CoG offset > 10 mm generates rotational moment on drop", severity: "Medium", recommendation: "Recenter product mass via counter-weight tray" },
];

const DEFAULT_OPTIMIZATION: OptimizationRow[] = [
  { label: "Movement Risk", before: "48", after: "31", delta: "−17 pts", positive: true },
  { label: "Accessory Loss", before: "45%", after: "12%", delta: "−33%", positive: true },
  { label: "Drop Survival", before: "82", after: "96", delta: "+14 pts", positive: true },
  { label: "Packaging Cost", before: "$0.82", after: "$0.88", delta: "+$0.06", positive: false },
  { label: "Material Saving", before: "—", after: "+8% fiber-based", delta: "+8%", positive: true },
  { label: "Support Points", before: "3", after: "4", delta: "+1", positive: true },
  { label: "Attachment Coverage", before: "73%", after: "88%", delta: "+15%", positive: true },
];

const DEFAULT_TRACE: TraceStep[] = [
  { stage: "Literature", label: "IoP 2021 · Rouillard vibration study", detail: "Sub-5 g parts displaced above 65 Hz on parcel routes" },
  { stage: "Knowledge Extraction", label: "E003 · Clearance–Movement correlation", detail: "Extracted coefficient 0.30 for clearance term" },
  { stage: "Engineering Rule", label: "R-CL-003 · Large clearance increases movement", detail: "IF clearance > 5 mm THEN movement_risk += weighted term" },
  { stage: "Triggered Condition", label: "Clearance 6.5 mm > 5 mm threshold", detail: "Rule R-CL-003 fires with active weight 0.30" },
  { stage: "Risk Score", label: "Movement Risk contribution +19.5 pts", detail: "Aggregated into inertial drift index" },
  { stage: "Recommendation", label: "Add molded cradle · reduce clearance to 2 mm", detail: "Predicted −18% movement risk · +12% drop survival" },
];

const DEFAULT_FINAL: FinalRecommendation = {
  packaging: "Plastic-free Window Box",
  cushion: "15 mm EPE Foam",
  attachment: "PET Strap + EVA Head Strap",
  support: "4-point support",
  ista: "ISTA 3A",
  status: "READY FOR PROTOTYPE",
};

const DEFAULT_META: ReportMetadata = {
  generatedAt: "2026-07-09 14:22 UTC",
  runId: "PW-RUN-2026-07-0918",
  modelVersion: "PackWise-Predictor v2.4.1",
  ruleEngineVersion: "Rule Engine v2.4",
  knowledgeBaseVersion: "KB v18.2",
  literaturePapers: 18,
  rulesEvaluated: 38,
  confidence: 84,
};

function SectionHeader({
  index,
  icon: Icon,
  title,
  sub,
  action,
}: {
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-[color:var(--pink-soft)] text-[color:var(--pink)] grid place-items-center ring-1 ring-[color:var(--pink)]/15">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground tracking-wider uppercase">
            Section {String(index).padStart(2, "0")}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="text-sm font-semibold text-foreground mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function MetricStat({
  label,
  value,
  unit,
  tone,
  bar,
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "success" | "warning" | "danger" | "neutral";
  bar?: number;
}) {
  const toneRing =
    tone === "success"
      ? "ring-emerald-200 bg-emerald-50/40"
      : tone === "warning"
      ? "ring-amber-200 bg-amber-50/40"
      : tone === "danger"
      ? "ring-rose-200 bg-rose-50/40"
      : "ring-border bg-card";
  return (
    <div className={`rounded-xl p-4 ring-1 ${toneRing}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-foreground tabular-nums">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {typeof bar === "number" && <Progress value={bar} className="mt-3 h-1.5 [&>[data-slot=progress-indicator]]:bg-[#d946ef]" />}
    </div>
  );
}

function severityTone(s: TriggeredRule["severity"]) {
  if (s === "High") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (s === "Medium") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

function ExecutiveSummary({ summary }: { summary: ReportSummary }) {
  const riskTone =
    summary.overallRisk === "LOW"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : summary.overallRisk === "MEDIUM"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <Card className="overflow-hidden border-border/70 shadow-none">
      <div className="relative bg-gradient-to-br from-[color:var(--pink-soft)] to-background p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 rounded-3xl bg-background ring-1 ring-[color:var(--pink)]/20 grid place-items-center shadow-sm">
              <div className="text-4xl font-semibold tracking-tight text-[color:var(--pink)]">
                {summary.grade}
              </div>
              <div className="absolute -top-2 -right-2">
                <Award className="h-6 w-6 text-[color:var(--pink)]" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Overall Packaging Grade
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={`${riskTone} ring-1 rounded-full px-2.5 py-0.5 font-semibold border-transparent`}>
                  {summary.overallRisk} RISK
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Confidence {summary.confidence}%
                </span>
              </div>
              <p className="text-sm text-foreground/70 mt-2 max-w-lg">
                Aggregated engineering verdict from the PackWise rule engine, literature knowledge base, and simulation stack.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricStat label="Drop Survival" value={summary.dropSurvival} unit="/ 100" tone="success" bar={summary.dropSurvival} />
          <MetricStat label="Movement Risk" value={summary.movementRisk} tone="warning" bar={summary.movementRisk} />
          <MetricStat label="Accessory Loss" value={`${summary.accessoryLoss}%`} tone="warning" bar={summary.accessoryLoss} />
          <MetricStat label="Packaging Cost" value={summary.packagingCost} tone="neutral" />
          <MetricStat label="Sustainability" value={`${summary.sustainability}%`} tone="success" bar={summary.sustainability} />
          <MetricStat label="Confidence" value={`${summary.confidence}%`} tone="neutral" bar={summary.confidence} />
        </div>
      </div>
    </Card>
  );
}

function ConfigurationSummary({ config }: { config: ReportConfig }) {
  const items: [string, React.ReactNode][] = [
    ["Product Name", config.productName],
    ["Packaging Type", config.packagingType],
    ["Packaging Method", config.packagingMethod],
    ["Attachment Method", config.attachmentMethod],
    ["Support Points", config.supportPoints],
    ["Center of Gravity", config.centerOfGravity],
    ["Internal Clearance", config.internalClearance],
    ["Cushion Material", config.cushionMaterial],
    ["Cushion Thickness", config.cushionThickness],
    ["ISTA Standard", config.istaStandard],
    ["Simulation Scenario", config.scenario],
    ["Weight", config.weight],
    ["Dimensions", config.dimensions],
    ["Accessories Detected", config.accessoriesDetected],
  ];
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={2} icon={ClipboardList} title="Packaging Configuration Summary" sub="All engineering inputs used to compute this report." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(([k, v]) => (
            <KV key={k} label={k} value={v} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskDashboard({ m }: { m: ReportRiskMetrics }) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={3} icon={ShieldCheck} title="Risk Assessment Summary" sub="Aggregated outputs from the risk model and rule engine." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricStat label="Movement Risk" value={m.movementRisk} tone="warning" bar={m.movementRisk} />
          <MetricStat label="Accessory Loss" value={`${m.accessoryLoss}%`} tone="warning" bar={m.accessoryLoss} />
          <MetricStat label="Pose Stability" value={m.poseStability} tone="success" bar={m.poseStability} />
          <MetricStat label="Drop Survival" value={m.dropSurvival} tone="success" bar={m.dropSurvival} />
          <MetricStat label="Critical Failures" value={m.criticalFailureCount} tone="danger" />
          <MetricStat label="Triggered Rules" value={m.triggeredRules} tone="neutral" />
          <MetricStat label="Literature Coverage" value={`${m.literatureCoverage}%`} tone="success" bar={m.literatureCoverage} />
          <MetricStat label="Rule Coverage" value={`${m.ruleCoverage}%`} tone="success" bar={m.ruleCoverage} />
        </div>
      </CardContent>
    </Card>
  );
}

function EngineeringFindings({ findings }: { findings: Finding[] }) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={4} icon={Activity} title="Engineering Findings" sub="Inspection log across the analysis pipeline." />
        <ol className="relative border-l border-dashed border-border ml-3 space-y-3">
          {findings.map((f, i) => {
            const pass = f.status === "pass";
            const warn = f.status === "warn";
            const Icon = pass ? CheckCircle2 : warn ? AlertTriangle : AlertTriangle;
            const tone = pass
              ? "text-emerald-600 bg-emerald-50 ring-emerald-200"
              : warn
              ? "text-amber-600 bg-amber-50 ring-amber-200"
              : "text-rose-600 bg-rose-50 ring-rose-200";
            return (
              <li key={i} className="pl-6 relative">
                <span className={`absolute -left-3 top-0.5 h-6 w-6 rounded-full grid place-items-center ring-1 ${tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="text-sm text-foreground">{f.text}</div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function TriggeredRulesTable({ rules }: { rules: TriggeredRule[] }) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={5} icon={TableIcon} title="Triggered Engineering Rules" sub="Rules fired by the current configuration with cited evidence." />
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Rule ID</th>
                <th className="px-3 py-2 font-medium">Evidence</th>
                <th className="px-3 py-2 font-medium">Engineering Rule</th>
                <th className="px-3 py-2 font-medium">Severity</th>
                <th className="px-3 py-2 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs text-foreground">{r.id}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.evidence}</td>
                  <td className="px-3 py-2 text-foreground">{r.rule}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityTone(r.severity)}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground/80">{r.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function OptimizationSummary({ rows }: { rows: OptimizationRow[] }) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={6} icon={TrendingUp} title="Optimization Summary" sub="Current design vs. recommended optimized design." />
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="rounded-full">Current Design</Badge>
          <ArrowRight className="h-4 w-4 text-[color:var(--pink)]" />
          <Badge className="bg-[#d946ef] text-white rounded-full">Recommended Design</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl border border-border p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Before</div>
                  <div className="text-base font-semibold tabular-nums text-foreground">{r.before}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">After</div>
                  <div className="text-base font-semibold tabular-nums text-foreground">{r.after}</div>
                </div>
                <div
                  className={`text-xs font-semibold rounded-full px-2 py-0.5 ring-1 ${
                    r.positive
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200"
                  }`}
                >
                  {r.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DecisionTrace({ steps }: { steps: TraceStep[] }) {
  const icons = [BookOpen, Database, FileText, GitBranch, Activity, Sparkles];
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader
          index={7}
          icon={GitBranch}
          title="Engineering Decision Trace"
          sub="From literature to recommendation — every score is traceable."
        />
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((s, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={s.stage} className="rounded-xl border border-border p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-[color:var(--pink-soft)] text-[color:var(--pink)] grid place-items-center ring-1 ring-[color:var(--pink)]/15">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {String(i + 1).padStart(2, "0")} · {s.stage}
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.detail}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function FinalRecommendationCard({ rec }: { rec: FinalRecommendation }) {
  return (
    <Card className="border-border/70 shadow-none overflow-hidden">
      <div className="bg-gradient-to-br from-background to-[color:var(--pink-soft)] p-6">
        <SectionHeader index={8} icon={Sparkles} title="Final Packaging Recommendation" sub="The deployment-ready configuration produced by PackWise AI." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <KV label="Recommended Packaging" value={rec.packaging} />
          <KV label="Recommended Cushion" value={rec.cushion} />
          <KV label="Recommended Attachment" value={rec.attachment} />
          <KV label="Recommended Support" value={rec.support} />
          <KV label="ISTA Recommendation" value={rec.ista} />
          <div className="rounded-xl border border-[color:var(--pink)]/30 bg-background p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Deployment Status</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--pink)]">
              <CheckCircle2 className="h-4 w-4" />
              {rec.status}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EngineeringNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={9} icon={Wrench} title="Engineering Notes" sub="Reviewer observations captured before export." />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add engineering observations, deviations, sign-off comments…"
          className="min-h-[140px]"
        />
      </CardContent>
    </Card>
  );
}

function ExportCenter({
  onExportPdf,
  onExportJson,
  onExportCsv,
  onPrint,
  onShare,
}: {
  onExportPdf: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onShare: () => void;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={10} icon={Download} title="Export Center" sub="Distribute the report to engineering, QA, and manufacturing partners." />
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <Button
            onClick={onExportPdf}
            size="lg"
            className="bg-[#d946ef] hover:bg-[#d946ef]/90 text-white flex-1 md:flex-none md:min-w-[280px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download Engineering Report (PDF)
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onExportJson}>
              <FileJson className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
            <Button variant="outline" onClick={onExportCsv}>
              <TableIcon className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button variant="outline" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button variant="outline" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportMetadataFooter({ meta }: { meta: ReportMetadata }) {
  const items: [string, React.ReactNode][] = [
    ["Generated Time", meta.generatedAt],
    ["Run ID", meta.runId],
    ["Model Version", meta.modelVersion],
    ["Rule Engine Version", meta.ruleEngineVersion],
    ["Knowledge Base Version", meta.knowledgeBaseVersion],
    ["Literature Papers Used", meta.literaturePapers],
    ["Engineering Rules Evaluated", meta.rulesEvaluated],
    ["Confidence", `${meta.confidence}%`],
  ];
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Report Metadata</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {items.map(([k, v]) => (
            <div key={k} className="text-xs">
              <div className="text-muted-foreground">{k}</div>
              <div className="font-mono text-[13px] text-foreground mt-0.5 truncate">{v}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubmitPlanContent() {
  const [notes, setNotes] = useState("");
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    async function fetchApi() {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            plan_id: 1,
            product_weight_g: 250,
            height_cm: 30.0,
            fragility_score: 5,
            center_of_gravity: "Back",
            accessory_count: 5,
            accessory_weight_g: 45,
            movement_score: 7,
            complexity_score: 8,
            stability_index: 4,
            recommended_head_strap: 1,
            recommended_waist_strap: 1,
            recommended_hand_strap: 0,
            recommended_leg_strap: 0,
          })
        });
        if (res.ok) {
          setApiData(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch API:", e);
      }
    }
    fetchApi();
  }, []);

  const summary = useMemo(() => {
    if (!apiData) return DEFAULT_SUMMARY;
    return {
      ...DEFAULT_SUMMARY,
      overallRisk: (apiData.overall_risk_level || "LOW").toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
      movementRisk: apiData.categories?.["Movement Risk"]?.risk_percentage || DEFAULT_SUMMARY.movementRisk,
      accessoryLoss: apiData.categories?.["Accessory Loss Risk"]?.risk_percentage || DEFAULT_SUMMARY.accessoryLoss,
      dropSurvival: apiData.categories?.["Drop Test Risk"]?.pass_probability || DEFAULT_SUMMARY.dropSurvival,
    };
  }, [apiData]);

  const config = DEFAULT_CONFIG;

  const metrics = useMemo(() => {
    if (!apiData) return DEFAULT_METRICS;
    return {
      ...DEFAULT_METRICS,
      movementRisk: apiData.categories?.["Movement Risk"]?.risk_percentage || DEFAULT_METRICS.movementRisk,
      accessoryLoss: apiData.categories?.["Accessory Loss Risk"]?.risk_percentage || DEFAULT_METRICS.accessoryLoss,
      dropSurvival: apiData.categories?.["Drop Test Risk"]?.pass_probability || DEFAULT_METRICS.dropSurvival,
    };
  }, [apiData]);

  const findings = DEFAULT_FINDINGS;
  const rules = DEFAULT_RULES;
  const optimization = DEFAULT_OPTIMIZATION;
  const trace = DEFAULT_TRACE;
  const finalRecommendation = DEFAULT_FINAL;
  const metadata = DEFAULT_META;

  const payload = useMemo(
    () => ({ summary, config, metrics, findings, rules, optimization, trace, finalRecommendation, metadata, notes }),
    [summary, config, metrics, findings, rules, optimization, trace, finalRecommendation, metadata, notes],
  );

  const download = (data: string, filename: string, mime: string) => {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onExportPdf = () => window.print();
  const onPrint = () => window.print();
  const onExportJson = () =>
    download(JSON.stringify(payload, null, 2), `${metadata.runId}.json`, "application/json");
  const onExportCsv = () => {
    const rows = [
      ["section", "key", "value"],
      ["summary", "grade", summary.grade],
      ["summary", "overallRisk", summary.overallRisk],
      ["summary", "dropSurvival", String(summary.dropSurvival)],
      ["summary", "movementRisk", String(summary.movementRisk)],
      ["summary", "accessoryLoss", String(summary.accessoryLoss)],
      ["summary", "packagingCost", summary.packagingCost],
      ["summary", "sustainability", String(summary.sustainability)],
      ["summary", "confidence", String(summary.confidence)],
      ...rules.map((r) => ["rule", r.id, `${r.severity} — ${r.rule}`]),
      ...optimization.map((r) => ["optimization", r.label, `${r.before} -> ${r.after} (${r.delta})`]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    download(csv, `${metadata.runId}.csv`, "text/csv");
  };
  const onShare = () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share?.({
        title: "PackWise AI — Engineering Report",
        text: `Run ${metadata.runId} · Grade ${summary.grade} · Confidence ${summary.confidence}%`,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && typeof window !== "undefined") {
      const nav = navigator as Navigator & { clipboard?: { writeText: (t: string) => Promise<void> } };
      nav.clipboard?.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
        <ExecutiveSummary summary={summary} />
        <ConfigurationSummary config={config} />
        <RiskDashboard m={metrics} />
        <EngineeringFindings findings={findings} />
        <TriggeredRulesTable rules={rules} />
        <OptimizationSummary rows={optimization} />
        <DecisionTrace steps={trace} />
        <FinalRecommendationCard rec={finalRecommendation} />
        <EngineeringNotes value={notes} onChange={setNotes} />
        <div className="print:hidden">
          <ExportCenter
            onExportPdf={onExportPdf}
            onExportJson={onExportJson}
            onExportCsv={onExportCsv}
            onPrint={onPrint}
            onShare={onShare}
          />
        </div>
        <div className="hidden print:block">
          <Separator className="my-4" />
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Appendix</div>
          <p className="text-xs mt-2">
            Report generated by {metadata.modelVersion} using {metadata.ruleEngineVersion} and {metadata.knowledgeBaseVersion}.
            {" "}
            {metadata.rulesEvaluated} engineering rules evaluated against {metadata.literaturePapers} literature sources.
            Confidence score {metadata.confidence}%.
          </p>
        </div>
        <ReportMetadataFooter meta={metadata} />
    </div>
  );
}
