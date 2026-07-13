import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronRight, ShieldAlert, DollarSign, Leaf, Clock, Zap, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, DEMO_RESULT, type AnalysisResult, type AttachmentZone } from "@/lib/workflow-store";

export const Route = createFileRoute("/app/packaging-preview")({
  head: () => ({ meta: [{ title: "Attachment Visualizer — PackWise AI" }] }),
  component: AttachmentVisualizerPage,
});

const WORKFLOW_STEPS = [
  { label: "Pose & Doll Analysis", done: true  },
  { label: "Attachment Planner",    done: true  },
  { label: "Attachment Visualizer", active: true },
  { label: "Risk Assessment",      done: false },
  { label: "Cost & Sustainability", done: false },
];

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

// Attachment zone positions on the SVG canvas (200 × 400)
const ZONE_POSITIONS: Record<string, { cx: number; cy: number }> = {
  "Hair":        { cx: 100, cy: 10  },
  "Waist":       { cx: 148, cy: 162 },
  "Right Wrist": { cx: 182, cy: 188 },
  "Left Foot":   { cx: 72,  cy: 358 },
};

const ZONE_DETAIL: Record<string, { cost: string; labor: string; sustainability: number; impact: string }> = {
  "Hair":        { cost: "$0.08", labor: "0.5 min", sustainability: 68, impact: "Reduces hair zone movement risk from Medium → Low" },
  "Waist":       { cost: "$0.18", labor: "1.1 min", sustainability: 78, impact: "Stabilises torso pose geometry, 81% risk reduction" },
  "Right Wrist": { cost: "$0.12", labor: "0.7 min", sustainability: 82, impact: "Critical zone — eliminates high-risk displacement flag" },
  "Left Foot":   { cost: "$0.00", labor: "0 min",   sustainability: 100,impact: "Zone is stable — no attachment element required"       },
};

