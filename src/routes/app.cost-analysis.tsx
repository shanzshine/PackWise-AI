import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronRight, Leaf,
  DollarSign, Clock, Sparkles, Brain, Send, FileText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, loadPlan, DEMO_RESULT, type PlanResult, type PlanZoneRow } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";

const DEMO_PLAN: PlanResult = {
  plan_id: "plan-demo-1",
  zones: [
    { zone: "Hair", currentMethod: "None", recommendedMethod: "Elastic Strap", action: "Add", cvDetected: true, xgbRecommended: true, cost: 0.16, laborMins: 0.8, sustainability: 68, stability: 85, riskReduction: 40, quantity: 2 },
    { zone: "Waist", currentMethod: "None", recommendedMethod: "PET Support", action: "Add", cvDetected: true, xgbRecommended: true, cost: 0.18, laborMins: 1.2, sustainability: 78, stability: 90, riskReduction: 50, quantity: 1 },
    { zone: "Right Wrist", currentMethod: "None", recommendedMethod: "EVA Strap", action: "Add", cvDetected: true, xgbRecommended: true, cost: 0.12, laborMins: 0.5, sustainability: 82, stability: 75, riskReduction: 30, quantity: 1 },
    { zone: "Left Foot", currentMethod: "None", recommendedMethod: "No Attachment Required", action: "Keep", cvDetected: false, xgbRecommended: false, cost: 0.00, laborMins: 0.0, sustainability: 100, stability: 95, riskReduction: 0, quantity: 1 },
  ],
  totalCost: 0.46,
  avgStability: 86.25,
  avgSustainability: 82.0,
  recommendedMaterial: "Cardboard Support / PET Support",
  totalLaborMins: 2.5
};

export const Route = createFileRoute("/app/cost-analysis")({
  head: () => ({ meta: [{ title: "Cost & Sustainability — PackWise AI" }] }),
  beforeLoad: () => {
    const user = getUser();
    const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin";
    if (isManagerOrAdmin) return;

    const analysis = loadAnalysis();
    if (!analysis?.id) {
      throw redirect({ to: "/app/product-analysis" });
    }
  },
  component: CostSustainabilityPage,
});

const WORKFLOW_STEPS = [
  { label: "Product Input", done: true },
  { label: "Analysis Results", done: true },
  { label: "Attachment Planner",    done: true  },
  { label: "Risk Assessment",      done: true  },
  { label: "Cost & Sustainability", active: true },
];

// Material colors for charts (UI only)



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
  const [analysisId, setAnalysisId] = useState("");
  const [productName, setProductName] = useState("Cost & Sustainability");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [methodProps, setMethodProps] = useState<Record<string, any> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let p = loadPlan();
    if (!p) {
      p = DEMO_PLAN;
    }
    const analysis = loadAnalysis() || DEMO_RESULT;

    setAnalysisId(analysis.id || "");
    setProductName(analysis.productName);
    setPlan(p);
    
    // Fetch dynamic attachment methods from Supabase
    supabase.from('attachment_methods').select('*').then(({ data, error }) => {
      if (data && !error) {
        const props: Record<string, any> = {};
        data.forEach(d => {
          props[d.name] = {
            cost: Number(d.cost_per_gram) || 0,
            sustainability: d.sustainability_score || 0,
          };
        });
        setMethodProps(props);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  // Compute derived data from plan
  const activeZones = plan?.zones.filter(z => z.action !== "Remove") ?? [];
  const removedZones = plan?.zones.filter(z => z.action === "Remove") ?? [];
  const totalCost = plan?.totalCost ?? 0;
  const avgSustainability = plan?.avgSustainability ?? 78;
  const avgStability = plan?.avgStability ?? 88;
  const totalLabor = plan?.totalLaborMins ?? activeZones.reduce((s, z) => s + z.laborMins, 0);

  // Cost savings from removed zones
  const costSavings = removedZones.reduce((s, z) => s + z.cost, 0);



  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost & Sustainability"
        description={`Attachment costs, material analysis, and environmental impact — ${productName}`}
        actions={
          <div className="flex items-center gap-2">
            {analysisId && (
              <Badge variant="outline" className="border-border/70 font-mono text-muted-foreground bg-muted/20">
                ID: #{analysisId.split('-')[0].toUpperCase()}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/risk-assessment" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Risk Assessment
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/submit-approval" })} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="mr-2 h-4 w-4" /> Submit Plan
            </Button>
          </div>
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
                const unitCost = methodProps?.[baseMaterial]?.cost || 0;

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


      {/* CTA */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none mt-8">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold">Ready to Submit?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Preview the full engineering report, then submit your packaging plan to the Operations Manager for approval.</p>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/app/submit-approval" })} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="mr-2 h-4 w-4" /> Submit Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
