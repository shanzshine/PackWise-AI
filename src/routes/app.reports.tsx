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
  Sparkles,
  ArrowLeft,
  ChevronRight,
  BarChart3,
  FileDown,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { loadApprovalRequests, type ApprovalRequest } from "@/lib/workflow-store";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — PackWise AI" }] }),
  component: ReportsPage,
});

// Build a Report from an ApprovalRequest
interface DerivedReport {
  id: string;
  reqId: string;
  name: string;
  product: string;
  engineer: string;
  date: string;
  status: "Approved" | "Rejected";
  decidedAt?: string;
  risk: string;
  cost: string;
  laborTime?: string;
  sustainability?: number;
  snapshot?: ApprovalRequest["reportSnapshot"];
}

function toReport(req: ApprovalRequest): DerivedReport {
  return {
    id: `RPT-${req.id}`,
    reqId: req.id,
    name: `${req.sku} — Attachment Plan`,
    product: req.sku,
    engineer: req.engineer,
    date: req.date,
    status: req.status as "Approved" | "Rejected",
    decidedAt: req.decidedAt,
    risk: req.risk,
    cost: req.cost,
    laborTime: req.laborTime,
    sustainability: req.sustainability,
    snapshot: req.reportSnapshot,
  };
}

function ReportDetailModal({ report, onClose }: { report: DerivedReport; onClose: () => void }) {
  const snap = report.snapshot;

  const onExportPdf = () => {
    const zonesHtml = (snap?.zones || []).map((z) => `
      <tr>
        <td>${z.zone}</td>
        <td>${z.recommendedMethod}</td>
        <td>${z.action}</td>
        <td>$${Number(z.cost).toFixed(2)}</td>
        <td>${z.laborMins} min</td>
        <td>${z.sustainability}%</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PackWise AI — ${report.id}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a2e; background:#fff; font-size:11px; }
  .page { max-width:900px; margin:0 auto; padding:32px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #d946ef; padding-bottom:16px; margin-bottom:24px; }
  .header h1 { font-size:20px; font-weight:700; color:#d946ef; }
  .header p { font-size:10px; color:#666; margin-top:4px; }
  .section { margin-bottom:24px; }
  .section-title { font-size:12px; font-weight:700; color:#d946ef; text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid #f3e8ff; padding-bottom:5px; margin-bottom:10px; }
  .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .metric { background:#faf5ff; border:1px solid #e9d5ff; border-radius:8px; padding:8px 10px; }
  .mlabel { font-size:8px; text-transform:uppercase; color:#9333ea; font-weight:600; }
  .mval { font-size:18px; font-weight:700; color:#1a1a2e; margin-top:1px; }
  .kv { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
  .kvi { background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:7px 9px; }
  .kvl { font-size:8px; text-transform:uppercase; color:#9ca3af; font-weight:600; }
  .kvv { font-size:10px; font-weight:600; color:#111827; margin-top:2px; }
  .photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px; }
  .photo-box { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
  .photo-label { font-size:8px; text-transform:uppercase; color:#9ca3af; font-weight:600; padding:6px 8px; border-bottom:1px solid #e5e7eb; background:#f9fafb; }
  .photo-box img { width:100%; height:240px; object-fit:contain; background:#fff; }
  table { width:100%; border-collapse:collapse; font-size:9px; }
  th { background:#faf5ff; color:#7c3aed; font-weight:600; font-size:8px; text-transform:uppercase; padding:6px 8px; text-align:left; border-bottom:1px solid #e9d5ff; }
  td { padding:5px 8px; border-bottom:1px solid #f3f4f6; color:#374151; }
  .badge-approved { display:inline-block; background:#d1fae5; color:#065f46; border-radius:99px; padding:2px 10px; font-weight:700; font-size:10px; }
  .badge-rejected { display:inline-block; background:#fee2e2; color:#991b1b; border-radius:99px; padding:2px 10px; font-weight:700; font-size:10px; }
  .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; font-size:8px; color:#9ca3af; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <h1>📦 PackWise AI — Engineering Report</h1>
      <p>${report.product} &nbsp;·&nbsp; Report ID: ${report.id} &nbsp;·&nbsp; Submitted: ${report.date}</p>
    </div>
    <div style="text-align:right;font-size:9px;color:#888;">
      <span class="${report.status === "Approved" ? "badge-approved" : "badge-rejected"}">${report.status}</span>
      ${report.decidedAt ? `<div style="margin-top:4px;">Decided: ${report.decidedAt}</div>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Summary Metrics</div>
    <div class="metrics">
      <div class="metric"><div class="mlabel">Risk Level</div><div class="mval" style="font-size:14px;">${report.risk}</div></div>
      <div class="metric"><div class="mlabel">Est. Cost</div><div class="mval" style="font-size:14px;">${report.cost}</div></div>
      ${report.laborTime ? `<div class="metric"><div class="mlabel">Labor Time</div><div class="mval" style="font-size:14px;">${report.laborTime}</div></div>` : ""}
      ${report.sustainability ? `<div class="metric"><div class="mlabel">Sustainability</div><div class="mval" style="font-size:14px;">${report.sustainability}%</div></div>` : ""}
      ${snap ? `
      <div class="metric"><div class="mlabel">Drop Survival</div><div class="mval">${snap.dropSurvival}<span style="font-size:9px;">/100</span></div></div>
      <div class="metric"><div class="mlabel">Movement Risk</div><div class="mval">${snap.movementRisk}</div></div>
      <div class="metric"><div class="mlabel">Accessory Loss</div><div class="mval">${snap.accessoryLoss}<span style="font-size:9px;">%</span></div></div>
      <div class="metric"><div class="mlabel">Overall Risk</div><div class="mval" style="font-size:13px;">${snap.overallRisk}</div></div>
      ` : ""}
    </div>
  </div>

  ${(snap?.imageDataUrl || snap?.annotatedImageDataUrl) ? `
  <div class="section">
    <div class="section-title">Product Detection Image</div>
    <div class="photo-grid">
      ${snap?.imageDataUrl ? `<div class="photo-box"><div class="photo-label">Original Captured</div><img src="${snap.imageDataUrl}" alt="original" /></div>` : ""}
      ${snap?.annotatedImageDataUrl ? `<div class="photo-box"><div class="photo-label">Annotated — Skeleton & Zones</div><img src="${snap.annotatedImageDataUrl}" alt="annotated" /></div>` : ""}
    </div>
    <div class="kv" style="margin-top:6px;">
      ${snap?.accessories?.length ? `<div class="kvi"><div class="kvl">Accessories</div><div class="kvv">${snap.accessories.join(", ")}</div></div>` : ""}
      ${snap?.detectedPoses?.length ? `<div class="kvi"><div class="kvl">Detected Pose</div><div class="kvv">${snap.detectedPoses.join(", ")}</div></div>` : ""}
    </div>
  </div>` : ""}

  ${snap?.zones?.length ? `
  <div class="section">
    <div class="section-title">Attachment Zones Plan</div>
    <table>
      <thead><tr><th>Zone</th><th>Recommended Method</th><th>Action</th><th>Cost</th><th>Labor</th><th>Sustainability</th></tr></thead>
      <tbody>${zonesHtml}</tbody>
    </table>
  </div>` : ""}

  ${snap?.finalRecommendation ? `
  <div class="section">
    <div class="section-title">Final Recommendation</div>
    <div class="kv">
      <div class="kvi"><div class="kvl">Packaging</div><div class="kvv">${snap.finalRecommendation.packaging}</div></div>
      <div class="kvi"><div class="kvl">Cushion</div><div class="kvv">${snap.finalRecommendation.cushion}</div></div>
      <div class="kvi"><div class="kvl">Attachment</div><div class="kvv">${snap.finalRecommendation.attachment}</div></div>
      <div class="kvi"><div class="kvl">Support</div><div class="kvv">${snap.finalRecommendation.support}</div></div>
      <div class="kvi"><div class="kvl">ISTA</div><div class="kvv">${snap.finalRecommendation.ista}</div></div>
    </div>
  </div>` : ""}

  <div class="footer">
    <div>PackWise AI · Report ID: ${report.id}</div>
    <div>Engineer: ${report.engineer} · Submitted: ${report.date}</div>
  </div>
</div>
</body>
</html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-border/70 text-xs font-mono">{report.id}</Badge>
            <Badge
              variant="outline"
              className={`text-xs font-semibold border-transparent ${
                report.status === "Approved"
                  ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {report.status === "Approved" ? <CheckCircle2 className="mr-1 h-3 w-3 inline" /> : <XCircle className="mr-1 h-3 w-3 inline" />}
              {report.status}
            </Badge>
          </div>
          <DialogTitle className="text-left text-base leading-snug">{report.name}</DialogTitle>
          <DialogDescription className="text-left text-xs text-muted-foreground">
            {report.engineer} · {report.date}
            {report.decidedAt && ` · Decided: ${report.decidedAt}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Risk Level", value: report.risk },
              { label: "Est. Cost", value: report.cost },
              report.laborTime ? { label: "Labor Time", value: report.laborTime } : null,
              report.sustainability ? { label: "Sustainability", value: `${report.sustainability}%` } : null,
              snap ? { label: "Drop Survival", value: `${snap.dropSurvival}/100` } : null,
              snap ? { label: "Movement Risk", value: String(snap.movementRisk) } : null,
            ].filter(Boolean).map((item) => (
              <div key={item!.label} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-wide">{item!.label}</p>
                <p className="text-base font-bold text-foreground mt-0.5">{item!.value}</p>
              </div>
            ))}
          </div>

          {/* Photos */}
          {(snap?.imageDataUrl || snap?.annotatedImageDataUrl) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product Images</p>
              <div className="grid grid-cols-2 gap-2">
                {snap.imageDataUrl && (
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20">
                    <p className="text-[9px] uppercase font-semibold text-muted-foreground px-2 py-1 border-b border-border/40">Original</p>
                    <img src={snap.imageDataUrl} alt="product" className="w-full h-36 object-contain bg-white" />
                  </div>
                )}
                {snap.annotatedImageDataUrl && (
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20">
                    <p className="text-[9px] uppercase font-semibold text-muted-foreground px-2 py-1 border-b border-border/40">Annotated</p>
                    <img src={snap.annotatedImageDataUrl} alt="annotated" className="w-full h-36 object-contain bg-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zones */}
          {snap?.zones && snap.zones.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachment Zones</p>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Zone</th>
                      <th className="px-3 py-2 text-left font-medium">Method</th>
                      <th className="px-3 py-2 text-left font-medium">Cost</th>
                      <th className="px-3 py-2 text-left font-medium">Labor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.zones.map((z, i) => (
                      <tr key={i} className="border-t border-border/40">
                        <td className="px-3 py-2 font-medium">{z.zone}</td>
                        <td className="px-3 py-2 text-muted-foreground">{z.recommendedMethod}</td>
                        <td className="px-3 py-2">${Number(z.cost).toFixed(2)}</td>
                        <td className="px-3 py-2">{z.laborMins} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final recommendation */}
          {snap?.finalRecommendation && (
            <div className="rounded-lg border border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 p-3 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final Recommendation</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Packaging:</span> {snap.finalRecommendation.packaging}</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Cushion:</span> {snap.finalRecommendation.cushion}</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Attachment:</span> {snap.finalRecommendation.attachment}</p>
              <p className="text-sm text-foreground"><span className="text-muted-foreground">ISTA:</span> {snap.finalRecommendation.ista}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1" onClick={onExportPdf}>
              <FileDown className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState<DerivedReport[]>([]);
  const [selected, setSelected] = useState<DerivedReport | null>(null);
  const [tab, setTab] = useState<"approved" | "rejected">("approved");

  useEffect(() => {
    const reqs = loadApprovalRequests().filter(
      (r) => r.status === "Approved" || r.status === "Rejected"
    );
    setReports(reqs.map(toReport));
  }, []);

  const approved = reports.filter((r) => r.status === "Approved");
  const rejected = reports.filter((r) => r.status === "Rejected");
  const displayed = tab === "approved" ? approved : rejected;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Accepted and rejected attachment plan reports from the approval workflow."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/70 font-normal text-[color:var(--success)]">
              <CheckCircle2 className="mr-1 h-3 w-3" /> {approved.length} approved
            </Badge>
            <Badge variant="outline" className="border-border/70 font-normal text-destructive">
              <XCircle className="mr-1 h-3 w-3" /> {rejected.length} rejected
            </Badge>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Reports", value: reports.length.toString(), icon: FileText, hint: "Decided by manager" },
          { label: "Approved", value: approved.length.toString(), icon: CheckCircle2, hint: "Ready for production" },
          { label: "Rejected", value: rejected.length.toString(), icon: XCircle, hint: "Returned to engineer" },
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/70">
        {(["approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "approved"
              ? <><CheckCircle2 className="h-3.5 w-3.5" /> Approved Reports</>
              : <><XCircle className="h-3.5 w-3.5" /> Rejected Plans</>}
          </button>
        ))}
      </div>

      {/* Report list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-foreground">
            No {tab} reports yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "approved"
              ? "Once the Operations Manager approves a plan, the report will appear here."
              : "Rejected plans will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="group flex items-start gap-3 rounded-xl border border-border/60 p-4 text-left transition hover:border-primary/40 hover:bg-[color:var(--primary-soft)]/20"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${r.status === "Approved" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : "bg-destructive/10 text-destructive"}`}>
                {r.status === "Approved" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{r.product}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.date}</p>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.risk === "Low" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : r.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}`}>
                    {r.risk} Risk
                  </span>
                  <span className="text-[10px] text-muted-foreground">{r.cost}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100">
                  View report <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <ReportDetailModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
