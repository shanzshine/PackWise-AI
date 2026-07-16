import { Link } from "@tanstack/react-router";
import { Activity, Sparkles, ArrowRight, ShieldAlert, ScanLine, Link2 } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { performanceTrend, recommendations } from "@/lib/mock-data";
import type { AuthUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { loadAnalysis, type ApprovalRequest } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, string> = {
  Optimized: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  Review: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  Pending: "bg-muted text-muted-foreground border-transparent",
  Approved: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  Rejected: "bg-destructive/10 text-destructive border-transparent",
};

export function EngineerDashboard({ user }: { user: AuthUser }) {
  const [myApprovals, setMyApprovals] = useState<any[]>([]);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>("—");
  const analysis = loadAnalysis();

  useEffect(() => {
    async function fetchData() {
      // Fetch approvals
      const { data: approvals } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('pe_id', user.user_id)
        .order('submitted_at', { ascending: false });
      
      if (approvals) setMyApprovals(approvals);

      // Fetch last analysis
      const { data: analyses } = await supabase
        .from('product_analyses')
        .select('created_at')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (analyses && analyses.length > 0) {
        setLastAnalysisDate(new Date(analyses[0].created_at).toLocaleDateString());
      }
    }
    fetchData();
  }, [user.user_id]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's your attachment optimization workspace — active projects, risk flags, and AI recommendations."
        actions={
          <>
            <Button size="sm" asChild>
              <Link to="/app/product-analysis">
                <Sparkles className="h-4 w-4" /> New analysis
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="SUBMITTED PLANS" value={`${myApprovals.length}`} icon={Activity} hint="Plans submitted for approval" />
        <KpiCard label="PENDING REVIEW" value={`${myApprovals.filter(a => a.status === 'Pending').length}`} icon={ScanLine} hint="Awaiting manager approval" />
        <KpiCard label="APPROVED" value={`${myApprovals.filter(a => a.status === 'Approved').length}`} icon={ShieldAlert} hint="Plans approved for production" />
        <KpiCard label="LAST ANALYSIS" value={lastAnalysisDate} icon={Sparkles} hint="Most recent product scan" />
      </div>

      {/* Approvals Status */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/5 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base text-foreground">My Submitted Plans</CardTitle>
            <CardDescription>Track the status of your submitted attachment plans.</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link to="/app/submit-approval">Submit New Plan</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {myApprovals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No plans submitted yet. Complete a workflow and submit for approval.</p>
          ) : (
            <div className="space-y-3">
              {myApprovals.map((req, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{req.sku}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{new Date(req.submitted_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{req.est_cost}</span>
                    <Badge variant="outline" className={statusStyles[req.status] ?? ""}>{req.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Chart */}
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Performance trend</CardTitle>
              <CardDescription>Risk reduction, pose stability & sustainability — last 8 months.</CardDescription>
            </div>
            <Badge variant="outline" className="border-border/70 text-xs font-normal">Last 8 months</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="riskReduction" name="Risk Reduction %" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#g1)" />
                  <Area type="monotone" dataKey="poseStability" name="Pose Stability %" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-base">AI recommendations</CardTitle>
            </div>
            <CardDescription>Top opportunities across your active SKUs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.title} className="rounded-lg border border-border/70 p-3 transition hover:border-primary/40">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{r.title}</p>
                  <Badge variant="secondary" className="bg-[color:var(--primary-soft)] text-primary text-[10px] font-medium">{r.tag}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.impact}</p>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full justify-between text-primary hover:text-primary" asChild>
              <Link to="/app/packaging-planner">View attachment planner <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Progress */}
      {/* Workflow Pipeline */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Start a New Analysis</CardTitle>
          <CardDescription>Follow the pipeline to generate an AI-driven attachment plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {[
              { label: "Product Input", url: "/app/product-analysis", icon: ScanLine },
              { label: "Analysis Results", url: "/app/product-analysis", icon: ScanLine },
              { label: "Attachment Planner", url: "/app/packaging-planner", icon: Link2 },
              { label: "Risk Assessment", url: "/app/risk-assessment", icon: ShieldAlert },
              { label: "Cost & Sustainability", url: "/app/cost-analysis", icon: Activity },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex flex-1 items-center">
                <Link to={step.url} className="group flex flex-col items-center gap-1.5 px-2 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-muted text-muted-foreground group-hover:border-primary/50 transition">
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-medium leading-tight text-muted-foreground">{step.label}</span>
                </Link>
                {i < arr.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}