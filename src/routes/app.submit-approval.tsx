import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { useState } from "react";
import { saveApprovalRequest, loadAnalysis, loadPlan } from "@/lib/workflow-store";
import SubmitPlanContent from "@/components/SubmitPlanContent";

export const Route = createFileRoute("/app/submit-approval")({
  head: () => ({ meta: [{ title: "Submit Plan — PackWise AI" }] }),
  component: SubmitApprovalPage,
});

function SubmitApprovalPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
    
    const analysis = loadAnalysis();
    const plan = loadPlan();
    
    saveApprovalRequest({
      id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
      sku: analysis?.productName || "Custom Plan",
      engineer: "Current User",
      date: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      risk: analysis && analysis.movementRiskScore > 60 ? "High" : analysis && analysis.movementRiskScore > 30 ? "Medium" : "Low",
      cost: plan ? `$${plan.totalCost.toFixed(2)}/unit` : "$0.00/unit",
      status: "Pending"
    });

    toast.success("Attachment plan successfully submitted to Operations Manager.");
    setTimeout(() => {
      navigate({ to: "/app/dashboard" });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Plan for Approval"
        description="Review the finalized attachment plan, including cost and risk metrics, before submitting to the Operations Manager."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SubmitPlanContent />

        <div className="space-y-6">
          <Card className="border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Submit to Manager</CardTitle>
              <CardDescription>This will notify the Operations Manager to review your plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full h-12 text-base font-semibold bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white" 
                onClick={handleSubmit}
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <>Submitted Successfully <CheckCircle2 className="ml-2 h-5 w-5" /></>
                ) : (
                  <>Submit Plan <Send className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </CardContent>
          </Card>
          
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
                  <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
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
        </div>
      </div>
    </div>
  );
}
