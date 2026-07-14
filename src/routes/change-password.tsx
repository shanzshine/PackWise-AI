import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordApi } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/change-password")({
  head: () => ({ meta: [{ title: "Change Password — PackWise AI" }] }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { description: "Please ensure both passwords are the same." });
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password too short", { description: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    try {
      await changePasswordApi(password);
      toast.success("Password changed successfully", { description: "You can now access your dashboard." });
      navigate({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password", { description: "Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Set New Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              For security reasons, you must change your temporary password before accessing the system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={show ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShow((s) => !s)} 
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground" 
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={show ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set New Password
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full mt-2" 
              onClick={() => {
                import("@/lib/auth").then(({ logout }) => {
                  logout();
                  navigate({ to: "/login" });
                });
              }}
            >
              Sign in with a different account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
