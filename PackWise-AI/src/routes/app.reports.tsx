import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FileBarChart2,
  Download,
  FileText,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  Leaf,
  X,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  BarChart3,
  FileDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — PackWise AI" }] }),
  component: ReportsPage,
});

type ReportStatus = "completed" | "processing" | "draft";
type ReportType = "analysis" | "attachment-plan" | "risk" | "sustainability" | "cost";

interface Report {
  id: string;
  name: string;
  type: ReportType;
  product: string;
  status: ReportStatus;
  date: string;
  size: string;
  insights: string[];
  summary: string;
}

import { fetchReports } from "@/services/reportService";

const STATIC_REPORTS: Report[] = [
  {
    id: "RPT-2041",
    name: "Glamour Doll – Sparkle Edition — Full Attachment Analysis",
    type: "analysis",
    product: "Glamour Doll – Sparkle Edition",
    status: "completed",
    date: "Aug 21, 2025",
    size: "2.4 MB",
    summary: "Complete AI attachment analysis. Pose complexity score 82/100. 4 attachment zones identified: Hair (medium risk), Waist (low), Right Wrist (high), Left Foot (no attachment required). Movement risk: 44/100. Accessory loss risk: 61/100.",
    insights: [
      "Pose complexity score 82/100 — 4 attachment zones identified",
      "Right Wrist flagged as HIGH risk — EVA strap recommended",
      "5 accessories detected: Handbag, Shoes, Glasses, Crown, Dress Stand",
      "Glasses accessory at 81% predicted loss risk — blister support needed",
      "Drop-test pass rate: 87% (Grade B+) with current attachment plan",
    ],
  },
  {
    id: "RPT-2040",
    name: "Q3 Attachment Cost & Sustainability Review",
    type: "cost",
    product: "Multiple SKUs",
    status: "completed",
    date: "Aug 20, 2025",
    size: "1.8 MB",
    summary: "Quarterly cost analysis across 12 active SKUs. Average attachment cost reduced to $0.38/unit. Carbon footprint from attachment materials: 2.9 kg CO₂/1,000 units — 50% below 2023 baseline.",
    insights: [
      "Total attachment cost per unit: $0.38 (down from $0.71 in Q1)",
      "EVA Straps now dominant material (36% of cost share)",
      "Carbon footprint: 2.9 kg CO₂ per 1,000 units",
      "Sustainability score: 78/100 (+22 pts YoY)",
      "Labor time reduction: 31% vs. prior attachment methods",
    ],
  },
  {
    id: "RPT-2039",
    name: "Action Hero Series 7 — Attachment Plan",
    type: "attachment-plan",
    product: "Action Hero Series 7",
    status: "completed",
    date: "Aug 19, 2025",
    size: "1.2 MB",
    summary: "AI-generated attachment plan for Action Hero Series 7. 3 attachment zones identified. PET support at waist and EVA strap at right shoulder reduce movement risk by 68%. Drop-test prediction: 91% pass rate.",
    insights: [
      "3 attachment zones identified: Shoulder (high), Waist (medium), Feet (low)",
      "Recommended: PET Support at waist + EVA strap at shoulder",
      "Movement risk reduced: 78 → 24 (from high to low)",
      "Drop-test prediction: 91% pass rate (Grade A)",
      "Estimated annual savings: $38,000 at current production volume",
    ],
  },
  {
    id: "RPT-2038",
    name: "August Sustainability Disclosure — Attachment Materials",
    type: "sustainability",
    product: "Full Portfolio",
    status: "completed",
    date: "Aug 18, 2025",
    size: "3.1 MB",
    summary: "GRI-aligned sustainability report for August. Recyclable attachment material usage at 82%, up from 61% in January. CO₂ savings of 2.1 tonnes vs. prior-year attachment materials across the portfolio.",
    insights: [
      "Recyclable attachment materials: 82% (target: 90% by Dec 2025)",
      "Renewable material sources: 64% (target: 75%)",
      "CO₂ savings vs prior year: 2.1 tonnes",
      "Plastic-free attachment zones: 58% (target: 65%)",
      "GRI 301 Material compliance: PASS",
    ],
  },
  {
    id: "RPT-2037",
    name: "Princess Castle Playset — Risk Assessment",
    type: "risk",
    product: "Princess Castle Playset",
    status: "completed",
    date: "Aug 17, 2025",
    size: "2.0 MB",
    summary: "Risk assessment for Princess Castle Playset. High complexity (78/100) due to 12 component types. 6 attachment zones identified. Movement risk: 52/100. Cardboard supports recommended for small parts.",
    insights: [
      "Pose complexity: 78/100 — 6 high-structure attachment zones required",
      "12 component types — 4 flagged for accessory loss risk",
      "Movement risk: 52/100 (Medium) — 2 high-risk zones",
      "Recommended: Cardboard support tray for small parts",
      "Drop-test prediction: 84% pass rate (Grade B+)",
    ],
  },
  {
    id: "RPT-2036",
    name: "Fashion Doll Wardrobe Box — Attachment Plan Draft",
    type: "attachment-plan",
    product: "Fashion Doll Wardrobe Box",
    status: "draft",
    date: "Aug 22, 2025",
    size: "—",
    summary: "Draft attachment plan in progress. Initial scan identifies 5 attachment zones. Right arm and left wrist at elevated pose angle — EVA strap provisionally recommended for both zones.",
    insights: [
      "Draft — not yet finalized",
      "5 attachment zones identified in initial scan",
      "Right Arm and Left Wrist both flagged as medium risk",
    ],
  },
];

