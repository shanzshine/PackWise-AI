import { Link } from "@tanstack/react-router";
import { Users, UserPlus, FolderKanban, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import type { AuthUser } from "@/lib/auth";

export function AdminDashboard({ user }: { user: AuthUser }) {

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
        <KpiCard label="Total Users" value="—" icon={Users} hint="Registered accounts" />
        <KpiCard label="Pending Approvals" value="0" icon={UserPlus} hint="Awaiting review" />
        <KpiCard label="Active Projects" value="—" icon={FolderKanban} hint="Currently in progress" />
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
              <li className="py-6 text-center text-sm text-muted-foreground">No recent activities yet.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Pending approvals</CardTitle>
            <CardDescription>User accounts waiting on you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-4">No pending user approvals.</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/app/users">Go to user management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}