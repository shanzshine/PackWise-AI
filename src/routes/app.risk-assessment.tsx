import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronRight, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { loadAnalysis, DEMO_RESULT } from "@/lib/workflow-store";
import RiskAssessmentContent from "@/components/RiskAssessmentContent";

export const Route = createFileRoute("/app/risk-assessment")({
  head: () => ({ meta: [{ title: "Risk Assessment — PackWise AI" }] }),
  component: RiskAssessmentPage,
});

const WORKFLOW_STEPS = [
  { label: "Product Input", done: true },
  { label: "Analysis Results", done: true },
  { label: "Attachment Planner",    done: true  },
  { label: "Risk Assessment",      active: true },
  { label: "Cost & Sustainability", done: false },
];

function WorkflowBar() {
  return (
    <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
      {WORKFLOW_STEPS.map((s, i, arr) => {
        const isActive = "active" in s && s.active;
        const isDone   = "done" in s && s.done;
        return (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground"}`}>
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`hidden text-[9px] font-medium sm:block ${isActive ? "text-primary" : isDone ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < arr.length - 1 && <div className={`mx-1 h-px flex-1 ${isDone ? "bg-[color:var(--success)]" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function RiskAssessmentPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("Glamour Doll – Sparkle Edition");

  useEffect(() => {
    const a = loadAnalysis() ?? DEMO_RESULT;
    setProductName(a.productName);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Assessment"
        description={`Predictive movement, accessory loss, and drop-test analysis — ${productName}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/app/packaging-planner" })}>
              <ArrowLeft className="h-4 w-4" /> Back to Planner
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/app/cost-analysis" })}>
              <DollarSign className="h-4 w-4" /> Cost & Sustainability <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <WorkflowBar />
      <RiskAssessmentContent />
    </div>
  );
}