const TYPE_ICONS: Record<ReportType, typeof FileText> = {
  analysis: Package,
  "attachment-plan": BarChart3,
  risk: X,
  sustainability: Leaf,
  cost: DollarSign,
};

const TYPE_LABELS: Record<ReportType, string> = {
  analysis: "Pose Analysis",
  "attachment-plan": "Attachment Plan",
  risk: "Risk Assessment",
  sustainability: "Sustainability",
  cost: "Cost Analysis",
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  completed: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  processing: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  draft: "bg-muted text-muted-foreground border-transparent",
};

function ReportDetailModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const Icon = TYPE_ICONS[report.type];
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="border-border/70 text-xs font-normal">
              {report.id}
            </Badge>
            <Badge variant="outline" className={`border-transparent text-xs font-medium ${STATUS_STYLES[report.status]}`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>
          <DialogTitle className="text-left text-base leading-snug">{report.name}</DialogTitle>
          <DialogDescription className="text-left text-xs text-muted-foreground">
            {report.product} · {report.date} · {report.size}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-border/70 shadow-none bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Executive Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{report.summary}</p>
            </CardContent>
          </Card>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Key Insights</p>
            <div className="space-y-2">
              {report.insights.map((insight) => (
                <div key={insight} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--success)]" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                const blob = new Blob(
                  [`PackWise AI Report\n${report.id}\n\n${report.name}\n\nProduct: ${report.product}\nDate: ${report.date}\n\nSummary:\n${report.summary}\n\nKey Insights:\n${report.insights.map((i, n) => `${n + 1}. ${i}`).join("\n")}`],
                  { type: "text/plain" }
                );
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${report.id}.txt`;
                a.click();
              }}
            >
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                const csv = [
                  ["ID", "Name", "Product", "Date", "Insight"],
                  ...report.insights.map((i) => [report.id, report.name, report.product, report.date, i]),
                ]
                  .map((row) => row.map((c) => `"${c}"`).join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${report.id}.csv`;
                a.click();
              }}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReportsPage() {
  const [selected, setSelected] = useState<Report | null>(null);
  const [filter, setFilter] = useState<"all" | ReportType>("all");
  const [reports, setReports] = useState<Report[]>(STATIC_REPORTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const dbReports = await fetchReports();
        // Merge DB reports with static mock reports for demonstration
        setReports([...dbReports, ...STATIC_REPORTS]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.type === filter);
  const completed = reports.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Access, review, and export all PackWise AI packaging analysis reports."
        actions={
          <Badge variant="outline" className="border-border/70 font-normal">
            <FileBarChart2 className="mr-1 h-3 w-3" /> {completed} completed reports
          </Badge>
        }
      />

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Reports", value: reports.length.toString(), icon: FileText, hint: "Available in archive" },
          { label: "Completed", value: completed.toString(), icon: CheckCircle2, hint: "Ready to export" },
          { label: "Analyses Run", value: "24", icon: Package, hint: "Historical total" },
          { label: "System Status", value: "Online", icon: Sparkles, hint: "All services operational" },
        ].map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "analysis", "attachment-plan", "risk", "sustainability", "cost"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter !== f ? "border-border/70" : ""}
          >
            {f === "all" ? "All Reports" : TYPE_LABELS[f as ReportType]}
          </Button>
        ))}
      </div>

      {/* Reports table */}
      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Report History</CardTitle>
            <CardDescription>Click any report to view details, or export directly.</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export All CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const Icon = TYPE_ICONS[r.type];
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground leading-tight">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.product}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border/70 text-xs font-normal">
                        {TYPE_LABELS[r.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                        {r.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {r.status === "processing" && <Clock className="mr-1 h-3 w-3" />}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" />
                        {r.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground tabular-nums">{r.size}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(r)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={r.status !== "completed"}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent generated reports */}
      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Generated Reports</CardTitle>
          <CardDescription>Quickly access the most recently completed reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-sm text-muted-foreground p-4">Loading reports from Supabase...</div>
          ) : (
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {reports.filter((r) => r.status === "completed").slice(0, 3).map((r) => {
                 const Icon = TYPE_ICONS[r.type] || FileText;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 p-4 text-left transition hover:border-primary/40 hover:bg-[color:var(--primary-soft)]/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.date} · {r.size}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100">
                      View report <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>

      {selected && <ReportDetailModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
