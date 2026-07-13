import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, DollarSign, ShieldAlert, Leaf, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/app/submit-approval")({
  head: () => ({ meta: [{ title: "Submit Plan — PackWise AI" }] }),
  component: SubmitApprovalPage,
});

function SubmitApprovalPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
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
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/70 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Selected Plan: Glamour Doll – Sparkle Edition</CardTitle>
                <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-[color:var(--primary-soft)] text-primary border-transparent">Ready to Submit</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/40 p-4 border border-border/50">
                  <DollarSign className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Cost</p>
                  <p className="text-xl font-bold mt-1">$0.38 <span className="text-sm font-normal text-muted-foreground">/ unit</span></p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 border border-border/50">
                  <ShieldAlert className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Risk Level</p>
                  <p className="text-xl font-bold text-[color:var(--success)] mt-1">Low <span className="text-sm font-normal text-muted-foreground">(44/100)</span></p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 border border-border/50">
                  <Leaf className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Sustainability</p>
                  <p className="text-xl font-bold text-[color:var(--success)] mt-1">78 <span className="text-sm font-normal text-muted-foreground">/ 100</span></p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Plan Summary</h4>
                <div className="space-y-2">
                  {[
                    "3 active attachment zones (Hair, Waist, Right Wrist)",
                    "Optimal material efficiency (EVA & PET mix)",
                    "87% predicted drop-test pass rate (Grade B+)",
                    "Estimated labor: 2.3 min per unit",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--success)] shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
