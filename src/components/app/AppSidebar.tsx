import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Stethoscope, GitCompareArrows, Sparkles, Lightbulb, CreditCard, Settings, Aperture } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

export const NAV = [
  { group: "Analyze", items: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Content", url: "/content", icon: FileText },
    { title: "Diagnosis", url: "/diagnosis", icon: Stethoscope },
    { title: "Compare", url: "/compare", icon: GitCompareArrows },
  ]},
  { group: "Decide", items: [
    { title: "Winning Patterns", url: "/patterns", icon: Sparkles },
    { title: "Recommendations", url: "/recommendations", icon: Lightbulb },
  ]},
  { group: "Account", items: [
    { title: "Billing", url: "/billing", icon: CreditCard },
    { title: "Settings", url: "/settings", icon: Settings },
  ]},
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex h-9 items-center gap-2 px-1 font-display font-semibold">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Aperture className="h-4 w-4" />
          </span>
          <span className="truncate group-data-[collapsible=icon]:hidden">Content<span className="text-primary">Lens</span></span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((g) => (
          <SidebarGroup key={g.group}>
            <SidebarGroupLabel>{g.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={path.startsWith(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-md border border-sidebar-border bg-background p-3 text-xs group-data-[collapsible=icon]:hidden">
          <p className="font-medium">Free plan</p>
          <p className="mt-0.5 text-muted-foreground">1 of 3 AI diagnoses used</p>
          <Link to="/pricing" className="mt-2 inline-block font-medium text-primary hover:underline">Upgrade</Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
