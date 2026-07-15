import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/approvals")({
  head: () => ({ meta: [{ title: "Approvals — PackWise AI" }] }),
  component: () => <Outlet />,
});
