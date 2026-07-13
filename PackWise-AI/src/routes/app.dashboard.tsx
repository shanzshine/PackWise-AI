import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUser, type AuthUser } from "@/lib/auth";
import { EngineerDashboard } from "@/components/dashboards/engineer-dashboard";
import { ManagerDashboard } from "@/components/dashboards/manager-dashboard";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PackWise AI" }] }),
  component: DashboardRouter,
});

function DashboardRouter() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => setUser(getUser()), []);
  if (!user) return null;
  if (user.role === "engineer") return <EngineerDashboard user={user} />;
  if (user.role === "manager") return <ManagerDashboard user={user} />;
  return <AdminDashboard user={user} />;
}