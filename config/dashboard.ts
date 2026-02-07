import { DashboardConfig, SidebarNavItem } from "@/src/types";
import { Icons } from "@/components/icons";
import { Role } from "@/src/types";

const navItems = {
  overview: {
    title: "Overview",
    href: "/dashboard",
    icon: Icons.dashboard,
  },
  messages: {
    title: "Messages",
    href: "/dashboard/messages",
    icon: Icons.message,
  },
  appointments: {
    title: "Appointments",
    href: "/dashboard/appointments",
    icon: Icons.calendar,
  },
  payments: {
    title: "Payments",
    href: "/dashboard/payments",
    icon: Icons.creditCard,
  },
  progress: {
    title: "Progress",
    href: "/dashboard/progress",
    icon: Icons.heartHandshake,
  },
  profile: {
    title: "Profile",
    href: "/dashboard/profile",
    icon: Icons.profile,
  },
  payouts: {
    title: "Payouts",
    href: "/dashboard/payouts",
    icon: Icons.creditCard,
  },
  patients: {
    title: "Patients",
    href: "/dashboard/patients",
    icon: Icons.users,
  },
} satisfies Record<string, SidebarNavItem>;

// Benefits of this approach:
// - No duplication of item definitions
// - Easy to see exactly which items each role gets
// - Adding a new role = adding one new array
// - Modifying an item updates it for all roles that use it
// - Order of items can be customized per role
///
export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      label: "Overview",
      href: "/dashboard",
    },
  ],
  sidebarNav: {
    [Role.PATIENT]: [
      navItems.overview,
      navItems.messages,
      navItems.appointments,
      navItems.payments,
      navItems.progress,
      navItems.profile,
    ],
    [Role.DOCTOR]: [
      navItems.overview,
      navItems.messages,
      navItems.patients,
      navItems.appointments,
      navItems.payouts,
      navItems.profile,
    ],
    [Role.ADMIN]: [
      navItems.overview,
      navItems.appointments,
      navItems.patients,
      navItems.payouts,
      navItems.profile,
    ],
  },
};
