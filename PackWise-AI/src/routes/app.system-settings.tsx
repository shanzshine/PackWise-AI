import { createFileRoute } from "@tanstack/react-router";
import { Cog } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/app/system-settings")({
  head: () => ({ meta: [{ title: "System Settings — PackWise AI" }] }),
  component: () => (
    <PlaceholderPage
      title="System Settings"
      description="Configure organization-wide defaults, security, and integrations."
      icon={Cog}
      sections={[
        { title: "Security policies", description: "SSO, session lifetimes, password requirements, and audit logging." },
        { title: "Billing", description: "Manage subscription tier, seat counts, and invoicing details." },
        { title: "Data residency", description: "Choose where your packaging data is stored and processed." },
      ]}
    />
  ),
});
