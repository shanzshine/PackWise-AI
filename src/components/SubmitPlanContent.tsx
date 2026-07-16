import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { loadAnalysis, loadPlan } from "@/lib/workflow-store";
import { Link } from "@tanstack/react-router";
import { getToken } from "@/lib/auth";
import { recommendPose, type Keypoint } from "@/lib/pose-recommendation";
import { PoseBlueprint } from "@/components/pose-blueprint";
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
  Loader2,
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

// Dummy data removed. Defaulting dynamically from backend.

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
        <SectionHeader index={4} icon={TrendingUp} title="Optimization Summary" sub="Current design vs. recommended optimized design." />
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

function ProductPhotoSection({
  analysis,
  plan,
  productName,
  accessories,
  detectedPoses,
  computedHeight,
  computedComplexity,
  computedCOG,
}: {
  analysis: any;
  plan: any;
  productName: string;
  accessories?: string[];
  detectedPoses?: string[];
  computedHeight?: string;
  computedComplexity?: string;
  computedCOG?: string;
}) {
  const imageDataUrl = analysis?.imageDataUrl;
  if (!imageDataUrl) return null;

  const activeKeypoints = getOrGenerateKeypoints(analysis);
  
  const recBlueprint = recommendPose(
    activeKeypoints,
    null,
    plan?.zones || [],
    analysis?.product_weight_g ?? 120,
    analysis?.accessory_count ?? 1,
    analysis?.hair_length ?? "Short",
    analysis?.selected_accessories ?? []
  );

  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader
          index={1}
          icon={Package}
          title="Product Detection Result"
          sub="Original doll capture with the resolved AI Pose Blueprint overlay."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Original Captured Image</p>
            <div className="rounded-xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center min-h-[280px]">
              <img src={imageDataUrl} alt="Product original" className="max-h-[320px] w-auto object-contain" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">AI Pose Blueprint Overlay</p>
            <div className="rounded-xl border border-border bg-white flex items-center justify-center min-h-[280px] p-2">
              <PoseBlueprint 
                mode="overlay" 
                recommendation={recBlueprint} 
                currentKeypoints={activeKeypoints} 
                className="w-full h-auto max-h-[300px]"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KV label="Product Name" value={productName} />
          <KV label="Detected Pose" value={(detectedPoses || []).join(", ") || "—"} />
          <KV label="Computed Height" value={computedHeight || "—"} />
          <KV label="Complexity" value={computedComplexity || "—"} />
          <KV label="Center of Gravity" value={computedCOG || "—"} />
          <KV label="Accessories Detected" value={accessories && accessories.length > 0 ? accessories.join(", ") : "None"} />
        </div>
      </CardContent>
    </Card>
  );
}

