import { createFileRoute } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/app/sustainability")({
  head: () => ({ meta: [{ title: "Sustainability — PackWise AI" }] }),
  component: () => (
    <PlaceholderPage
      title="Sustainability"
      description="Track recycled content, CO₂, and progress against corporate targets."
      icon={Leaf}
      sections={[
        { title: "Material composition", description: "See virgin vs. recycled content by product family and region." },
        { title: "Carbon ledger", description: "Cradle-to-shelf CO₂ accounting with year-over-year comparisons." },
        { title: "Compliance hub", description: "Stay ahead of EPR, PPWR, and regional packaging regulations." },
      ]}
    />
  ),
});
