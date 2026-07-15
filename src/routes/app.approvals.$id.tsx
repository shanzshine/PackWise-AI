import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, CheckCircle2, XCircle, DollarSign, Leaf, Clock, Zap, Info, ShieldAlert, ImageIcon
} from "lucide-react";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, loadApprovalRequests, updateApprovalStatus, type AnalysisResult } from "@/lib/workflow-store";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/app/approvals/$id")({
  head: () => ({ meta: [{ title: "Approval Details — PackWise AI" }] }),
  component: ApprovalDetailsPage,
});

const RISK_BADGE: Record<string, string> = {
  low:    "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
  medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
  high:   "bg-destructive/10 text-destructive border-transparent",
};
const RISK_FILL: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#ef4444",
};
const RISK_STROKE: Record<string, string> = {
  low: "#16a34a", medium: "#d97706", high: "#dc2626",
};

const ZONE_POSITIONS: Record<string, { cx: number; cy: number }> = {
  "Hair":        { cx: 100, cy: 10  },
  "Waist":       { cx: 148, cy: 162 },
  "Right Wrist": { cx: 182, cy: 188 },
  "Left Foot":   { cx: 72,  cy: 358 },
};

// Removed ZONE_DETAIL since we now fetch it dynamically from AttachmentZone

function YoloImageOverlay({ imageUrl, detections, threshold }: { imageUrl: string; detections: any[]; threshold: number }) {
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [imgRendered, setImgRendered] = useState({ w: 0, h: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
    setImgRendered({ w: el.clientWidth, h: el.clientHeight });
  };

  const filteredDetections = detections.filter(d => d.confidence >= threshold);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Product Uploaded"
          className="max-h-[300px] max-w-full object-contain rounded drop-shadow-md block"
          onLoad={handleLoad}
        />
        {imgRendered.w > 0 && filteredDetections.map((d, i) => {
          const { xmin, ymin, xmax, ymax } = d.box;
          const scaleX = imgRendered.w / imgNatural.w;
          const scaleY = imgRendered.h / imgNatural.h;
          return (
            <div key={i} className="absolute border-2 border-primary bg-primary/15 pointer-events-none" style={{
              left: `${xmin * scaleX}px`,
              top: `${ymin * scaleY}px`,
              width: `${(xmax - xmin) * scaleX}px`,
              height: `${(ymax - ymin) * scaleY}px`,
            }}>
              <span className="absolute -top-[20px] left-0 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-t font-semibold whitespace-nowrap shadow-sm">
                {d.class_name} {Math.round(d.confidence * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs">
        {filteredDetections.length > 0 ? (
          <span className="bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30 rounded-full px-2 py-0.5 font-semibold">
            ✓ {filteredDetections.length} zone{filteredDetections.length > 1 ? "s" : ""} detected
          </span>
        ) : (
          <span className="bg-muted/50 text-muted-foreground rounded-full px-2 py-0.5">
            No zones detected
          </span>
        )}
      </div>
    </div>
  );
}

function ApprovalDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [approvalReq, setApprovalReq] = useState<any | null>(null);
  const user = getUser();
  const isApprover = user?.role === "manager" || user?.role === "Admin";

  useEffect(() => {
    // Load the specific approval request
    const reqs = loadApprovalRequests();
    const req = reqs.find((r) => r.id === id);
    if (req) setApprovalReq(req);
    // Also load live analysis if available
    const a = loadAnalysis();
    if (a) {
      setAnalysis(a);
      setSelected(a.attachmentZones?.[0]?.zone ?? null);
    } else if (req?.reportSnapshot?.zones?.length) {
      // Fall back to snapshot zones
      setSelected(req.reportSnapshot.zones[0]?.zone ?? null);
    }
  }, [id]);

  // Prefer live analysis zones, fall back to snapshot
  const zones = analysis?.attachmentZones
    ?? (approvalReq?.reportSnapshot?.zones?.map((z: any) => ({
        zone: z.zone,
        bodyRegion: z.zone,
        riskLevel: "medium" as const,
        recommendedMethod: z.recommendedMethod,
        cost: `$${Number(z.cost).toFixed(2)}`,
        labor: `${z.laborMins} min`,
        sustainability: z.sustainability,
      })) ?? []);
  const productName = analysis?.productName ?? approvalReq?.sku ?? "Unknown Product";
  const imageUrl = analysis?.imageDataUrl ?? approvalReq?.reportSnapshot?.imageDataUrl;
  const sel = zones.find((z: any) => z.zone === selected);

  const handleApprove = () => {
    updateApprovalStatus(id, "Approved");
    toast.success(`Request ${id} approved successfully.`);
    navigate({ to: "/app/approvals" });
  };

  const handleReject = () => {
    updateApprovalStatus(id, "Rejected");
    toast.error(`Request ${id} rejected.`);
    navigate({ to: "/app/approvals" });
  };

  const activeZones = zones.filter((z: any) => z.recommendedMethod !== "No Attachment Required" && z.recommendedMethod !== "Not needed");
  const totalLabor = activeZones.reduce((acc: number, z: any) => acc + (parseFloat(z.labor ?? "0") || 0), 0);
  const avgSustain = activeZones.length > 0 ? Math.round(activeZones.reduce((acc: number, z: any) => acc + (z.sustainability ?? 100), 0) / activeZones.length) : 100;
  const poseStab = analysis?.poseStabilityScore ?? 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Approval Request: ${id}`}
        description={`Reviewing attachment plan for ${productName}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/approvals"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Approvals</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Zones Secured",      value: `${activeZones.length} / ${zones.length}`, icon: Zap         },
          { label: "Est. Labor / Unit",  value: `${totalLabor.toFixed(1)} min`,    icon: Clock       },
          { label: "Avg. Pose Stability",value: `${poseStab}%`,        icon: ShieldAlert  },
          { label: "Sustainability Score",value: `${avgSustain}/100`,    icon: Leaf        },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/70 shadow-none">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary-soft)] text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!approvalReq && (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center text-muted-foreground text-sm">
          Approval request not found. It may have been cleared.
        </div>
      )}

      {approvalReq?.status !== "Pending" && approvalReq && (
        <Card className={`shadow-none border ${approvalReq.status === "Approved" ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/5" : "border-destructive/30 bg-destructive/5"}`}>
          <CardContent className="flex items-center gap-3 p-4">
            {approvalReq.status === "Approved"
              ? <CheckCircle2 className="h-5 w-5 text-[color:var(--success)] shrink-0" />
              : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
            <div>
              <p className="text-sm font-semibold">This plan was {approvalReq.status}</p>
              {approvalReq.decidedAt && <p className="text-xs text-muted-foreground">Decided at {approvalReq.decidedAt}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/70 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Product Image & Detections</CardTitle>
            <CardDescription>Visual evidence from CV and AI processing</CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-zinc-950/5 p-4" style={{ minHeight: 380 }}>
            {imageUrl ? (
              <YoloImageOverlay imageUrl={imageUrl} detections={analysis?.cvDetections || []} threshold={0.15} />
            ) : (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 opacity-20" />
                No image data available
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Zone Inspector</CardTitle>
              <CardDescription>Select a zone to view attachment details, risk level, and cost impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/10">
                  <Info className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm font-medium">No Attachment Zones</p>
                  <p className="text-xs text-muted-foreground mt-1">Neither AI nor CV detected any required attachment zones for this product.</p>
                </div>
              ) : (
                zones.map((z: any, i: number) => (
                <button
                  key={z.zone}
                  onClick={() => setSelected(z.zone)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${selected === z.zone ? "border-primary bg-[color:var(--primary-soft)]/40" : "border-border/60 hover:border-primary/30 hover:bg-muted/30"}`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: RISK_FILL[z.riskLevel] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{z.zone}</span>
                      <Badge variant="outline" className={`text-[10px] font-medium capitalize ${RISK_BADGE[z.riskLevel]}`}>{z.riskLevel} risk</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{z.bodyRegion}</span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground">{z.recommendedMethod}</span>
                </button>
              )))}
            </CardContent>
          </Card>

          {sel && (
            <Card className="border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ background: RISK_FILL[sel.riskLevel] }}>
                    {zones.indexOf(sel) + 1}
                  </div>
                  <CardTitle className="text-base">{sel.zone}</CardTitle>
                  <Badge variant="outline" className={`text-[10px] font-medium capitalize ${RISK_BADGE[sel.riskLevel]}`}>{sel.riskLevel} risk</Badge>
                </div>
                <CardDescription>{sel.bodyRegion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="rounded-lg bg-background border border-border/60 p-3 text-center">
                    <DollarSign className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Cost / Unit</p>
                    <p className="text-lg font-bold">{sel.cost ?? "$0.00"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border/60 p-3 text-center">
                    <Clock className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Labor</p>
                    <p className="text-lg font-bold">{sel.labor ?? "0 min"}</p>
                  </div>
                  <div className="rounded-lg bg-background border border-border/60 p-3 text-center">
                    <Leaf className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Sustainability</p>
                    <p className="text-lg font-bold">{sel.sustainability ?? 100}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-background p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Recommended Method</p>
                  <p className="text-sm font-medium text-foreground">{sel.recommendedMethod}</p>
                  <div className="mt-2 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">{sel.impact ?? "Attachment recommended based on stability analysis"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Decision panel — only show if still Pending */}
      {approvalReq?.status === "Pending" && (
        isApprover ? (
          <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/30 shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-base font-semibold">Make a Decision</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Approve this attachment plan to move it to production, or reject it back to the engineer.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={handleReject}>
                  <XCircle className="mr-2 h-4 w-4" /> Reject Plan
                </Button>
                <Button className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90" onClick={handleApprove}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 bg-muted/20 shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-base font-semibold">Status: Under Review</p>
                <p className="mt-0.5 text-sm text-muted-foreground">This attachment plan is currently waiting for Operations Manager approval.</p>
              </div>
              <Badge variant="outline" className="border-[color:var(--warning)] text-[color:var(--warning-foreground)] px-3 py-1 text-xs">
                Pending
              </Badge>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
