import { Link } from "@tanstack/react-router";
import { Users, UserPlus, FolderKanban, Activity, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import type { AuthUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function AdminDashboard({ user }: { user: AuthUser }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeProjects: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch total users & pending users
        const { data: users } = await supabase
          .from('app_user')
          .select('user_id, name, email, must_change_password, created_at');
        
        // 2. Fetch total projects (count product analyses)
        const { count: projectCount } = await supabase
          .from('product_analyses')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch recent approval requests for activity feed
        const { data: approvals } = await supabase
          .from('approval_requests')
          .select('*')
          .order('submitted_at', { ascending: false })
          .limit(3);

        const totalU = users?.length ?? 0;
        const pendingU = users?.filter(u => u.must_change_password) ?? [];
        const activeP = projectCount ?? 0;

        setStats({
          totalUsers: totalU,
          pendingApprovals: pendingU.length,
          activeProjects: activeP,
        });

        setPendingUsers(pendingU.slice(0, 3));

        if (approvals) {
          setRecentActivities(approvals.map((a: any) => ({
            text: `${a.engineer_name} submitted plan for ${a.sku}`,
            time: new Date(a.submitted_at).toLocaleDateString(),
            status: a.status
          })));
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Administration`}
        description={`Manage users, roles, and platform health, ${(user?.name || "Admin").split(" ")[0]}.`}
        actions={
          <Button asChild size="sm">
            <Link to="/app/users"><UserPlus className="h-4 w-4" />Review approvals</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={isLoading ? "animate-pulse" : ""}>
          <KpiCard label="Total Users" value={isLoading ? "—" : `${stats.totalUsers}`} icon={Users} hint="Registered accounts" />
        </div>
        <div className={isLoading ? "animate-pulse" : ""}>
          <KpiCard label="Pending Approvals" value={isLoading ? "—" : `${stats.pendingApprovals}`} icon={UserPlus} hint="Awaiting review" />
        </div>
        <div className={isLoading ? "animate-pulse" : ""}>
          <KpiCard label="Active Projects" value={isLoading ? "—" : `${stats.activeProjects}`} icon={FolderKanban} hint="Currently in progress" />
        </div>
        <KpiCard label="Server Status" value="Online" icon={Activity} hint="All models operational" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent activities</CardTitle>
              <CardDescription>What's happening across the platform right now.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/approvals">View audit log <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 animate-spin text-primary" />
                Retrieving recent activities...
              </div>
            ) : recentActivities.length === 0 ? (
              <ul className="divide-y divide-border/70">
                <li className="py-6 text-center text-sm text-muted-foreground">No recent activities yet.</li>
              </ul>
            ) : (
              <ul className="divide-y divide-border/70">
                {recentActivities.map((act, idx) => (
                  <li key={idx} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-foreground">{act.text}</p>
                      <p className="text-xs text-muted-foreground">{act.time}</p>
                    </div>
                    <Badge variant="outline" className={act.status === "Approved" ? "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent" : act.status === "Rejected" ? "bg-destructive/10 text-destructive border-transparent" : "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent"}>
                      {act.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Pending approvals</CardTitle>
            <CardDescription>User accounts waiting on you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 animate-spin text-primary" />
                Retrieving pending users...
              </div>
            ) : pendingUsers.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground text-center py-4">No pending user approvals.</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/app/users">Go to user management</Link>
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((u) => (
                  <div key={u.user_id} className="flex items-center justify-between text-sm border-b border-border/40 pb-2">
                    <div>
                      <p className="font-semibold text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                      <Link to="/app/users">Manage</Link>
                    </Button>
                  </div>
                ))}
                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                  <Link to="/app/users">Go to user management</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}