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
      title: "Overview",
      href: "/dashboard",
      icon: Icons.dashboard,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: Icons.message,
    },
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
      icon: Icons.profile,
    },
    {
      title: "Progress",
      href: "/dashboard/progress",
      icon: Icons.heartHandshake,
    },
    {
      title: "Payouts",
      href: "/dashboard/payouts",
      icon: Icons.creditCard,
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: Icons.users,
    },
  ],
};
