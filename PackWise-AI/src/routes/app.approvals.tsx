import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/app/approvals")({
  head: () => ({ meta: [{ title: "Approvals — PackWise AI" }] }),
  component: ApprovalsPage,
});

const APPROVALS_DATA = [
  { id: "REQ-092", sku: "Glamour Doll – Sparkle Edition", engineer: "Eng. Alice", date: "Today, 10:45 AM", risk: "Low", cost: "$0.38/unit", status: "Pending" },
  { id: "REQ-091", sku: "Action Hero Series 7", engineer: "Eng. Bob", date: "Yesterday, 3:15 PM", risk: "Medium", cost: "$0.45/unit", status: "Pending" },
  { id: "REQ-090", sku: "Fashion Doll Wardrobe Box", engineer: "Eng. Alice", date: "Mon, 09:20 AM", risk: "Low", cost: "$0.42/unit", status: "Approved" },
  { id: "REQ-089", sku: "Princess Castle Playset", engineer: "Eng. Charlie", date: "Last Fri, 11:10 AM", risk: "High", cost: "$0.55/unit", status: "Rejected" },
];

function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attachment Approvals"
        description="Review, approve, or reject pending attachment plans submitted by the engineering team."
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search requests by SKU or ID..." className="pl-9 bg-background" />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
      </div>

      <div className="grid gap-4">
        {APPROVALS_DATA.map((req) => (
          <Card key={req.id} className="border-border/70 shadow-none hover:border-primary/30 transition-colors">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${req.status === 'Pending' ? 'bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]' : req.status === 'Approved' ? 'bg-[color:var(--success)]/15 text-[color:var(--success)]' : 'bg-destructive/15 text-destructive'}`}>
                  {req.status === 'Pending' ? <Clock className="h-5 w-5" /> : req.status === 'Approved' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{req.sku}</p>
                    <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">{req.id}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Requested by {req.engineer} • {req.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">Est. Cost</p>
                  <p className="text-sm font-medium">{req.cost}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-medium uppercase text-muted-foreground">Risk Level</p>
                  <p className={`text-sm font-medium ${req.risk === "Low" ? "text-[color:var(--success)]" : req.risk === "Medium" ? "text-[color:var(--warning-foreground)]" : "text-destructive"}`}>{req.risk}</p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {req.status === "Pending" ? (
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link to={`/app/approvals/${req.id}`}>View Details</Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="w-full sm:w-auto justify-center bg-muted text-muted-foreground">
                      {req.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
