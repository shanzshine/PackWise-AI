import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronRight, Recycle, Leaf,
  DollarSign, Clock, Sparkles, Brain, Send, CheckCircle2, FileText,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, loadPlan, type PlanResult, type PlanZoneRow } from "@/lib/workflow-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/cost-analysis")({
  head: () => ({ meta: [{ title: "Cost & Sustainability — PackWise AI" }] }),
  component: CostSustainabilityPage,
});

const WORKFLOW_STEPS = [
  { label: "Product Input", done: true },
  { label: "Analysis Results", done: true },
  { label: "Attachment Planner",    done: true  },
  { label: "Risk Assessment",      done: true  },
  { label: "Cost & Sustainability", active: true },
];

// Sustainability score per material
const MATERIAL_SUSTAINABILITY: Record<string, number> = {
  "Elastic Strap": 68,
  "PET Support": 78,
  "EVA Strap": 82,
  "Cardboard Support": 90,
  "No Attachment Required": 100,
};

const MATERIAL_COSTS: Record<string, number> = {
  "Elastic Strap": 0.08,
  "PET Support": 0.18,
  "EVA Strap": 0.12,
  "Cardboard Support": 0.15,
  "No Attachment Required": 0.00,
};

const MATERIAL_COLORS: Record<string, string> = {
  "Elastic Strap": "var(--color-chart-1)",
  "PET Support": "var(--color-chart-2)",
  "EVA Strap": "var(--color-chart-3)",
  "Cardboard Support": "var(--color-chart-4)",
  "No Attachment Required": "var(--color-chart-5)",
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

function CostSustainabilityPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const analysis = loadAnalysis();
    if (!analysis) {
      toast.error("Please complete Product Analysis first.");
      navigate({ to: "/app/product-analysis" });
      return;
    }
    setProductName(analysis.productName);
    const p = loadPlan();
    if (!p) {
      toast.error("Please run the Packaging Planner before viewing Cost Analysis.");
      navigate({ to: "/app/packaging-planner" });
      return;
    }
    setPlan(p);
    setReady(true);
  }, []);

  if (!ready) return null;

  // Compute derived data from plan
  const activeZones = plan?.zones.filter(z => z.action !== "Remove") ?? [];
  const removedZones = plan?.zones.filter(z => z.action === "Remove") ?? [];
  const addedZones = plan?.zones.filter(z => z.action === "Add") ?? [];
  const keptZones = plan?.zones.filter(z => z.action === "Keep") ?? [];

  const totalCost = plan?.totalCost ?? 0;
  const avgSustainability = plan?.avgSustainability ?? 78;
  const avgStability = plan?.avgStability ?? 88;
  const totalLabor = activeZones.reduce((s, z) => s + z.laborMins, 0);

  // Cost savings from removed zones
  const costSavings = removedZones.reduce((s, z) => s + z.cost, 0);

  // Material breakdown for pie chart (from active zones only)
  const materialCounts: Record<string, { count: number; totalCost: number }> = {};
  for (const z of activeZones) {
    const m = z.recommendedMethod;
    const baseM = m.split(" (")[0];
    if (baseM === "Not needed" || baseM === "No Attachment Required") continue;
    const qty = z.quantity ?? 1;
    if (!materialCounts[baseM]) materialCounts[baseM] = { count: 0, totalCost: 0 };
    materialCounts[baseM].count += qty;
    materialCounts[baseM].totalCost += z.cost;
  }
  const pieData = Object.entries(materialCounts).map(([name, d]) => ({
    name,
    value: d.count,
    cost: d.totalCost,
    color: MATERIAL_COLORS[name] ?? "var(--color-chart-5)",
  }));

  // Bar chart data: per-zone cost comparison
  const barData = (plan?.zones ?? []).filter(z => z.action !== "Remove").map(z => ({
    zone: z.zone,
    cost: z.cost,
    sustainability: MATERIAL_SUSTAINABILITY[z.recommendedMethod] ?? 80,
    stability: z.stability,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost & Sustainability"
        description={`Attachment costs, material analysis, and environmental impact — ${productName}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Risk Assessment
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/reports" })} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </>
        }
      />
      <WorkflowBar />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Cost / Unit",    value: `$${totalCost.toFixed(2)}`,   sub: `${activeZones.length} attachment zones`, icon: DollarSign,  color: "text-primary" },
          { label: "Est. Labor / Unit",    value: `${totalLabor.toFixed(1)} min`, sub: "Production line estimate", icon: Clock,      color: "text-[color:var(--chart-2)]" },
          { label: "Cost Savings",         value: costSavings > 0 ? `-$${costSavings.toFixed(2)}` : "$0.00",   sub: removedZones.length > 0 ? `${removedZones.length} zone(s) removed by AI` : "No zones removed", icon: Sparkles, color: "text-[color:var(--success)]" },
          { label: "Sustainability Score", value: `${avgSustainability}/100`, sub: plan?.recommendedMaterial ? `Material: ${plan.recommendedMaterial}` : "Weighted average",   icon: Leaf,       color: "text-[color:var(--success)]" },
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

      {/* Cost Breakdown Table from Plan */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-base">Attachment Cost Breakdown</CardTitle>
              <CardDescription>Per-zone cost and sustainability from AI recommendation plan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-center">Action</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Labor</TableHead>
                <TableHead className="text-right">Sustainability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(plan?.zones ?? []).map((z) => {
                const qty = z.quantity ?? 1;
                const materialName = z.action === "Remove" ? z.currentMethod : z.recommendedMethod;
                // Strip counts from string (e.g. "Elastic Strap (2x)" -> "Elastic Strap")
                const baseMaterial = materialName.split(" (")[0];
                const unitCost = MATERIAL_COSTS[baseMaterial] || 0;

                return (
                  <TableRow key={z.zone} className={
                    z.action === "Keep" ? "bg-[color:var(--success)]/5" :
                    z.action === "Add" ? "bg-blue-500/5" :
                    z.action === "Remove" ? "bg-destructive/5 opacity-60" : ""
                  }>
                    <TableCell className="font-medium">{z.zone}</TableCell>
                    <TableCell>
                      {z.action === "Remove" ? (
                        <span className="text-sm text-muted-foreground italic line-through">{z.currentMethod}</span>
                      ) : (
                        <span className="text-sm font-medium">{z.recommendedMethod}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {z.action === "Keep" && <Badge className="bg-[color:var(--success)] text-white border-0 text-[10px]">Keep</Badge>}
                      {z.action === "Add" && <Badge className="bg-blue-500 text-white border-0 text-[10px]">Add</Badge>}
                      {z.action === "Remove" && <Badge variant="destructive" className="text-[10px]">Remove</Badge>}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs tabular-nums">
                      {qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {unitCost === 0 ? <span className="text-muted-foreground">—</span> : `$${unitCost.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {z.action === "Remove" ? (
                        <span className="text-[color:var(--success)] font-semibold">-${z.cost.toFixed(2)}</span>
                      ) : z.cost === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        `$${z.cost.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {z.action === "Remove" ? <span className="text-muted-foreground">—</span> : z.laborMins > 0 ? `${z.laborMins} min` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={z.sustainability} className="h-1.5 w-12" />
                        <span className="tabular-nums text-xs">{z.sustainability}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totals row */}
              <TableRow className="border-t-2 border-border font-semibold">
                <TableCell colSpan={5} className="font-semibold">Total (Recommended)</TableCell>
                <TableCell className="text-right tabular-nums font-bold text-primary">${totalCost.toFixed(2)}</TableCell>
                <TableCell className="text-right tabular-nums font-bold">{totalLabor.toFixed(1)} min</TableCell>
                <TableCell className="text-right font-bold">{avgSustainability}/100</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Per-zone cost bar chart */}
        <Card className="border-border/70 shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Cost & Sustainability per Zone</CardTitle>
            <CardDescription>Cost and sustainability score for each recommended attachment zone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="zone" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="sustainability" name="Sustainability" fill="var(--color-chart-1)" radius={[3,3,0,0]} />
                  <Bar dataKey="stability" name="Stability" fill="var(--color-chart-2)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Material distribution pie */}
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Material Distribution</CardTitle>
            <CardDescription>Attachment materials used in recommended plan</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={2}>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, name: string) => [`${v} zone(s)`, name]} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1.5">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="text-xs font-medium">${d.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No attachment data available. Run the Attachment Planner first.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none mt-8">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold">Generate Final Report</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Compile the analysis, attachment plan, risk assessment, and cost into a final PDF report.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/app/reports" })} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
            <FileText className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