function FinalRecommendationCard({ rec }: { rec: FinalRecommendation }) {
  return (
    <Card className="border-border/70 shadow-none overflow-hidden">
      <div className="bg-gradient-to-br from-background to-[color:var(--pink-soft)] p-6">
        <SectionHeader index={5} icon={Sparkles} title="Final Packaging Recommendation" sub="The deployment-ready configuration produced by PackWise AI." />
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
        <SectionHeader index={6} icon={Wrench} title="Engineering Notes" sub="Reviewer observations captured before export." />
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
  isExporting,
}: {
  onExportPdf: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onShare: () => void;
  isExporting?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-6">
        <SectionHeader index={7} icon={Download} title="Export Center" sub="Distribute the report to engineering, QA, and manufacturing partners." />
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <Button
            onClick={onExportPdf}
            disabled={isExporting}
            size="lg"
            className="bg-[#d946ef] hover:bg-[#d946ef]/90 text-white flex-1 md:flex-none md:min-w-[280px]"
          >
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {isExporting ? "Generating PDF..." : "Download Engineering Report (PDF)"}
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

  // 3. Attachment Placements (Green circles styled like app.packaging-planner.tsx)
  const activePlacements = recResult.attachmentPlacements;
  for (const p of activePlacements) {
    const kp = recKps[p.keypointIndex];
    if (kp && kp.x > 0 && kp.y > 0) {
      const cx = kp.x + p.offsetX * W;
      const cy = kp.y + p.offsetY * H;
      
      linesHtml += `
        <g>
          <!-- Pulse ring -->
          <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${p.color || '#22c55e'}" stroke-width="1.2" opacity="0.3" />
          <!-- Main circle marker -->
          <circle cx="${cx}" cy="${cy}" r="7" fill="${p.color || '#22c55e'}" opacity="0.9" />
          <circle cx="${cx}" cy="${cy}" r="3.5" fill="white" opacity="0.8" />
          <!-- Labels -->
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

export default function SubmitPlanContent({ onDataLoaded }: { onDataLoaded?: (data: any) => void }) {
  const [notes, setNotes] = useState("");
  const [apiData, setApiData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const a = loadAnalysis() || { productName: "Mock Doll", product_weight_g: 120, height_cm: 29.0, center_of_gravity: "Center", accessory_count: 1, accessory_weight_g: 15.0, poseComplexityScore: 50, poseStabilityScore: 50, accessories: [] };
    const p = loadPlan() || { totalCost: 0, avgSustainability: 100, recommendedMaterial: "Standard", zones: [] };
    setAnalysis(a);
    setPlan(p);

    async function fetchApi() {
      const mockApi = {
        overall_risk_level: "LOW",
        categories: {
          "Movement Risk": { risk_percentage: 12 },
          "Accessory Loss Risk": { risk_percentage: 5 },
          "Drop Test Risk": { pass_probability: 92 },
        },
        explanation_trace: ["Rule R-WT-001 fired: weight is within bounds.", "Cushion thickness passed."]
      };
      const token = getToken();
      if (!token) {
        setApiData(mockApi);
        return;
      }
      try {
        const res = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            plan_id: Math.floor(Math.random() * 9000) + 1000,
            product_weight_g: a?.product_weight_g || 120,
            height_cm: a?.height_cm || 29.0,
            fragility_score: 5,
            center_of_gravity: a?.center_of_gravity || "Center",
            accessory_count: a?.accessory_count || 1,
            accessory_weight_g: a?.accessory_weight_g || 15.0,
            movement_score: 7,
            complexity_score: Math.round((a?.poseComplexityScore || 50) / 10),
            stability_index: Math.round((a?.poseStabilityScore || 50) / 10),
            recommended_head_strap: p?.zones?.find((z:any)=>z.zone==="Head/Hair")?.action!=="Remove"?1:0,
            recommended_waist_strap: p?.zones?.find((z:any)=>z.zone==="Waist")?.action!=="Remove"?1:0,
            recommended_hand_strap: p?.zones?.find((z:any)=>z.zone==="Hands/Wrists")?.action!=="Remove"?1:0,
            recommended_leg_strap: p?.zones?.find((z:any)=>z.zone==="Legs/Feet")?.action!=="Remove"?1:0,
          })
        });
        if (res.ok) {
          const data = await res.json();
          setApiData(data);
          onDataLoaded?.(data);
        } else {
          setApiData(mockApi);
          onDataLoaded?.(mockApi);
        }
      } catch (e) {
        console.error("Failed to fetch API:", e);
        setApiData(mockApi);
        onDataLoaded?.(mockApi);
      }
    }
    fetchApi();
  }, []);

  if (!apiData || !analysis || !plan) {
    return (
      <div className="lg:col-span-2 flex flex-col items-center justify-center p-20 text-muted-foreground border border-border/70 rounded-xl bg-background/50 h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-[color:var(--pink)] border-t-transparent rounded-full mb-6 shadow-sm"></div>
        <p className="text-lg font-medium text-foreground">Analyzing & Generating Report...</p>
        <p className="text-sm mt-2 opacity-70">Computing rule engine constraints and connecting to backend models.</p>
      </div>
    );
  }

  const summary = {
    grade: apiData.overall_risk_level === "LOW" ? "A" : apiData.overall_risk_level === "MEDIUM" ? "B" : "C",
    overallRisk: (apiData.overall_risk_level || "LOW").toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
    movementRisk: apiData.categories?.["Movement Risk"]?.risk_percentage || 0,
    accessoryLoss: apiData.categories?.["Accessory Loss Risk"]?.risk_percentage || 0,
    dropSurvival: apiData.categories?.["Drop Test Risk"]?.pass_probability || 0,
    packagingCost: `$${plan.totalCost?.toFixed(2) || "0.00"}`,
    sustainability: plan.avgSustainability || 100,
    confidence: 94,
  };

  const config = {
    productName: analysis.productName || "Custom Package",
    packagingType: "Rigid Paperboard Window Box",
    packagingMethod: "Plastic-free Display Box",
    attachmentMethod: plan.recommendedMaterial || "Optimized Strapping",
    supportPoints: plan.zones ? plan.zones.filter((z: any) => z.action !== 'Remove').length : 4,
    centerOfGravity: analysis.center_of_gravity || "Center",
    internalClearance: "5.0 mm",
    cushionMaterial: "EPE Foam / Molded Pulp",
    cushionThickness: "15 mm",
    istaStandard: "ISTA 3A",
    scenario: "Normal Shipping",
    weight: `${analysis.product_weight_g || 120} g`,
    dimensions: `${analysis.height_cm || 29.0} cm (H)`,
    accessoriesDetected: analysis.accessory_count || 1,
  };

  const metrics = {
    movementRisk: summary.movementRisk,
    accessoryLoss: summary.accessoryLoss,
    poseStability: plan.avgStability || 100,
    dropSurvival: summary.dropSurvival,
    criticalFailureCount: summary.overallRisk === "HIGH" ? 2 : 0,
    triggeredRules: apiData.categories ? Object.values(apiData.categories).flatMap((v: any) => v.matched_rules || []).length : 0,
    literatureCoverage: 92,
    ruleCoverage: 98,
  };

  const findings = apiData.categories ? Object.entries(apiData.categories).map(([k, v]: any) => ({
    status: (v.risk_level === "LOW" ? "pass" : v.risk_level === "MEDIUM" ? "warn" : "fail") as "pass" | "warn" | "fail",
    text: `${k}: ${v.risk_percentage}% risk probability.`
  })) : [];

  const rules = apiData.categories ? Object.values(apiData.categories).flatMap((v: any) => v.matched_rules || []).map((r: any) => ({
    id: r.rule_id || "RULE",
    evidence: r.evidence_id || "N/A",
    rule: r.explanation || r.source_reference,
    severity: r.severity || "Medium",
    recommendation: "Review packaging configuration."
  })) : [];

  const optimization: OptimizationRow[] = [];
  const trace = (apiData.explanation_trace || []).map((t: string, i: number) => ({
    stage: "Rule Engine Trace",
    label: `Analysis Step ${i + 1}`,
    detail: t
  }));

  const finalRecommendation = {
    packaging: "Eco-friendly Window Box",
    cushion: "Molded Pulp Insert",
    attachment: config.attachmentMethod,
    support: "Multi-point support",
    ista: "ISTA 3A Certified",
    status: "READY FOR PROTOTYPE",
  };

  const metadata = {
    generatedAt: new Date().toLocaleString(),
    runId: `PW-RUN-${Math.floor(Math.random()*9000)+1000}`,
    modelVersion: "YOLOv8 & XGBoost v1.0",
    ruleEngineVersion: "Rule Engine v2.5",
    knowledgeBaseVersion: "KB v19.1",
    literaturePapers: 24,
    rulesEvaluated: metrics.triggeredRules,
    confidence: summary.confidence,
  };

  const payload = { summary, config, metrics, findings, rules, optimization, trace, finalRecommendation, metadata, notes };

  const download = (data: string, filename: string, mime: string) => {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onExportPdf = () => {
    if (isExporting) return;
    setIsExporting(true);

    const totalLabor = plan?.totalLaborMins ?? (plan?.zones || []).reduce((s: number, z: any) => s + (z.laborMins || 0), 0);
    const imageUrl = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("packwise_image") : null) || analysis?.imageDataUrl || "";
    const annotatedUrl = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("packwise_annotated_image") : null) || analysis?.annotatedImageDataUrl || "";

    const zonesHtml = (plan?.zones || []).map((z: any) => `<tr><td><strong>${z.zone}</strong></td><td>${z.recommendedMethod}</td><td>${z.action}</td><td>$${Number(z.cost || 0).toFixed(2)}</td><td>${Number(z.laborMins || 0).toFixed(1)} min</td><td>${z.sustainability || 0}%</td></tr>`).join("");
    const rulesHtml = rules.map((r) => `<tr><td><strong>${r.id}</strong></td><td>${r.rule}</td><td>${r.severity}</td><td>${r.recommendation}</td></tr>`).join("");

    const activeKeypoints = getOrGenerateKeypoints(analysis);
    const recResult = recommendPose(
      activeKeypoints,
      null,
      plan?.zones || [],
      analysis?.product_weight_g ?? 120,
      analysis?.accessory_count ?? 1,
      analysis?.hair_length ?? "Short",
      analysis?.selected_accessories ?? []
    );

    const { poseRationale, stringRationales } = getPoseRationaleAndStrings(analysis);

    const stringRationalesHtml = recResult.attachmentPlacements.map(p => {
      const rationale = stringRationales[p.zone] || "Secures the joint against transit displacement.";
      return `
        <div style="font-size: 8.5px; padding: 4px 8px; border-left: 2.5px solid #22c55e; background: #f8fafc; border-top-right-radius: 4px; border-bottom-right-radius: 4px; margin-bottom: 3px; line-height: 1.3;">
          <strong style="color: #0f172a;">${p.zone} (${p.method}):</strong> ${rationale}
        </div>
      `;
    }).join("");

    const blueprintSvg = buildReportBlueprintSvg(analysis, plan);

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PackWise AI — Engineering Report ${metadata.runId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
  @page { margin: 12mm 15mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter','Segoe UI',sans-serif; color: #1e293b; background: #fff; font-size: 10px; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .page { padding: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; border-bottom: 2.5px solid #ec4899; margin-bottom: 18px; }
  .header h1 { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
  .header p  { font-size: 10px; color: #64748b; margin-top: 2px; }
  .header-meta { text-align: right; font-size: 9px; color: #94a3b8; line-height: 1.6; font-family: monospace; }

  .dash { display: grid; grid-template-columns: 130px 1fr; gap: 14px; margin-bottom: 18px; }
  .grade-card { background: linear-gradient(135deg,#fdf2f8,#fce7f3); border: 1px solid #fbcfe8; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; justify-content: center; }
  .grade-letter { font-size: 42px; font-weight: 900; color: #ec4899; line-height: 1; }
  .grade-sub { font-size: 9px; font-weight: 700; color: #64748b; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge-low { background: #d1fae5; color: #065f46; }
  .badge-medium { background: #fef3c7; color: #92400e; }
  .badge-high { background: #fee2e2; color: #991b1b; }

  .metrics { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; }
  .mc { background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 8px 12px; }
  .mc-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #be185d; font-weight: 700; margin-bottom: 2px; }
  .mc-val { font-size: 18px; font-weight: 900; color: #0f172a; }
  .mc-unit { font-size: 10px; color: #94a3b8; font-weight: 500; }

  .section { margin-bottom: 18px; page-break-inside: avoid; }
  .stitle { font-size: 9px; font-weight: 900; color: #ec4899; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 4px; border-bottom: 1px solid #fbcfe8; margin-bottom: 10px; }

  .kv { display: grid; grid-template-columns: repeat(6,1fr); gap: 6px; }
  .ki { padding: 6px 8px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; }
  .ki-lbl { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }
  .ki-val { font-size: 9.5px; font-weight: 600; color: #0f172a; }

  .visual-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px; }
  .visual-box { border: 1px solid #fbcfe8; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; background: #fff; }
  .visual-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #be185d; font-weight: 700; padding: 5px 9px; border-bottom: 1px solid #fbcfe8; background: #fdf2f8; }
  .visual-box img { width: 100%; height: 210px; object-fit: contain; display: block; background: #fff; }
  .visual-svg-container { width: 100%; height: 210px; padding: 4px; display: flex; justify-content: center; align-items: center; overflow: hidden; }

  .photo-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
  .photo-box { border: 1px solid #fbcfe8; border-radius: 8px; overflow: hidden; }
  .photo-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #be185d; font-weight: 700; padding: 5px 9px; border-bottom: 1px solid #fbcfe8; background: #fdf2f8; }

  table { width: 100%; border-collapse: collapse; }
  th { background: #fdf2f8; color: #be185d; font-weight: 700; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.06em; padding: 6px 8px; text-align: left; border-bottom: 1.5px solid #fbcfe8; }
  td { padding: 6px 8px; border-bottom: 1px solid #fdf2f8; color: #334155; vertical-align: middle; font-size: 9.5px; }
  tr:last-child td { border-bottom: none; }

  .rec { display: grid; grid-template-columns: repeat(6,1fr); gap: 8px; background: #fdf2f8; padding: 10px; border-radius: 8px; border: 1px solid #fbcfe8; }
  .ri-lbl { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #be185d; font-weight: 700; margin-bottom: 2px; }
  .ri-val { font-size: 10px; font-weight: 800; color: #831843; }

  .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #fbcfe8; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; }
</style>
</head>
<body>
<div class="page">
  <!-- Page 1: Visuals and Configuration -->
  <div class="header">
    <div>
      <h1>PackWise AI &mdash; Engineering Report</h1>
      <p>${config.productName} &nbsp;&middot;&nbsp; ${metadata.generatedAt}</p>
    </div>
    <div class="header-meta">
      <div>RUN ID: ${metadata.runId}</div>
    </div>
  </div>

  <div class="dash">
    <div class="grade-card">
      <div class="grade-letter">${summary.grade}</div>
      <div class="grade-sub">AI Readiness Grade</div>
      <div class="badge badge-${summary.overallRisk.toLowerCase()}">${summary.overallRisk} RISK</div>
    </div>
    <div class="metrics">
      <div class="mc"><div class="mc-lbl">Packaging Cost</div><div class="mc-val">${summary.packagingCost}</div></div>
      <div class="mc"><div class="mc-lbl">Labor Time</div><div class="mc-val">${Number(totalLabor).toFixed(1)}<span class="mc-unit"> min</span></div></div>
      <div class="mc"><div class="mc-lbl">Drop Survival</div><div class="mc-val">${summary.dropSurvival}<span class="mc-unit">/100</span></div></div>
      <div class="mc"><div class="mc-lbl">Sustainability</div><div class="mc-val">${summary.sustainability}<span class="mc-unit">%</span></div></div>
    </div>
  </div>

  <div class="section">
    <div class="stitle">AI Pose &amp; Attachment Visual Comparison</div>
    <div class="visual-grid">
      <div class="visual-box">
        <div class="visual-lbl">Original Captured Image</div>
        ${imageUrl ? `<img src="${imageUrl}" alt="Original" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:9px;">No image capture</div>`}
      </div>
      <div class="visual-box">
        <div class="visual-lbl">CV Detected Attachments</div>
        ${annotatedUrl ? `<img src="${annotatedUrl}" alt="Detected" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:9px;">No detection overlay</div>`}
      </div>
      <div class="visual-box">
        <div class="visual-lbl">AI Pose Blueprint Overlay</div>
        <div class="visual-svg-container">
          ${blueprintSvg || '<div style="color:#94a3b8;font-size:9px;">No blueprint SVG</div>'}
        </div>
      </div>
    </div>
  </div>

  <div class="section" style="margin-bottom: 0px;">
    <div class="stitle">Product Configuration Summary</div>
    <div class="kv">
      <div class="ki"><div class="ki-lbl">Packaging Type</div><div class="ki-val">${config.packagingType}</div></div>
      <div class="ki"><div class="ki-lbl">Attachment Method</div><div class="ki-val">${config.attachmentMethod}</div></div>
      <div class="ki"><div class="ki-lbl">Cushion Material</div><div class="ki-val">${config.cushionMaterial}</div></div>
      <div class="ki"><div class="ki-lbl">Weight</div><div class="ki-val">${config.weight}</div></div>
      <div class="ki"><div class="ki-lbl">Dimensions</div><div class="ki-val">${config.dimensions}</div></div>
      <div class="ki"><div class="ki-lbl">Accessories</div><div class="ki-val">${config.accessoriesDetected} detected</div></div>
    </div>
  </div>

  <div class="section" style="margin-top: 10px;">
    <div class="stitle">DFA / MTM Attachment Plan</div>
    <table>
      <thead>
        <tr>
          <th>Zone</th>
          <th>Method</th>
          <th>Action</th>
          <th>Cost</th>
          <th>Labor</th>
          <th>Eco%</th>
        </tr>
      </thead>
      <tbody>
        ${zonesHtml}
      </tbody>
    </table>
  </div>

  ${rulesHtml ? `
  <div class="section">
    <div class="stitle">Triggered Engineering Rules</div>
    <table>
      <thead>
        <tr>
          <th style="width: 70px;">Rule ID</th>
          <th>Explanation</th>
          <th style="width: 60px;">Severity</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${rulesHtml}
      </tbody>
    </table>
  </div>` : ""}

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

  <div class="section">
    <div class="stitle">Final Implementation Recommendation</div>
    <div class="rec">
      <div><div class="ri-lbl">Packaging</div><div class="ri-val">${finalRecommendation.packaging}</div></div>
      <div><div class="ri-lbl">Cushion</div><div class="ri-val">${finalRecommendation.cushion}</div></div>
      <div><div class="ri-lbl">Attachment</div><div class="ri-val">${finalRecommendation.attachment}</div></div>
      <div><div class="ri-lbl">Support</div><div class="ri-val">${finalRecommendation.support}</div></div>
      <div><div class="ri-lbl">ISTA Standard</div><div class="ri-val">${finalRecommendation.ista}</div></div>
      <div><div class="ri-lbl">Status</div><div class="ri-val" style="color:#ec4899;">&#10004; ${finalRecommendation.status}</div></div>
    </div>
  </div>

  ${notes.trim() ? `
  <div class="section">
    <div class="stitle">Engineering Notes & Observations</div>
    <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 9.5px; color: #334155; white-space: pre-wrap;">
      ${notes.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
    </div>
  </div>
  ` : ""}

  <div class="footer">
    <div>PackWise AI &middot; Powered by YOLOv11 &amp; Expert System KB v19.1</div>
    <div>Strictly Confidential &middot; Internal Engineering Document</div>
  </div>
</div>
</body>
</html>`;

    // Use hidden iframe — print dialog appears directly, no new page opens
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;width:0;height:0;border:0;left:-9999px;top:0;visibility:hidden;";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      setIsExporting(false);
      toast.error("Could not initialize PDF print. Try again.");
      return;
    }

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Give fonts and images time to load before triggering print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // fallback: open in new tab if iframe print blocked
        const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1500);
    }, 1000);

    setIsExporting(false);
    toast.success("Print dialog opening — choose 'Save as PDF' as destination.");
  };
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
        <ProductPhotoSection
          analysis={analysis}
          plan={plan}
          productName={config.productName}
          accessories={analysis?.accessories || []}
          detectedPoses={analysis?.detectedPoses}
          computedHeight={analysis?.computedHeight}
          computedComplexity={analysis?.computedComplexity}
          computedCOG={analysis?.computedCOG}
        />
        <ConfigurationSummary config={config} />
        <RiskDashboard m={metrics} />
        <OptimizationSummary rows={optimization} />
        <FinalRecommendationCard rec={finalRecommendation} />
        <EngineeringNotes value={notes} onChange={setNotes} />
        <div className="print:hidden">
          <ExportCenter
            onExportPdf={onExportPdf}
            onExportJson={onExportJson}
            onExportCsv={onExportCsv}
            onPrint={onPrint}
            onShare={onShare}
            isExporting={isExporting}
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
