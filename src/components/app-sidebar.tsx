import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanLine,
  Link2,
  LayoutTemplate,
  ShieldAlert,
  FileBarChart2,
  Settings,
  DollarSign,
  Users,
  ShieldCheck,
  Cog,
  LogOut,
  Leaf,
  CheckSquare,
  Send,
  Calculator,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { AuthUser, Role } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { loadAnalysis, clearAllWorkflowData } from "@/lib/workflow-store";

type Item = { title: string; url: string; icon: typeof LayoutDashboard; requiresAnalysis?: boolean };

const NAV: Record<Role, Item[]> = {
  engineer: [
    { title: "Dashboard",             url: "/app/dashboard",              icon: LayoutDashboard },
    { title: "Product Analysis",      url: "/app/product-analysis",       icon: ScanLine        },
    { title: "Attachment Planner",    url: "/app/packaging-planner",      icon: Link2,          requiresAnalysis: true },
    { title: "Risk Assessment",       url: "/app/risk-assessment",        icon: ShieldAlert,    requiresAnalysis: true },
    { title: "Cost & Sustainability", url: "/app/cost-analysis",          icon: DollarSign,     requiresAnalysis: true },
    { title: "Reports",               url: "/app/reports",                icon: FileBarChart2   },
    { title: "Settings",              url: "/app/settings",               icon: Settings        },
  ],
  manager: [
    { title: "Dashboard",            url: "/app/dashboard",   icon: LayoutDashboard },
    { title: "Pending Report Approvals",    url: "/app/approvals",   icon: CheckSquare     },
    { title: "Reports",              url: "/app/reports",      icon: FileBarChart2  },
    { title: "Settings",             url: "/app/settings",     icon: Settings       },
  ],
  admin: [
    { title: "Dashboard",             url: "/app/dashboard",           icon: LayoutDashboard },
    { title: "Pending Report Approvals",     url: "/app/approvals",           icon: CheckSquare     },
    { title: "Reports",               url: "/app/reports",             icon: FileBarChart2   },
    { title: "User Management",       url: "/app/users",               icon: Users           },
    { title: "Settings",              url: "/app/settings",            icon: Settings        },
  ],
  "Packaging Engineer": [
    { title: "Dashboard",             url: "/app/dashboard",              icon: LayoutDashboard },
    { title: "Product Analysis",      url: "/app/product-analysis",       icon: ScanLine        },
    { title: "Attachment Planner",    url: "/app/packaging-planner",      icon: Link2,          requiresAnalysis: true },
    { title: "Risk Assessment",       url: "/app/risk-assessment",        icon: ShieldAlert,    requiresAnalysis: true },
    { title: "Cost & Sustainability", url: "/app/cost-analysis",          icon: DollarSign,     requiresAnalysis: true },
    { title: "Reports",               url: "/app/reports",                icon: FileBarChart2   },
    { title: "Settings",              url: "/app/settings",               icon: Settings        },
  ],
  "Operations Manager": [
    { title: "Dashboard",            url: "/app/dashboard",   icon: LayoutDashboard },
    { title: "Pending Approvals",    url: "/app/approvals",   icon: CheckSquare     },
    { title: "Reports",              url: "/app/reports",      icon: FileBarChart2  },
    { title: "Settings",             url: "/app/settings",     icon: Settings       },
  ],
  Admin: [
    { title: "Dashboard",             url: "/app/dashboard",           icon: LayoutDashboard },
    { title: "Pending Approvals",     url: "/app/approvals",           icon: CheckSquare     },
    { title: "Reports",               url: "/app/reports",             icon: FileBarChart2   },
    { title: "User Management",       url: "/app/users",               icon: Users           },
    { title: "Settings",              url: "/app/settings",            icon: Settings        },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  engineer: "Packaging Engineer",
  manager:  "Operations Manager",
  admin:    "Administrator",
  "Packaging Engineer": "Packaging Engineer",
  "Operations Manager": "Operations Manager",
  Admin: "Administrator",
};

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate  = useNavigate();
  const items     = NAV[user.role];

  // If user returns to the Dashboard, wipe any residual session to enforce the lock
  if (pathname === "/app/dashboard" && typeof window !== "undefined") {
    clearAllWorkflowData();
  }

  const hasAnalysis = !!loadAnalysis()?.id;

  const handleLogout = async () => { await logout(); navigate({ to: "/login" }); };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Brand />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isDisabled = item.requiresAnalysis && !hasAnalysis;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url} 
                      tooltip={isDisabled ? "Requires Product Analysis" : item.title}
                    >
                      <Link 
                        to={isDisabled ? "#" : item.url} 
                        disabled={isDisabled}
                        className={isDisabled ? "pointer-events-none opacity-50" : ""}
                        onClick={(e) => {
                          if (isDisabled) e.preventDefault();
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Link
          to="/app/settings"
          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-sm font-semibold text-primary">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
          </div>
        </Link>
        <Button
          variant="ghost" size="sm" onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:justify-center"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}