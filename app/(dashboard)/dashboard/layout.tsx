import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Role } from "@/src/types";
import "./theme.css";
import { NavDashboard } from "@/components/dashboard/nav-dashboard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: Get user role from session/auth
  const userRole = Role.DOCTOR;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userRole={userRole} />
      <SidebarInset className="m-0! flex flex-col min-h-svh max-h-svh overflow-hidden md:rounded-tl-xl! md:rounded-tr-xl! md:rounded-bl-none! md:rounded-br-none!">
        <NavDashboard />
        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
