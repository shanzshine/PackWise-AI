import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Camera,
  CheckCircle2,
  Database,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/app/analysis-method")({
  head: () => ({ meta: [{ title: "Choose Analysis Method — PackWise AI" }] }),
  component: AnalysisMethodPage,
});

const scanFeatures = [
  "Upload an existing product image or use the camera",
  "Detect pose, keypoints, and current strap locations",
  "Best when a physical sample is available",
];

const predictionFeatures = [
  "No photo or physical sample required",
  "Use historical packaging data to predict attachments",
  "Recommend straps, supports, and packaging material",
];

function MethodCard({
  title,
  description,
  badge,
  icon,
  features,
  action,
  onClick,
  highlighted = false,
}: {
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  features: string[];
  action: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={`group relative overflow-hidden border-border/70 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        highlighted ? "border-primary/40 bg-primary/[0.025]" : ""
      }`}
    >
      {highlighted && <div className="absolute inset-x-0 top-0 h-1 bg-primary" />}
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${highlighted ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
            {icon}
          </div>
          <Badge variant={highlighted ? "default" : "secondary"}>{badge}</Badge>
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="mt-2 min-h-10 leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex h-[250px] flex-col justify-between gap-6">
        <div className="space-y-3 border-t border-border/60 pt-4">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <Button size="lg" variant={highlighted ? "default" : "outline"} className="w-full" onClick={onClick}>
          {action} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

function AnalysisMethodPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="How would you like to analyze this product?"
        description="Choose computer vision for a physical sample, or predict the packaging setup from historical product data."
        actions={<Badge variant="outline"><Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />New product workflow</Badge>}
      />

      <div className="mx-auto max-w-5xl">
        <div className="mb-6 grid grid-cols-3 items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2"><Database className="h-4 w-4 text-primary" /> Product input</div>
          <div className="flex items-center justify-center gap-2"><BrainCircuit className="h-4 w-4 text-primary" /> AI analysis</div>
          <div className="flex items-center justify-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Attachment plan</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MethodCard
            title="Scan Product"
            description="Analyze a product photo with computer vision before generating the attachment plan."
            badge="Image-based"
            icon={<ScanLine className="h-7 w-7" />}
            features={scanFeatures}
            action="Upload or use camera"
            onClick={() => navigate({ to: "/app/product-analysis" })}
          />
          <MethodCard
            title="Historical ML Prediction"
            description="Describe a new product and let the trained model predict the required packaging configuration."
            badge="Recommended for new products"
            icon={<BrainCircuit className="h-7 w-7" />}
            features={predictionFeatures}
            action="Enter product data"
            onClick={() => navigate({ to: "/app/historical-prediction" })}
            highlighted
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Camera className="h-3.5 w-3.5" />
          Both methods continue into the same Attachment Planner, risk, cost, and sustainability workflow.
        </div>
      </div>
    </div>
  );
}
