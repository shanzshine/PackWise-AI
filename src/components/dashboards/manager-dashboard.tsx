import { Link } from "@tanstack/react-router";
import { DollarSign, Leaf, Target, TrendingDown, TrendingUp, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import type { AuthUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { type ApprovalRequest } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";


export function ManagerDashboard({ user }: { user: AuthUser }) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('approval')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(3);
      if (data) setApprovals(data);
      setIsLoading(false);
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations Overview"
        description={`Executive snapshot for ${user.company ?? "your organization"} — attachment costs, labor trends & sustainability.`}
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="TOTAL SKUs SUBMITTED" value={approvals.length.toString()} icon={Target} hint="Products with attachment plans" />
        <KpiCard label="PENDING DECISIONS" value={approvals.filter(a => a.status === "Pending").length.toString()} icon={ShieldAlert} hint="Plans awaiting your review" />
        <KpiCard label="AVG. SUSTAINABILITY" value={`${approvals.length > 0 ? Math.round(approvals.reduce((sum, a) => sum + (a.sustainability || 0), 0) / approvals.length) : 0}%`} icon={Leaf} hint="Eco-friendly score across plans" />
        <KpiCard label="REJECTED PLANS" value={approvals.filter(a => a.status === "Rejected").length.toString()} icon={TrendingDown} hint="Plans sent back for revision" />
      </div>

      {/* Pending Approvals */}
      <Card className="border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base text-[color:var(--warning-foreground)]">Pending Attachment Approvals</CardTitle>
            <CardDescription>Attachment plans awaiting your review before proceeding to production.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/approvals">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="h-6 w-6 animate-pulse text-amber-500 mb-2" />
              <p className="text-sm text-muted-foreground">Retrieving pending approvals...</p>
            </div>
          ) : approvals.filter(a => a.status === "Pending").length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending approvals. All plans have been decided.</p>
          ) : (
            <div className="space-y-3">
              {approvals.filter(a => a.status === "Pending").map((req, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{req.sku}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Requested by {req.engineer_name} on {new Date(req.submitted_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Est. Cost</p>
                      <p className="text-sm font-medium">{req.est_cost}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-medium uppercase text-muted-foreground">Risk Level</p>
                      <p className={`text-sm font-medium ${req.risk_level === "Low" ? "text-[color:var(--success)]" : "text-[color:var(--warning-foreground)]"}`}>{req.risk_level}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" asChild>
                        <Link to="/app/approvals/$id" params={{ id: req.req_id || 'REQ-000' }}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
