import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronRight, DollarSign, ShieldAlert, AlertTriangle,
  TrendingDown, CheckCircle2, Brain, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, DEMO_RESULT } from "@/lib/workflow-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/risk-assessment")({
  head: () => ({ meta: [{ title: "Risk Assessment — PackWise AI" }] }),
  component: RiskAssessmentPage,
});

const WORKFLOW_STEPS = [
  { label: "Pose & Doll Analysis", done: true  },
  { label: "Attachment Planner",    done: true  },
  { label: "Attachment Visualizer", done: true  },
  { label: "Risk Assessment",      active: true },
  { label: "Cost & Sustainability", done: false },
];

const BODY_REGION_RISKS = [
  { region: "Right Arm / Wrist", riskScore: 78, level: "high"   },
  { region: "Head / Hair",       riskScore: 54, level: "medium" },
  { region: "Left Leg / Foot",   riskScore: 22, level: "low"    },
  { region: "Torso / Waist",     riskScore: 31, level: "low"    },
  { region: "Left Arm",          riskScore: 19, level: "low"    },
  { region: "Right Leg",         riskScore: 14, level: "low"    },
];

const ACCESSORY_RISKS = [
  { accessory: "Glasses",     lossRisk: 81, level: "high"   },
  { accessory: "Handbag",     lossRisk: 62, level: "medium" },
  { accessory: "Crown",       lossRisk: 44, level: "medium" },
  { accessory: "Shoes",       lossRisk: 18, level: "low"    },
  { accessory: "Dress Stand", lossRisk: 12, level: "low"    },
];

const DROP_TEST_DATA = [
  { plan: "Current Plan",  passRate: 87 },
  { plan: "Alt. Plan A",   passRate: 78 },
  { plan: "Alt. Plan B",   passRate: 93 },
  { plan: "No Attachment",  passRate: 31 },
];

const AI_SUGGESTIONS = [
  { level: "high",   text: "Add EVA strap at Right Wrist — reduces movement risk by 34%, from High → Low.",            impact: "-34% movement risk" },
  { level: "medium", text: "Replace Rubber Band at Glasses accessory with Blister Support — loss risk drops from 81% → 22%.", impact: "-59% loss risk"     },
  { level: "low",    text: "Waist PET Support is performing optimally — no change recommended.",                          impact: "Stable"             },
  { level: "medium", text: "Consider adding Crown accessory to dedicated compartment — reduces loss risk from 44% → 8%.", impact: "-36% loss risk"     },
];

