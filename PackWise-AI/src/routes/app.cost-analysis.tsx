import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronRight, FileBarChart2, Recycle, Wind, Leaf,
  TrendingDown, DollarSign, Clock, Sparkles, Brain, Send,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, DEMO_RESULT } from "@/lib/workflow-store";

export const Route = createFileRoute("/app/cost-analysis")({
  head: () => ({ meta: [{ title: "Cost & Sustainability — PackWise AI" }] }),
  component: CostSustainabilityPage,
});

const WORKFLOW_STEPS = [
  { label: "Pose & Doll Analysis", done: true  },
  { label: "Attachment Planner",    done: true  },
  { label: "Attachment Visualizer", done: true  },
  { label: "Risk Assessment",      done: true  },
  { label: "Cost & Sustainability", active: true },
];

const attachmentMaterialBreakdown = [
  { name: "EVA Straps",         value: 36, color: "var(--color-chart-1)" },
  { name: "PET Supports",       value: 28, color: "var(--color-chart-2)" },
  { name: "Elastic Straps",     value: 22, color: "var(--color-chart-3)" },
  { name: "Rubber Bands",       value: 8,  color: "var(--color-chart-4)" },
  { name: "Cardboard Supports", value: 6,  color: "var(--color-chart-5)" },
];

const sustainabilityTrend = [
  { month: "Jan", score: 64, waste: 32, carbon: 5.8 },
  { month: "Feb", score: 68, waste: 30, carbon: 5.4 },
  { month: "Mar", score: 72, waste: 27, carbon: 5.0 },
  { month: "Apr", score: 76, waste: 24, carbon: 4.6 },
  { month: "May", score: 80, waste: 21, carbon: 4.1 },
  { month: "Jun", score: 84, waste: 18, carbon: 3.7 },
  { month: "Jul", score: 88, waste: 15, carbon: 3.3 },
  { month: "Aug", score: 92, waste: 12, carbon: 2.9 },
];

const whatIfData = [
  { scenario: "Current Plan",      costPerUnit: 0.38, laborMin: 2.3, sustainability: 78, riskScore: 44 },
  { scenario: "Alt. Plan A (EVA)", costPerUnit: 0.52, laborMin: 2.9, sustainability: 83, riskScore: 31 },
  { scenario: "Alt. Plan B (Blister)", costPerUnit: 0.68, laborMin: 3.4, sustainability: 61, riskScore: 22 },
  { scenario: "Minimal (Rubber Band)", costPerUnit: 0.12, laborMin: 0.9, sustainability: 71, riskScore: 72 },
];

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

function CostSustainabilityPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("Glamour Doll – Sparkle Edition");

  useEffect(() => {
    const analysis = loadAnalysis() ?? DEMO_RESULT;
    setProductName(analysis.productName);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost & Sustainability"
        description={`Attachment element costs, labor analysis, and environmental impact — ${productName}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Risk Assessment
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/submit-approval" })} className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90">
              <Send className="mr-2 h-4 w-4" /> Submit Plan
            </Button>
          </>
        }
      />
      <WorkflowBar />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Cost / Unit",    value: "$0.38",  sub: "All attachment elements", icon: DollarSign,  color: "text-primary" },
          { label: "Est. Labor / Unit",    value: "2.3 min",sub: "Production line estimate", icon: Clock,      color: "text-[color:var(--chart-2)]" },
          { label: "Recyclability",        value: "High",   sub: "EVA & PET dominant mix",   icon: Recycle,    color: "text-[color:var(--success)]" },
          { label: "Sustainability Score", value: "78/100", sub: "Above industry average",   icon: Leaf,       color: "text-[color:var(--success)]" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Material Breakdown */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/70 shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Attachment Material Composition</CardTitle>
            <CardDescription>Cost share by attachment element type — total $0.38 / unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attachmentMaterialBreakdown.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="tabular-nums font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
              <p className="text-sm font-semibold">Material Efficiency</p>
              <p className="text-xl font-bold text-[color:var(--success)]">Optimal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Material Distribution</CardTitle>
            <CardDescription>Proportion by attachment element type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attachmentMaterialBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={2}>
                    {attachmentMaterialBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {attachmentMaterialBreakdown.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Trend */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Sustainability Trend</CardTitle>
          <CardDescription>Sustainability score, material waste and carbon footprint over the last 8 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sustainabilityTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="score" name="Sustainability Score" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#gs)" />
                <Area type="monotone" dataKey="waste" name="Material Waste %" stroke="var(--color-chart-3)" strokeWidth={2} fill="none" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* What-If Analysis */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-base">What-If Analysis</CardTitle>
              <CardDescription>Compare attachment plan variants across cost, labor, sustainability, and risk</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={whatIfData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="scenario" stroke="var(--color-muted-foreground)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sustainability" name="Sustainability" fill="var(--color-chart-1)" radius={[3,3,0,0]} />
                <Bar dataKey="riskScore"      name="Risk Score"     fill="var(--color-chart-3)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {whatIfData.map((s) => (
              <div key={s.scenario} className={`rounded-lg border p-3 ${s.scenario === "Current Plan" ? "border-primary/30 bg-[color:var(--primary-soft)]/30" : "border-border/60"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold leading-tight">{s.scenario}</p>
                  {s.scenario === "Current Plan" && <Badge className="bg-primary/20 text-primary border-transparent text-[9px]">Active</Badge>}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cost/unit</span><span className="font-medium">${s.costPerUnit.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Labor</span><span className="font-medium">{s.laborMin} min</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sustainability</span><span className="font-medium">{s.sustainability}/100</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Risk score</span><span className="font-medium">{s.riskScore}/100</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold">Ready for Production?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Submit the completed analysis and attachment plan to the Operations Manager for final approval.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/app/submit-approval" })} className="shrink-0 bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90">
            <Send className="mr-2 h-4 w-4" /> Submit Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
