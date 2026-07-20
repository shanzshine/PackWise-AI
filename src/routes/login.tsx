import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { loginApi, getUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — PackWise AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      if (u.must_change_password) {
        navigate({ to: "/change-password" });
      } else {
        navigate({ to: "/app/dashboard" });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginApi(email, password);
      
      if (user.must_change_password) {
        toast.info("Password change required", { description: "Please set a new password." });
        navigate({ to: "/change-password" });
        return;
      }
      
      toast.success(`Welcome back, ${(user?.name || "User").split(" ")[0]}`);
      navigate({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Account not found", { description: "Please check your email and password." });
    } finally {
      setLoading(false);
    }
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
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3 text-left shadow-sm">
              <p className="text-sm font-medium text-foreground">Forgot your password?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                For security reasons, users cannot reset their own passwords. Please contact your Administrator at <strong>admin@packwise.ai</strong> to request a temporary password.
              </p>
            </div>
            
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3 text-left shadow-sm">
              <p className="text-sm font-medium text-foreground">First time login?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the temporary password provided by your Administrator. You will be prompted to set your own secure password immediately after signing in.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}