"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/dashboard/nav-main";
import { dashboardConfig } from "@/config/dashboard";
import { Role } from "@/src/types";

import { Button } from "../ui/button";
import { Icons } from "../icons";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: Role;
}

// TODO: Add dynamic role based on user logged in
export function AppSidebar({ userRole = Role.PATIENT, ...props }: AppSidebarProps) {
  const navItems = dashboardConfig.sidebarNav[userRole];
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas" {...props} className="pt-5">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold p-2">Psicoreinventar</span>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setOpenMobile(false)}
            >
              <Icons.close className="size-5 text-gray-800" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
