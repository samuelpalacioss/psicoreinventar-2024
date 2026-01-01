import { DashboardConfig } from "@/types";
import { Icons } from "@/components/icons";

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      label: "Overview",
      href: "/dashboard",
    },
  ],
  sidebarNav: [
    {
      title: "Appointments",
      href: "/dashboard/appointments",
      icon: Icons.calendar,
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: Icons.creditCard,
    },
    {
      title: "Personal details",
      href: "/dashboard/profile",
      icon: Icons.user,
    },
    {
      title: "Progress",
      href: "/dashboard/progress",
      icon: Icons.heartHandshake,
    },
  ],
};
