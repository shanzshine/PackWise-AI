import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, Search, FileText, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { useState, useEffect } from "react";
import { loadApprovalRequests, type ApprovalRequest } from "@/lib/workflow-store";

export const Route = createFileRoute("/app/approvals/")({
  head: () => ({ meta: [{ title: "Approvals — PackWise AI" }] }),
  component: ApprovalsPage,
});

function StatusIcon({ status }: { status: ApprovalRequest["status"] }) {
  if (status === "Approved") return <CheckCircle2 className="h-5 w-5" />;
  if (status === "Rejected") return <XCircle className="h-5 w-5" />;
  return <Clock className="h-5 w-5" />;
}

function statusColor(status: ApprovalRequest["status"]) {
  if (status === "Approved") return "bg-[color:var(--success)]/15 text-[color:var(--success)]";
  if (status === "Rejected") return "bg-destructive/15 text-destructive";
  return "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]";
}

function EmptyState({ tab }: { tab: "pending" | "accepted" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 py-16 text-center">
      {tab === "pending" ? (
        <>
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-foreground">No pending approvals</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When a Packaging Engineer submits a plan, it will appear here.
          </p>
        </>
      ) : (
        <>
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-foreground">No accepted reports yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approved plans will appear here as completed reports.
          </p>
        </>
      )}
    </div>
  );
}

function ApprovalCard({ req }: { req: ApprovalRequest }) {
  return (
    <Card className="border-border/70 shadow-none hover:border-primary/30 transition-colors">
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusColor(req.status)}`}>
            <StatusIcon status={req.status} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-foreground">{req.sku}</p>
              <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">{req.id}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted by <span className="font-medium text-foreground">{req.engineer}</span> · {req.date}
            </p>
            {req.decidedAt && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {req.status === "Approved" ? "Approved" : "Rejected"} at {req.decidedAt}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-8">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-medium uppercase text-muted-foreground">Est. Cost</p>
            <p className="text-sm font-semibold">{req.cost}</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-medium uppercase text-muted-foreground">Risk Level</p>
            <p className={`text-sm font-semibold ${req.risk === "Low" ? "text-[color:var(--success)]" : req.risk === "Medium" ? "text-amber-600" : "text-destructive"}`}>
              {req.risk}
            </p>
          </div>
          {req.laborTime && (
            <div className="hidden lg:block text-right">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Labor</p>
              <p className="text-sm font-semibold">{req.laborTime}</p>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {req.status === "Pending" ? (
              <Button size="sm" className="w-full sm:w-auto" asChild>
                <Link to="/app/approvals/$id" params={{ id: req.id }}>View & Decide</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/app/approvals/$id" params={{ id: req.id }}>View Report</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalsPage() {
  const [all, setAll] = useState<ApprovalRequest[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pending" | "accepted">("pending");

  useEffect(() => {
    setAll(loadApprovalRequests());
    // Poll every 2s so if engineer submits in another tab it updates
    const interval = setInterval(() => setAll(loadApprovalRequests()), 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = all.filter((r) => {
    const q = search.toLowerCase();
    return r.sku.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.engineer.toLowerCase().includes(q);
  });

  const pending = filtered.filter((r) => r.status === "Pending");
  const accepted = filtered.filter((r) => r.status === "Approved" || r.status === "Rejected");

  const pendingCount = all.filter((r) => r.status === "Pending").length;
  const acceptedCount = all.filter((r) => r.status === "Approved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attachment Approvals"
        description="Review, approve, or reject pending attachment plans submitted by the engineering team."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/70 font-normal">
              <Clock className="mr-1 h-3 w-3" /> {pendingCount} pending
            </Badge>
            <Badge variant="outline" className="border-border/70 font-normal text-[color:var(--success)]">
              <CheckCircle2 className="mr-1 h-3 w-3" /> {acceptedCount} approved
            </Badge>
          </div>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name, ID, or engineer…"
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/70 pb-0">
        {(["pending", "accepted"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "pending" ? (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Pending Approval
                {pending.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1">
                    {pending.length}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Accepted Reports
                {accepted.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold px-1">
                    {accepted.length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-4">
        {tab === "pending" ? (
          pending.length === 0 ? (
            <EmptyState tab="pending" />
          ) : (
            pending.map((req) => <ApprovalCard key={req.id} req={req} />)
          )
        ) : (
          accepted.length === 0 ? (
            <EmptyState tab="accepted" />
          ) : (
            <>
              {accepted.filter((r) => r.status === "Approved").length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--success)] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                  </p>
                  {accepted.filter((r) => r.status === "Approved").map((req) => (
                    <ApprovalCard key={req.id} req={req} />
                  ))}
                </div>
              )}
              {accepted.filter((r) => r.status === "Rejected").length > 0 && (
                <div className="space-y-3 mt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> Rejected
                  </p>
                  {accepted.filter((r) => r.status === "Rejected").map((req) => (
                    <ApprovalCard key={req.id} req={req} />
                  ))}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
