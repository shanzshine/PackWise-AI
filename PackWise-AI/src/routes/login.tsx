import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { login, getUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — PackWise AI" }] }),
  component: LoginPage,
});

const DEMOS = [
  { email: "engineer@packwise.ai", role: "Packaging Engineer" },
  { email: "manager@packwise.ai", role: "Operations Manager" },
  { email: "admin@packwise.ai", role: "Administrator" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getUser()) navigate({ to: "/app/dashboard" });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = login(email);
      setLoading(false);
      if (!user) {
        toast.error("Account not found", { description: "Try one of the demo accounts on the right." });
        return;
      }
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate({ to: "/app/dashboard" });
    }, 450);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <Brand />
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back. Enter your credentials to continue optimizing your packaging.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" onClick={() => toast.info("Please contact the Administrator at admin@packwise.ai to reset your password or request a password change.")} className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me for 30 days</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>


          </div>
        </div>
      </div>

      <aside className="hidden flex-col justify-between bg-[color:var(--primary-soft)] p-12 lg:flex">
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Demo accounts</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Explore each role in seconds</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Use any email below with any password to preview the corresponding dashboard. No registration required.
          </p>

          <div className="mt-6 space-y-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => setEmail(d.email)}
                className="group flex w-full items-center justify-between rounded-lg border border-border/70 bg-card px-4 py-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{d.email}</p>
                  <p className="text-xs text-muted-foreground">{d.role}</p>
                </div>
                <span className="text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">Use →</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">In production</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              “PackWise AI cut our prototype iteration time by 40% and helped us hit our 2026 sustainability targets a full year early.”
            </p>
            <p className="mt-3 text-xs text-muted-foreground">— Director of Packaging, global toy manufacturer</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}