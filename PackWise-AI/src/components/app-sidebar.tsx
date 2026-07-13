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
import type { AuthUser } from "@/lib/auth";
import { logout } from "@/lib/auth";

type Item = { title: string; url: string; icon: typeof LayoutDashboard };

const NAV: Record<AuthUser["role"], Item[]> = {
  engineer: [
    { title: "Dashboard",           url: "/app/dashboard",         icon: LayoutDashboard },
    { title: "Pose & Doll Analysis",url: "/app/product-analysis",  icon: ScanLine        },
    { title: "Attachment Planner",   url: "/app/packaging-planner", icon: Link2           },
    { title: "Attachment Visualizer",url: "/app/packaging-preview", icon: LayoutTemplate  },
    { title: "Risk Assessment",     url: "/app/risk-assessment",   icon: ShieldAlert     },
    { title: "Cost & Sustainability",url: "/app/cost-analysis",    icon: DollarSign      },
    { title: "Submit Plan",          url: "/app/submit-approval",  icon: Send            },
    { title: "Reports",             url: "/app/reports",           icon: FileBarChart2   },
    { title: "Settings",            url: "/app/settings",          icon: Settings        },
  ],
  manager: [
    { title: "Dashboard",            url: "/app/dashboard",   icon: LayoutDashboard },
    { title: "Pending Approvals",    url: "/app/approvals",   icon: CheckSquare     },
    { title: "Cost & Sustainability",url: "/app/cost-analysis",icon: DollarSign     },
    { title: "Sustainability",       url: "/app/sustainability",icon: Leaf           },
    { title: "Reports",              url: "/app/reports",      icon: FileBarChart2  },
  ],
  admin: [
    { title: "Dashboard",       url: "/app/dashboard",       icon: LayoutDashboard },
    { title: "Pose & Doll Analysis",url: "/app/product-analysis",  icon: ScanLine        },
    { title: "Attachment Planner",   url: "/app/packaging-planner", icon: Link2           },
    { title: "Attachment Visualizer",url: "/app/packaging-preview", icon: LayoutTemplate  },
    { title: "Pending Approvals",    url: "/app/approvals",   icon: CheckSquare     },
    { title: "Risk Assessment",     url: "/app/risk-assessment",   icon: ShieldAlert     },
    { title: "Cost & Sustainability",url: "/app/cost-analysis",    icon: DollarSign      },
    { title: "Reports",             url: "/app/reports",           icon: FileBarChart2   },
    { title: "User Management", url: "/app/users",           icon: Users           },
    { title: "Role Assignment", url: "/app/roles",           icon: ShieldCheck     },
    { title: "System Settings", url: "/app/system-settings", icon: Cog             },
  ],
};

const ROLE_LABEL: Record<AuthUser["role"], string> = {
  engineer: "Packaging Engineer",
  manager:  "Operations Manager",
  admin:    "Administrator",
};

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate  = useNavigate();
  const items     = NAV[user.role];

  const handleLogout = () => { logout(); navigate({ to: "/login" }); };

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
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-sm font-semibold text-primary">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
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