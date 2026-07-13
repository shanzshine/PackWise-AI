import { Link } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { DollarSign, Leaf, Target, TrendingDown, TrendingUp, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { costBreakdown, monthlyTrends, sustainabilityMetrics } from "@/lib/mock-data";
import type { AuthUser } from "@/lib/auth";

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

const riskTrend = [
  { month: "Mar", movement: 68, accessoryLoss: 74 },
  { month: "Apr", movement: 63, accessoryLoss: 70 },
  { month: "May", movement: 57, accessoryLoss: 65 },
  { month: "Jun", movement: 52, accessoryLoss: 61 },
  { month: "Jul", movement: 47, accessoryLoss: 57 },
  { month: "Aug", movement: 44, accessoryLoss: 53 },
];

export function ManagerDashboard({ user }: { user: AuthUser }) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations Overview"
        description={`Executive snapshot for ${user.company ?? "your organization"} — attachment costs, labor trends & sustainability.`}
        actions={<Button size="sm" variant="outline">Download executive summary</Button>}
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="TOTAL SKUs ANALYZED" value="12" icon={Target} hint="Products with attachment plans" />
        <KpiCard label="COST SAVINGS YTD" value="$52k" icon={DollarSign} hint="vs. unoptimized attachment baseline" />
        <KpiCard label="AVG. LABOR REDUCTION" value="31%" icon={TrendingDown} hint="Per unit vs. prior methods" />
        <KpiCard label="AVG. RISK SCORE" value="44/100" icon={ShieldAlert} hint="Movement risk across portfolio" />
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
          <div className="space-y-3">
            {[
              { sku: "Glamour Doll – Sparkle Edition", engineer: "Eng. Alice", date: "Today, 10:45 AM", risk: "Low", cost: "$0.38/unit" },
              { sku: "Action Hero Series 7", engineer: "Eng. Bob", date: "Yesterday, 3:15 PM", risk: "Medium", cost: "$0.45/unit" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{req.sku}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Requested by {req.engineer} on {req.date}</p>
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
                  <div className="flex items-center gap-2">
                    <Button size="sm" asChild>
                      <Link to={`/app/approvals/REQ-09${2 - i}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cost trend */}
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly cost &amp; savings trend</CardTitle>
            <CardDescription>Cost per 1,000 units vs. realized monthly savings from attachment optimization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="savings" name="Savings ($k)" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cost" name="Cost / 1k units ($)" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost composition */}
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Attachment cost composition</CardTitle>
            <CardDescription>Where your per-unit attachment spend goes today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costBreakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>
                    {costBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5 text-xs">
              {costBreakdown.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    {c.name}
                  </span>
                  <span className="tabular-nums font-medium">{c.value}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sustainability */}
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sustainability progress</CardTitle>
            <CardDescription>Attachment material recyclability &amp; environmental targets for 2026.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {sustainabilityMetrics.map((m) => (
              <div key={m.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">{m.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {m.value}% <span className="text-xs">/ target {m.target}%</span>
                  </span>
                </div>
                <Progress value={(m.value / m.target) * 100} className="mt-2 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Executive summary</CardTitle>
            <CardDescription>Auto-generated insights this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { tag: "Wins", text: "Glamour Doll Sparkle Edition achieved 94% pose stability — highest this quarter.", tone: "success" },
              { tag: "Watch", text: "Right Wrist zone flagged as high-risk on 3 active SKUs — engineer review pending.", tone: "warning" },
              { tag: "Next", text: "Approve EVA strap rollout across 6 remaining collectible doll SKUs.", tone: "info" },
            ].map((item) => (
              <div key={item.tag} className="rounded-lg border border-border/70 p-3">
                <Badge variant="outline" className={
                  item.tone === "success" ? "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent text-[10px]" :
                    item.tone === "warning" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent text-[10px]" :
                      "bg-[color:var(--primary-soft)] text-primary border-transparent text-[10px]"
                }>{item.tag}</Badge>
                <p className="mt-2 text-sm text-foreground">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Risk reduction trends</CardTitle>
          <CardDescription>Movement risk and accessory loss risk scores — declining as attachment plans mature.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[30, 80]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="movement" name="Movement Risk Score" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="accessoryLoss" name="Accessory Loss Risk Score" stroke="var(--color-chart-4)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}