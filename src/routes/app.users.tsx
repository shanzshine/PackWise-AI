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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { managedUsers, type ManagedUser } from "@/lib/mock-data";
import { toast } from "sonner";
import { createUserApi } from "@/lib/auth";

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
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", role: "Product Manager" });
  const [createdResult, setCreatedResult] = useState<any>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await createUserApi(inviteData.email, inviteData.name, inviteData.role);
      setCreatedResult(res);
      toast.success("User created successfully!");
      // Add to local state
      setUsers((prev) => [{
        id: res.id,
        name: res.name,
        email: res.email,
        company: "PackWise Demo",
        role: res.role.includes("Manager") ? "manager" : res.role === "Packaging Engineer" ? "engineer" : "admin",
        status: "active",
        joinedAt: new Date().toISOString()
      }, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setInviteLoading(false);
    }
  };

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
            
            <Dialog open={isInviteOpen} onOpenChange={(open) => {
              setIsInviteOpen(open);
              if (!open) setCreatedResult(null);
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Invite user</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Create a new account. They will be given a temporary password.
                  </DialogDescription>
                </DialogHeader>
                
                {createdResult ? (
                  <div className="space-y-4 py-4">
                    <div className="rounded-md bg-green-50 p-4 border border-green-200">
                      <p className="text-sm text-green-800 font-medium mb-2">User created successfully!</p>
                      <div className="space-y-1 text-sm">
                        <p><strong>Email:</strong> {createdResult.email}</p>
                        <p><strong>Role:</strong> {createdResult.role}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{createdResult.note}</p>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-4 flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-medium">Temporary Password</p>
                      <code className="text-lg bg-background px-3 py-1 rounded border font-mono select-all">
                        {createdResult.temporary_password}
                      </code>
                      <p className="text-xs text-muted-foreground text-center">
                        Please copy this password. It will not be shown again.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setIsInviteOpen(false)}>Close</Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <form onSubmit={handleInvite}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input required placeholder="John Doe" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input required type="email" placeholder="john@example.com" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={inviteData.role} onValueChange={v => setInviteData({...inviteData, role: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Packaging Engineer">Packaging Engineer</SelectItem>
                            <SelectItem value="Product Manager">Operations Manager</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={inviteLoading}>
                        {inviteLoading ? "Creating..." : "Create Account"}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

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