function WorkflowBar() {
  return (
    <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
      {WORKFLOW_STEPS.map((s, i, arr) => {
        const isActive = "active" in s && s.active;
        const isDone   = "done" in s && s.done;
        return (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground"}`}>
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`hidden text-[9px] font-medium sm:block ${isActive ? "text-primary" : isDone ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < arr.length - 1 && <div className={`mx-1 h-px flex-1 ${isDone ? "bg-[color:var(--success)]" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function DollSVG({
  zones, selected, onSelect,
}: { zones: AttachmentZone[]; selected: string | null; onSelect: (z: string) => void }) {
  const bodyColor   = "hsl(220 14% 18%)";
  const bodyStroke  = "hsl(220 14% 26%)";
  const skinColor   = "hsl(220 13% 22%)";

  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 rounded-xl" style={{
        backgroundImage: "linear-gradient(hsl(220 14% 96%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 14% 96%) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />

      <svg viewBox="0 0 200 400" className="relative z-10 h-[340px] w-auto drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
        {/* ── Doll silhouette ── */}
        {/* Head */}
        <circle cx="100" cy="42" r="28" fill={skinColor} stroke={bodyStroke} strokeWidth="1.5" />
        {/* Neck */}
        <rect x="94" y="68" width="12" height="16" rx="3" fill={skinColor} stroke={bodyStroke} strokeWidth="1.5" />
        {/* Torso */}
        <path d="M62 82 Q54 82 54 92 L54 168 Q54 182 100 185 Q146 182 146 168 L146 92 Q146 82 138 82 Z"
          fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" />
        {/* Left arm */}
        <path d="M62 94 Q38 130 24 188" stroke={skinColor} strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M62 94 Q38 130 24 188" stroke={bodyStroke} strokeWidth="18" fill="none" strokeLinecap="round" strokeOpacity="0.3" />
        {/* Right arm */}
        <path d="M138 94 Q162 130 176 188" stroke={skinColor} strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M138 94 Q162 130 176 188" stroke={bodyStroke} strokeWidth="18" fill="none" strokeLinecap="round" strokeOpacity="0.3" />
        {/* Left leg */}
        <path d="M82 188 L78 340" stroke={skinColor} strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M82 188 L78 340" stroke={bodyStroke} strokeWidth="20" fill="none" strokeLinecap="round" strokeOpacity="0.25" />
        {/* Right leg */}
        <path d="M118 188 L122 340" stroke={skinColor} strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M118 188 L122 340" stroke={bodyStroke} strokeWidth="20" fill="none" strokeLinecap="round" strokeOpacity="0.25" />
        {/* Left foot */}
        <ellipse cx="72" cy="352" rx="18" ry="10" fill={skinColor} stroke={bodyStroke} strokeWidth="1.5" />
        {/* Right foot */}
        <ellipse cx="128" cy="352" rx="18" ry="10" fill={skinColor} stroke={bodyStroke} strokeWidth="1.5" />

        {/* ── Attachment zone markers ── */}
        {zones.map((z, idx) => {
          const pos = ZONE_POSITIONS[z.zone];
          if (!pos) return null;
          const fill   = RISK_FILL[z.riskLevel];
          const stroke = RISK_STROKE[z.riskLevel];
          const isSelected = selected === z.zone;
          return (
            <g key={z.zone} className="cursor-pointer" onClick={() => onSelect(z.zone)}>
              {/* Pulse ring */}
              {isSelected && (
                <circle cx={pos.cx} cy={pos.cy} r="18" fill={fill} fillOpacity="0.2" stroke={stroke} strokeWidth="1" strokeDasharray="3 2" />
              )}
              {/* Connector line to label area */}
              <line x1={pos.cx} y1={pos.cy} x2={pos.cx > 100 ? pos.cx + 14 : pos.cx - 14} y2={pos.cy}
                stroke={stroke} strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
              {/* Main marker */}
              <circle cx={pos.cx} cy={pos.cy} r="11" fill={fill} fillOpacity={isSelected ? 1 : 0.85} stroke={stroke} strokeWidth={isSelected ? 2.5 : 1.5} />
              {/* Zone number */}
              <text x={pos.cx} y={pos.cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{idx + 1}</text>
            </g>
          );
        })}
      </svg>

      {/* Zone legend below */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3">
        {zones.map((z, i) => (
          <button key={z.zone} onClick={() => onSelect(z.zone)}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold transition ${selected === z.zone ? "ring-1 ring-primary" : "opacity-70 hover:opacity-100"}`}
            style={{ background: RISK_FILL[z.riskLevel] + "22", color: RISK_STROKE[z.riskLevel] }}>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white text-[8px] font-bold" style={{ background: RISK_FILL[z.riskLevel] }}>{i + 1}</span>
            {z.zone}
          </button>
        ))}
      </div>
    </div>
  );
}

function AttachmentVisualizerPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const a = loadAnalysis() ?? DEMO_RESULT;
    setAnalysis(a);
    setSelected(a.attachmentZones[0]?.zone ?? null);
  }, []);

  const zones = analysis?.attachmentZones ?? DEMO_RESULT.attachmentZones;
  const productName = analysis?.productName ?? DEMO_RESULT.productName;
  const sel = zones.find((z) => z.zone === selected);
  const selDetail = selected ? ZONE_DETAIL[selected] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attachment Visualizer"
        description={`Attachment zone layout and attachment element placement — ${productName}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/packaging-planner" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Planner
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })}>
              <ShieldAlert className="h-4 w-4" /> Risk Assessment <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <WorkflowBar />

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Zones Secured",      value: `${zones.filter(z => z.recommendedMethod !== "No Attachment Required").length} / ${zones.length}`, icon: Zap         },
          { label: "Est. Labor / Unit",  value: "2.3 min",    icon: Clock       },
          { label: "Avg. Pose Stability",value: "90%",        icon: ShieldAlert  },
          { label: "Sustainability Score",value: "76/100",    icon: Leaf        },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary-soft)] text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* SVG Doll Visualizer */}
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Attachment Zone Map</CardTitle>
            <CardDescription>Click a numbered marker to inspect the zone details</CardDescription>
          </CardHeader>
          <CardContent className="relative overflow-hidden rounded-xl bg-muted/20 p-4" style={{ minHeight: 380 }}>
            <DollSVG zones={zones} selected={selected} onSelect={setSelected} />
          </CardContent>
        </Card>

        {/* Zone Inspection Panel */}
        <div className="space-y-4 lg:col-span-3">
          {/* Zone List */}
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Zone Inspector</CardTitle>
              <CardDescription>Select a zone to view attachment details, risk level, and cost impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {zones.map((z, i) => (
                <button
                  key={z.zone}
                  onClick={() => setSelected(z.zone)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${selected === z.zone ? "border-primary bg-[color:var(--primary-soft)]/40" : "border-border/60 hover:border-primary/30 hover:bg-muted/30"}`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: RISK_FILL[z.riskLevel] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{z.zone}</span>
                      <Badge variant="outline" className={`text-[10px] font-medium capitalize ${RISK_BADGE[z.riskLevel]}`}>{z.riskLevel} risk</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{z.bodyRegion}</span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground">{z.recommendedMethod}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Selected Zone Detail */}
          {sel && selDetail && (
            <Card className="border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ background: RISK_FILL[sel.riskLevel] }}>
                    {zones.indexOf(sel) + 1}
                  </div>
                  <CardTitle className="text-base">{sel.zone}</CardTitle>
                  <Badge variant="outline" className={`text-[10px] font-medium capitalize ${RISK_BADGE[sel.riskLevel]}`}>{sel.riskLevel} risk</Badge>
                </div>
                <CardDescription>{sel.bodyRegion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="rounded-lg bg-background border border-border/60 p-3 text-center">
                    <DollarSign className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Cost / Unit</p>
                    <p className="text-lg font-bold">{selDetail.cost}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border/60 p-3 text-center">
                    <Clock className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Labor</p>
                    <p className="text-lg font-bold">{selDetail.labor}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border/60 p-3 text-center">
                    <Leaf className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Sustainability</p>
                    <p className="text-lg font-bold">{selDetail.sustainability}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Recommended Method</p>
                  <p className="text-sm font-medium text-foreground">{sel.recommendedMethod}</p>
                  <div className="mt-2 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">{selDetail.impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inside-Box Layout Summary */}
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Attachment Summary</CardTitle>
              <CardDescription>Bill of materials for the selected attachment plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Attachment Points",  value: `${zones.filter(z => z.recommendedMethod !== "No Attachment Required").length}` },
                  { label: "Total Material Weight",    value: "8.4 g / unit" },
                  { label: "Est. Labor / Unit",        value: "2.3 minutes"  },
                  { label: "Recyclability Score",      value: "76 / 100"     },
                  { label: "Zones at High Risk",       value: `${zones.filter(z => z.riskLevel === "high").length}`   },
                  { label: "Zones Requiring No Attachment", value: `${zones.filter(z => z.recommendedMethod === "No Attachment Required").length}` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold">Run predictive risk assessment</p>
            <p className="mt-0.5 text-xs text-muted-foreground">AI will predict movement risk, accessory loss probability, and drop-test readiness.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })} className="shrink-0">
            <ShieldAlert className="h-4 w-4" /> Risk Assessment <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