const RISK_BADGE: Record<string, string> = {
  low:    "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  high:   "bg-destructive/10 text-destructive border-transparent",
};
const RISK_BAR: Record<string, string> = {
  low: "bg-[color:var(--success)]", medium: "bg-[color:var(--warning)]", high: "bg-destructive",
};
const RISK_DOT: Record<string, string> = {
  low: "bg-[color:var(--success)]", medium: "bg-[color:var(--warning)]", high: "bg-destructive",
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

function RiskAssessmentPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("Glamour Doll – Sparkle Edition");

  useEffect(() => {
    const a = loadAnalysis() ?? DEMO_RESULT;
    setProductName(a.productName);
  }, []);

  const movementRisk   = 44;
  const accessoryLoss  = 61;
  const poseStability  = 76;
  const dropTestPass   = 87;

  const overallGrade = dropTestPass >= 90 ? "A" : dropTestPass >= 80 ? "B+" : dropTestPass >= 70 ? "B" : "C";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Assessment"
        description={`Predictive movement, accessory loss, and drop-test analysis — ${productName}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/packaging-preview" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Visualizer
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/cost-analysis" })}>
              <DollarSign className="h-4 w-4" /> Cost & Sustainability <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <WorkflowBar />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Movement Risk Score", value: `${movementRisk}/100`,
            sub: "Medium — 2 zones flagged",
            color: movementRisk >= 65 ? "text-destructive" : movementRisk >= 35 ? "text-[color:var(--warning-foreground)]" : "text-[color:var(--success)]",
          },
          {
            label: "Accessory Loss Risk", value: `${accessoryLoss}/100`,
            sub: "Medium — Glasses at high risk",
            color: accessoryLoss >= 65 ? "text-destructive" : "text-[color:var(--warning-foreground)]",
          },
          {
            label: "Pose Stability Score", value: `${poseStability}/100`,
            sub: "Needs improvement at wrist",
            color: poseStability >= 80 ? "text-[color:var(--success)]" : "text-[color:var(--warning-foreground)]",
          },
          {
            label: "Drop-Test Prediction", value: `${dropTestPass}%`,
            sub: `Grade ${overallGrade} — likely to pass`,
            color: dropTestPass >= 85 ? "text-[color:var(--success)]" : "text-[color:var(--warning-foreground)]",
          },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className={`mt-1 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Movement Risk by Body Region */}
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Movement Risk by Body Region</CardTitle>
                <CardDescription>Risk score per zone based on pose geometry and attachment plan</CardDescription>
              </div>
              <Badge variant="outline" className="border-border/70 text-xs font-normal">
                <ShieldAlert className="mr-1 h-3 w-3" /> AI Predicted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {BODY_REGION_RISKS.map((r) => (
              <div key={r.region}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${RISK_DOT[r.level]}`} />
                    <span className="text-sm font-medium">{r.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-medium capitalize ${RISK_BADGE[r.level]}`}>{r.level}</Badge>
                    <span className="tabular-nums text-xs font-semibold w-8 text-right">{r.riskScore}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all ${RISK_BAR[r.level]}`} style={{ width: `${r.riskScore}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Accessory Loss Risk */}
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Accessory Loss Risk</CardTitle>
                <CardDescription>Predicted loss probability per detected accessory item</CardDescription>
              </div>
              <Badge variant="outline" className="border-border/70 text-xs font-normal">
                <AlertTriangle className="mr-1 h-3 w-3" /> {ACCESSORY_RISKS.filter(a => a.level === "high").length} high risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ACCESSORY_RISKS.map((a) => (
              <div key={a.accessory}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${RISK_DOT[a.level]}`} />
                    <span className="text-sm font-medium">{a.accessory}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-medium capitalize ${RISK_BADGE[a.level]}`}>{a.level}</Badge>
                    <span className="tabular-nums text-xs font-semibold w-8 text-right">{a.lossRisk}%</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all ${RISK_BAR[a.level]}`} style={{ width: `${a.lossRisk}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Drop Test Chart */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Drop-Test Pass Rate Prediction</CardTitle>
              <CardDescription>Predicted pass rate comparison across attachment plan variants</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Grade {overallGrade}
              </Badge>
              <Badge variant="outline" className="border-border/70 text-xs font-normal">{dropTestPass}% confidence</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DROP_TEST_DATA} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="plan" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Pass Rate"]}
                />
                <Bar dataKey="passRate" name="Pass Rate %" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]}>
                  {DROP_TEST_DATA.map((entry, i) => (
                    <rect key={i} fill={entry.plan === "Current Plan" ? "var(--color-chart-1)" : entry.plan === "No Attachment" ? "var(--color-chart-3)" : "var(--color-chart-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-base">AI Improvement Suggestions</CardTitle>
          </div>
          <CardDescription>Targeted changes to reduce risk and improve drop-test readiness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AI_SUGGESTIONS.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3">
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${RISK_DOT[s.level]}`} />
              <p className="flex-1 text-xs leading-relaxed text-foreground">{s.text}</p>
              <Badge variant="outline" className={`shrink-0 text-[10px] font-semibold ${RISK_BADGE[s.level]}`}>{s.impact}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold">Review cost and sustainability impact</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Analyse attachment element costs, labor time, carbon footprint, and a what-if comparison.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/app/cost-analysis" })} className="shrink-0">
            <DollarSign className="h-4 w-4" /> Cost & Sustainability <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
