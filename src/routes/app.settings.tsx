import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Shield, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { getUser, changePasswordApi, type AuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — PackWise AI" }] }),
  component: SettingsPage,
});

const ROLE_LABEL: Record<string, string> = {
  engineer: "Packaging Engineer",
  manager:  "Operations Manager",
  admin:    "Administrator",
  "Packaging Engineer": "Packaging Engineer",
  "Operations Manager": "Operations Manager",
  Admin: "Administrator",
};

function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Separate visibility states for each field
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast.error("User session not found.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { description: "Please ensure both new passwords are the same." });
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password too short", { description: "New password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    try {
      // 1. Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Incorrect current password. Please verify and try again.");
      }

      // 2. Change password to new password
      await changePasswordApi(password);
      toast.success("Password updated successfully");
      
      // Clear form
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
      <PageHeader
        title="Account Settings"
        description="Manage your profile information and security credentials."
      />

      <div className="space-y-8">
        {/* Profile Card (Horizontal layout inside vertical stack) */}
        <Card className="border-border/70 shadow-md bg-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-pink-500 to-primary"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <User className="h-5 w-5 text-primary" /> Profile Info
            </CardTitle>
            <CardDescription>Your account details & permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {/* Top row: Avatar + Name/Email (large and unconstrained horizontally) */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/60">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-2xl font-bold text-primary shadow-sm border border-primary/10">
                {(user?.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="text-center sm:text-left space-y-1.5 min-w-0 flex-1">
                <h3 className="font-bold text-2xl text-foreground break-all tracking-tight leading-tight">
                  {user.name}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-semibold text-primary bg-[color:var(--primary-soft)] px-3 py-1 rounded-full border border-primary/20">
                    {ROLE_LABEL[user.role] || user.role}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bottom row: Fields (2 Columns) */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 text-sm">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </span>
                <span className="text-foreground font-semibold block break-all bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  {user.email}
                </span>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Role Permissions
                </span>
                <span className="text-foreground font-semibold block capitalize bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  {user.role}
                </span>
              </div>

              {user.company && (
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Company
                  </span>
                  <span className="text-foreground font-semibold block bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    {user.company}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border/70 shadow-md bg-card">
          <CardHeader className="border-b border-border/50 pb-6">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <Lock className="h-5 w-5 text-primary" /> Security Settings
            </CardTitle>
            <CardDescription>Update password to secure your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordChange} className="space-y-6">
              
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-semibold flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-muted-foreground" /> Current Password
                </Label>
                <div className="relative">
                  <Input 
                    id="current-password" 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="Enter current password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                    className="pr-10 h-10 border-border/80 focus:border-primary focus:ring-primary/20"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent((s) => !s)} 
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showNew ? "text" : "password"} 
                      placeholder="Min. 6 characters" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="pr-10 h-10 border-border/80 focus:border-primary"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNew((s) => !s)} 
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirm ? "text" : "password"} 
                      placeholder="Repeat new password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="pr-10 h-10 border-border/80 focus:border-primary"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm((s) => !s)} 
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm transition-all duration-200">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
