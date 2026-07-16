import { Link } from "@tanstack/react-router";
import { Activity, Sparkles, ShieldAlert, ScanLine, Link2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import type { AuthUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { loadAnalysis, clearAllWorkflowData, type ApprovalRequest } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";
import { openReportInNewTab } from "@/lib/report-generator";

const statusStyles: Record<string, string> = {
  Optimized: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  Review: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  Pending: "bg-muted text-muted-foreground border-transparent",
  Approved: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  Rejected: "bg-destructive/10 text-destructive border-transparent",
};

export function EngineerDashboard({ user }: { user: AuthUser }) {
  // Wipe any residual session synchronously when the dashboard renders
  // to guarantee the UI is locked until a new analysis is explicitly started.
  if (typeof window !== "undefined") {
    clearAllWorkflowData();
  }

  const [myApprovals, setMyApprovals] = useState<any[]>([]);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>("—");
  const [isLoading, setIsLoading] = useState(true);
  const analysis: any = null; // Force null since we just cleared it

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
      setIsLoading(false);
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-6 w-6 animate-pulse text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Retrieving plans data...</p>
            </div>
          ) : myApprovals.length === 0 ? (
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
                    {req.report_snapshot && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-7 text-xs px-2"
                        onClick={() => openReportInNewTab({
                          reqId: req.req_id || req.id,
                          sku: req.sku,
                          engineer: req.engineer_name || req.engineer,
                          date: new Date(req.submitted_at || req.date).toLocaleString(),
                          status: req.status,
                          grade: req.report_snapshot?.grade,
                          overallRisk: req.report_snapshot?.overallRisk,
                          dropSurvival: req.report_snapshot?.dropSurvival,
                          movementRisk: req.report_snapshot?.movementRisk,
                          accessoryLoss: req.report_snapshot?.accessoryLoss,
                          zones: req.report_snapshot?.zones,
                          finalRecommendation: req.report_snapshot?.finalRecommendation,
                          imageDataUrl: req.report_snapshot?.imageDataUrl,
                          annotatedImageDataUrl: req.report_snapshot?.annotatedImageDataUrl,
                          accessories: req.report_snapshot?.accessories,
                          detectedPoses: req.report_snapshot?.detectedPoses,
                        })}
                      >
                        <FileText className="h-3 w-3" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



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
              { label: "Product Input", url: "/app/product-analysis", icon: ScanLine, reqA: false },
              { label: "Analysis Results", url: "/app/product-analysis", icon: ScanLine, reqA: false },
              { label: "Attachment Planner", url: "/app/packaging-planner", icon: Link2, reqA: true },
              { label: "Risk Assessment", url: "/app/risk-assessment", icon: ShieldAlert, reqA: true },
              { label: "Cost & Sustainability", url: "/app/cost-analysis", icon: Activity, reqA: true },
            ].map((step, i, arr) => {
              const isDisabled = step.reqA && !analysis?.id;
              return (
                <div key={step.label} className="flex flex-1 items-center">
                  <Link 
                    to={isDisabled ? "#" : step.url} 
                    disabled={isDisabled}
                    onClick={(e) => isDisabled && e.preventDefault()}
                    className={`group flex flex-col items-center gap-1.5 px-2 text-center ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-muted text-muted-foreground group-hover:border-primary/50 transition">
                      <step.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-medium leading-tight text-muted-foreground">{step.label}</span>
                  </Link>
                  {i < arr.length - 1 && <div className="h-px flex-1 bg-border" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}