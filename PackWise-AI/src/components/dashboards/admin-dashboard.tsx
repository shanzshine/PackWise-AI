import { Link } from "@tanstack/react-router";
import { Users, UserPlus, FolderKanban, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { managedUsers, recentActivities } from "@/lib/mock-data";
import type { AuthUser } from "@/lib/auth";

export function AdminDashboard({ user }: { user: AuthUser }) {
  const pending = managedUsers.filter((u) => u.status === "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Administration`}
        description={`Manage users, roles, and platform health, ${user.name.split(" ")[0]}.`}
        actions={
          <Button asChild size="sm">
            <Link to="/app/users"><UserPlus className="h-4 w-4" />Review approvals</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Users" value="1,284" icon={Users} hint="Across 38 companies" />
        <KpiCard label="Pending Approvals" value={`${pending.length}`} icon={UserPlus} hint="Awaiting review" />
        <KpiCard label="Active Projects" value="167" icon={FolderKanban} hint="Currently in progress" />
        <KpiCard label="Server Status" value="Online" icon={Activity} hint="All models operational" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent activities</CardTitle>
              <CardDescription>What's happening across the platform right now.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View audit log <ArrowRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/70">
              {recentActivities.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-xs font-semibold text-primary">
                    {a.who.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Pending approvals</CardTitle>
            <CardDescription>{pending.length} accounts waiting on you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.slice(0, 4).map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.company}</p>
                </div>
                <Badge variant="outline" className="bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent text-[10px]">
                  {u.joined}
                </Badge>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/app/users">Go to user management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}