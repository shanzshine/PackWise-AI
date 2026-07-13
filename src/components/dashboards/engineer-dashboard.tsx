import { Link } from "@tanstack/react-router";
import { Activity, Sparkles, ArrowRight, ShieldAlert, ScanLine, Link2, CheckCircle2, Clock } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { performanceTrend, recentAnalyses, recommendations } from "@/lib/mock-data";
import type { AuthUser } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  Optimized: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  Review: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  Pending: "bg-muted text-muted-foreground border-transparent",
};

const riskColors: Record<string, string> = {
  low: "text-[color:var(--success)]",
  medium: "text-[color:var(--warning-foreground)]",
  high: "text-destructive",
};

const ZONE_SUMMARY = [
  { zone: "Hair", method: "Elastic Strap", risk: "medium", stability: 85 },
  { zone: "Waist", method: "PET Support", risk: "low", stability: 94 },
  { zone: "Right Wrist", method: "EVA Strap", risk: "high", stability: 90 },
  { zone: "Left Foot", method: "No Attachment", risk: "low", stability: 100 },
];

export function EngineerDashboard({ user }: { user: AuthUser }) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's your attachment optimization workspace — active projects, risk flags, and AI recommendations."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/reports">Export report</Link>
            </Button>
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
        <KpiCard label="ACTIVE ANALYSES" value="4" icon={Activity} hint="Products currently in optimization" />
        <KpiCard label="ATTACHMENT ZONES MAPPED" value="47" icon={ScanLine} hint="AI-identified zones across all SKUs" />
        <KpiCard label="AVG. RISK REDUCTION" value="71%" icon={ShieldAlert} hint="Vs. unplanned attachment baseline" />
        <KpiCard label="POSE CONFIGURATIONS" value="24" icon={Sparkles} hint="Alternative plans generated this month" />
      </div>

      {/* Approvals Status */}
      <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/5 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base text-foreground">Attachment Approvals</CardTitle>
            <CardDescription>Track the status of your submitted attachment plans.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "REQ-091", sku: "Action Hero Series 7", date: "Approved Today, 09:15 AM", risk: "Medium", cost: "$0.45/unit", status: "Approved" },
              { id: "REQ-092", sku: "Glamour Doll – Sparkle Edition", date: "Submitted Today, 10:45 AM", risk: "Low", cost: "$0.38/unit", status: "Pending" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${req.status === 'Approved' ? 'bg-[color:var(--success)]/15 text-[color:var(--success)]' : 'bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]'}`}>
                    {req.status === 'Approved' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{req.sku}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{req.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Est. Cost</p>
                    <p className="text-sm font-medium">{req.cost}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Risk Level</p>
                    <p className={`text-sm font-medium ${req.risk === "Low" ? "text-[color:var(--success)]" : "text-[color:var(--warning-foreground)]"}`}>{req.risk}</p>
                  </div>
                  {req.status === "Approved" ? (
                    <Button size="sm" className="bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white" asChild>
                      <Link to="/app/reports">Upload Report</Link>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-border/60 bg-muted/50 text-muted-foreground font-normal">Under Review</Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/app/approvals/${req.id}`}>View Details</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Active workflow — Glamour Doll Sparkle Edition</CardTitle>
          <CardDescription>Track progress through the attachment optimization pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {[
              { label: "Pose & Doll Analysis", done: true, url: "/app/product-analysis", icon: ScanLine },
              { label: "Attachment Planner", done: true, url: "/app/packaging-planner", icon: Link2 },
              { label: "Attachment Visualizer", done: false, url: "/app/packaging-preview", icon: Link2 },
              { label: "Risk Assessment", done: false, url: "/app/risk-assessment", icon: ShieldAlert },
              { label: "Cost & Sustainability", done: false, url: "/app/cost-analysis", icon: Activity },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex flex-1 items-center">
                <Link to={step.url} className="group flex flex-col items-center gap-1.5 px-2 text-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${step.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground group-hover:border-primary/50"}`}>
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-[10px] font-medium leading-tight ${step.done ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                </Link>
                {i < arr.length - 1 && (
                  <div className={`h-px flex-1 ${step.done ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses Table */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent analyses</CardTitle>
            <CardDescription>Latest attachment optimization runs across your team.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link to="/app/reports">View all</Link></Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stability</TableHead>
                <TableHead className="text-right">Est. savings</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAnalyses.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.product}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[a.status]}>{a.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={a.efficiency} className="h-1.5 w-16" />
                      <span className="tabular-nums text-xs">{a.efficiency}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.savings}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{a.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Zone Summary */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Active attachment plan — Glamour Doll Sparkle Edition</CardTitle>
          <CardDescription>Current attachment zone assignments and stability scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ZONE_SUMMARY.map((z) => (
              <div key={z.zone} className="rounded-lg border border-border/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{z.zone}</p>
                  <Badge variant="outline" className={`border-transparent text-[10px] font-medium capitalize ${z.risk === "high" ? "bg-destructive/10 text-destructive" :
                      z.risk === "medium" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]" :
                        "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                    }`}>{z.risk} risk</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{z.method}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Pose stability</span><span className="font-medium text-foreground">{z.stability}%</span>
                  </div>
                  <Progress value={z.stability} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}