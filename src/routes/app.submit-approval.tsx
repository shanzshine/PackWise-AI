import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { Send, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { saveApprovalRequest, loadAnalysis, loadPlan, clearAllWorkflowData } from "@/lib/workflow-store";
import { getUser } from "@/lib/auth";
import { runAssemblyEngine } from "@/lib/assembly-engine";
import { supabase } from "@/lib/supabase";
import SubmitPlanContent from "@/components/SubmitPlanContent";

export const Route = createFileRoute("/app/submit-approval")({
  head: () => ({ meta: [{ title: "Submit Plan — PackWise AI" }] }),
  beforeLoad: () => {
    const plan = loadPlan();
    if (!plan?.plan_id) {
      throw redirect({ to: "/app/cost-analysis" });
    }
  },
  component: SubmitApprovalPage,
});

function SubmitApprovalPage() {
  const navigate = useNavigate();
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const user = getUser();

  // Guard: redirect to Product Analysis if no analysis has been run yet
  useEffect(() => {
    // Other setup logic if needed
  }, []);

  const hasAnalysis = !!loadAnalysis();
  const handleGenerateReport = () => {
    setReportGenerated(true);
    toast.success("Report generated. Please review before submitting to manager.");
    // Scroll to top of report
    setTimeout(() => {
      document.getElementById("report-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    const analysis = loadAnalysis();
    const plan = loadPlan();

    // Use DFA/MTM assembly engine for accurate labor time (same as Packaging Planner)
    const assemblyResult = runAssemblyEngine({
      weightGrams: analysis?.product_weight_g ?? 120,
      accessories: analysis?.selected_accessories ?? [],
      skeletonKeypoints: analysis?.raw_keypoints ?? [],
      poseComplexityScore: analysis?.poseComplexityScore ?? 0,
    });
    const assemblyTimeSec = assemblyResult.assembly_time_seconds;
    const assemblyTimeMins = (assemblyTimeSec / 60).toFixed(2);
    const avgSustain = plan?.avgSustainability ?? 100;

    // Build report snapshot to embed in approval request
    const imageDataUrl = typeof sessionStorage !== "undefined"
      ? (sessionStorage.getItem("packwise_image") || undefined)
      : undefined;
    const annotatedImageDataUrl = typeof sessionStorage !== "undefined"
      ? (sessionStorage.getItem("packwise_annotated_image") || undefined)
      : undefined;

    const reqId = analysis?.id || `REQ-${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Fallbacks if apiData is missing for some reason
    const finalRiskLevel = apiData?.overall_risk_level || (analysis && analysis.movementRiskScore > 60 ? "High" : analysis && analysis.movementRiskScore > 30 ? "Medium" : "Low");
    const grade = finalRiskLevel === "LOW" ? "A" : finalRiskLevel === "MEDIUM" ? "B" : "C";
    const dropSurvival = apiData?.categories?.["Drop Test Risk"]?.pass_probability || (analysis ? Math.max(0, 100 - analysis.movementRiskScore) : 80);
    const movementRisk = apiData?.categories?.["Movement Risk"]?.risk_percentage || (analysis?.movementRiskScore ?? 0);
    const accessoryLoss = apiData?.categories?.["Accessory Loss Risk"]?.risk_percentage || (analysis?.accessoryLossRisk ?? 0);

    const estCost = plan ? `$${plan.totalCost.toFixed(2)}/unit` : "$0.00/unit";
    const laborTimeStr = `${assemblyTimeSec}s (${assemblyTimeMins} min)`;
    const submittedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const reportSnapshot = {
      grade: grade,
      overallRisk: finalRiskLevel.toUpperCase(),
      dropSurvival: dropSurvival,
      movementRisk: movementRisk,
      accessoryLoss: accessoryLoss,
      zones: (plan?.zones || []).map((z: any) => ({
        zone: z.zone,
        recommendedMethod: z.recommendedMethod,
        action: z.action,
        cost: z.cost || 0,
        laborMins: z.laborMins || 0,
        sustainability: z.sustainability || 100,
      })),
      finalRecommendation: {
        packaging: "—",
        cushion: "—",
        attachment: plan?.recommendedMaterial || "Optimized Strapping",
        support: "—",
        ista: "—",
      },
      imageDataUrl: undefined, // Omit to prevent localStorage quota exceeded and DB payload limits
      annotatedImageDataUrl: undefined, // Omit to prevent localStorage quota exceeded and DB payload limits
      accessories: analysis?.accessories,
      detectedPoses: analysis?.detectedPoses,
      raw_keypoints: analysis?.raw_keypoints || [],
      product_weight_g: analysis?.product_weight_g || 120,
      accessory_count: analysis?.accessory_count || 1,
      hair_length: analysis?.hair_length || "Short",
      selected_accessories: analysis?.selected_accessories || [],
      pose: analysis?.pose || "Arms Open",
      center_of_gravity: analysis?.center_of_gravity,
      height_cm: analysis?.height_cm,
      computedHeight: analysis?.computedHeight,
      computedComplexity: analysis?.computedComplexity,
      computedCOG: analysis?.computedCOG,
      productName: analysis?.productName,
      triggeredRules: apiData?.categories ? Object.values(apiData.categories).flatMap((v: any) => v.matched_rules || []).length : 0,
      criticalFailureCount: finalRiskLevel.toUpperCase() === "HIGH" ? 2 : 0,
    };

    // 1. Save to localStorage (for offline/fast access)
    saveApprovalRequest({
      id: reqId,
      sku: analysis?.productName || "Custom Plan",
      engineer: user?.name || user?.email || "Packaging Engineer",
      date: submittedDate,
      risk: finalRiskLevel,
      cost: estCost,
      laborTime: laborTimeStr,
      sustainability: avgSustain,
      status: "Pending",
      reportSnapshot,
    });

    // 2. Save to Supabase approval_requests table (non-blocking)
    supabase.from('approval_requests').insert([{
      req_id: reqId,
      assessment_id: apiData?.assessment_id || null,
      sku: analysis?.productName || "Custom Plan",
      engineer_name: user?.name || user?.email || "Packaging Engineer",
      pe_id: user?.user_id ?? null,
      risk_level: finalRiskLevel,
      est_cost: estCost,
      labor_time: laborTimeStr,
      sustainability: avgSustain,
      status: "Pending",
      report_snapshot: reportSnapshot,
      submitted_at: new Date().toISOString(),
    }]).then(({ error }) => {
      if (error) console.warn("[PackWise] approval save warning:", error.message);
      else console.log("[PackWise] Approval request saved to Supabase ✓");
    });

    toast.success("Attachment plan successfully submitted to Operations Manager.");
    clearAllWorkflowData();
    setTimeout(() => {
      navigate({ to: "/app/dashboard" });
    }, 2000);
  };

  if (!hasAnalysis) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Plan for Approval"
        description="Generate your engineering report first, then submit it to the Operations Manager for review."
      />

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${reportGenerated ? "bg-[color:var(--success)] text-white" : "bg-primary text-white"}`}>
          {reportGenerated ? <CheckCircle2 className="h-4 w-4" /> : "1"}
        </div>
        <span className={`text-sm font-medium ${reportGenerated ? "text-[color:var(--success)]" : "text-foreground"}`}>
          Generate Report
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isSubmitted ? "bg-[color:var(--success)] text-white" : reportGenerated ? "bg-primary text-white" : "bg-muted text-muted-foreground border border-border"}`}>
          {isSubmitted ? <CheckCircle2 className="h-4 w-4" /> : "2"}
        </div>
        <span className={`text-sm font-medium ${isSubmitted ? "text-[color:var(--success)]" : reportGenerated ? "text-foreground" : "text-muted-foreground"}`}>
          Submit to Manager
        </span>
      </div>

      {/* Step 1: Generate report button (shown before report is generated) */}
      {!reportGenerated && (
        <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/20 shadow-none">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Step 1 — Generate Engineering Report
            </CardTitle>
            <CardDescription>
              Click below to generate the full AI engineering report based on your analysis and packaging plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-12 text-base font-semibold" onClick={handleGenerateReport}>
              <FileText className="mr-2 h-5 w-5" /> Generate Report
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report content (shown after generate) */}
        {reportGenerated && (
          <div id="report-section" className="lg:col-span-2">
            <SubmitPlanContent onDataLoaded={setApiData} />
          </div>
        )}

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Step 2: Submit button */}
          <Card className={`shadow-none ${reportGenerated ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/5" : "border-border/50 bg-muted/20 opacity-60"}`}>
            <CardHeader>
              <CardTitle className="text-base">
                {reportGenerated ? "Step 2 — Submit to Manager" : "Submit to Manager"}
              </CardTitle>
              <CardDescription>
                {reportGenerated
                  ? "Report is ready. Submit to the Operations Manager for approval."
                  : "Generate the report first before submitting."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full h-12 text-base font-semibold bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white"
                onClick={handleSubmit}
                disabled={!reportGenerated || isSubmitted}
              >
                {isSubmitted ? (
                  <>Submitted Successfully <CheckCircle2 className="ml-2 h-5 w-5" /></>
                ) : (
                  <>Submit Plan <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
              {!reportGenerated && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ⬆ Generate the report first
                </p>
              )}
            </CardContent>
          </Card>

          {/* Approval workflow steps */}
          <Card className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-[color:var(--success)]/20 text-[color:var(--success)] flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="w-px h-8 bg-border my-1" />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium">Plan Finalized</p>
                  <p className="text-xs text-muted-foreground">Cost & risk analysis complete</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${reportGenerated ? "bg-[color:var(--success)]/20 text-[color:var(--success)]" : "bg-muted border border-border"}`}>
                    {reportGenerated ? <CheckCircle2 className="h-3.5 w-3.5" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground" />}
                  </div>
                  <div className="w-px h-8 bg-border my-1" />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium">Report Generated</p>
                  <p className="text-xs text-muted-foreground">Engineering report ready for review</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isSubmitted ? "bg-[color:var(--success)]/20 text-[color:var(--success)]" : reportGenerated ? "bg-primary/20 text-primary" : "bg-muted border border-border"}`}>
                    {isSubmitted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="w-px h-8 bg-border my-1" />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium">Submit to Manager</p>
                  <p className="text-xs text-muted-foreground">Awaiting your submission</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  </div>
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium text-muted-foreground">Manager Review</p>
                  <p className="text-xs text-muted-foreground">Approval required for production</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary badge */}
          {reportGenerated && (
            <Card className="border-border/70 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[color:var(--success)] shrink-0" />
                <div>
                  <p className="text-sm font-medium">Report Ready</p>
                  <p className="text-xs text-muted-foreground">Review the report on the left, then submit.</p>
                </div>
                <Badge className="ml-auto bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent">
                  Ready
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
