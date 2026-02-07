"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/dashboard/nav-main";
import { dashboardConfig } from "@/config/dashboard";
import { Role } from "@/src/types";

import Link from "next/link";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: Role;
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  const navItems = dashboardConfig.sidebarNav[userRole];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/dashboard">
                <span className="text-base font-semibold">Psicoreinventar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
