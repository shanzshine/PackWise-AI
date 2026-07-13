import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const user = getUser();
    if (user) throw redirect({ to: "/app/dashboard" });
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
