import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
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
        <Suspense
          fallback={
            <header className="flex h-16 shrink-0 items-center border-b bg-background rounded-tl-xl transition-[width,height] ease-linear">
              <div className="flex w-full items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-1 mt-2" />
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </header>
          }
        >
          <NavDashboard />
        </Suspense>
        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
