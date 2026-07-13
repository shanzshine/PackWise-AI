import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — PackWise AI" }] }),
  component: () => (
    <PlaceholderPage
      title="Settings"
      description="Manage your profile, preferences, and notification rules."
      icon={Settings}
      sections={[
        { title: "Profile", description: "Update personal information, password, and 2FA preferences." },
        { title: "Notifications", description: "Choose what triggers an email, in-app, or Slack alert." },
        { title: "Integrations", description: "Connect ERP, PLM, and shop floor systems to PackWise AI." },
      ]}
    />
  ),
});
