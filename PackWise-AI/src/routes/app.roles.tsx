import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/app/roles")({
  head: () => ({ meta: [{ title: "Role Assignment — PackWise AI" }] }),
  component: () => (
    <PlaceholderPage
      title="Role Assignment"
      description="Define what each role can see and do across the platform."
      icon={ShieldCheck}
      sections={[
        { title: "Engineer", description: "Run analyses, plan packaging, and export technical reports." },
        { title: "Operations Manager", description: "View KPIs, approve programs, and access executive summaries." },
        { title: "Administrator", description: "Manage accounts, billing, security, and global system settings." },
      ]}
    />
  ),
});
