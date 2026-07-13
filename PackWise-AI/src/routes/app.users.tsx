import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { managedUsers, type ManagedUser } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/users")({
  head: () => ({ meta: [{ title: "User Management — PackWise AI" }] }),
  component: UsersPage,
});

const ROLE_OPTIONS: { value: ManagedUser["role"]; label: string }[] = [
  { value: "unassigned", label: "Unassigned" },
  { value: "engineer", label: "Engineer" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

function statusBadge(status: ManagedUser["status"]) {
  if (status === "active") return "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent";
  if (status === "pending") return "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent";
  return "bg-destructive/10 text-destructive border-transparent";
}

function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(managedUsers);
  const [q, setQ] = useState("");

  const filtered = users.filter((u) =>
    [u.name, u.email, u.company].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  const updateRole = (id: string, role: ManagedUser["role"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role updated");
  };

  const approve = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "active", role: u.role === "unassigned" ? "engineer" : u.role } : u)),
    );
    toast.success("User approved");
  };

  const reject = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "rejected" } : u)));
    toast.error("User rejected");
  };

  const pendingCount = users.filter((u) => u.status === "pending").length;
  const activeCount = users.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        description="Approve new sign-ups, assign roles, and manage workspace access."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total users</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending approval</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 p-4">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, company…" className="h-9 pl-8" />
            </div>
            <Button variant="outline" size="sm">Invite user</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-xs font-semibold text-primary">
                        {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadge(u.status) + " capitalize text-[10px]"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v) => updateRole(u.id, v as ManagedUser["role"])}>
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approve(u.id)}
                        disabled={u.status === "active"}
                        className="h-8"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reject(u.id)}
                        disabled={u.status === "rejected"}
                        className="h-8 text-destructive hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No users match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}