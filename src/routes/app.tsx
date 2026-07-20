import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUser, type AuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    
    if (u.must_change_password) {
      navigate({ to: "/change-password" });
      return;
    }
    
    setUser(u);
  }, [navigate]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`read_notifications_${user.user_id || user.name}`);
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    }
  }, [user]);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      if (user) {
        localStorage.setItem(`read_notifications_${user.user_id || user.name}`, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    async function fetchNotifications() {
      const isManager = ["manager", "admin", "Operations Manager", "Admin"].includes(user?.role || "");
      
      let query = supabase.from('approval_requests').select('*').order('submitted_at', { ascending: false }).limit(5);
      
      if (isManager) {
        query = query.eq('status', 'Pending');
      } else {
        // For PE, show ones that have been Approved/Rejected
        query = query.neq('status', 'Pending');
        if (user?.user_id) {
          query = query.eq('pe_id', user.user_id);
        } else {
          query = query.eq('engineer_name', user?.name);
        }
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setNotifications(data);
      }
    }
    fetchNotifications();
    
    // Set up a simple polling or interval if needed, but for now single fetch is ok
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.req_id)).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex-1" />
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notifications" className="relative cursor-pointer">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications.</div>
                  ) : (
                    notifications.map((n, i) => {
                      const isUnread = !readIds.has(n.req_id);
                      return (
                        <DropdownMenuItem 
                          key={i} 
                          className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${isUnread ? 'bg-primary/5' : 'opacity-70'}`} 
                          onClick={() => {
                            markAsRead(n.req_id);
                            navigate({ to: `/app/approvals/${n.req_id}` });
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                              <span className="font-semibold text-sm truncate">{n.sku}</span>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              n.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              n.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>{n.status}</span>
                          </div>
                          <span className={`text-xs ${isUnread ? 'text-foreground' : 'text-muted-foreground'} line-clamp-2`}>
                            {["manager", "admin", "Operations Manager", "Admin"].includes(user?.role || "")
                              ? `${n.engineer_name} submitted a new packaging plan for approval.`
                              : `Your plan was ${n.status.toLowerCase()} by Operations.`}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.submitted_at).toLocaleString()}</span>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-xs font-semibold text-primary">
                {(user?.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 sm:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}