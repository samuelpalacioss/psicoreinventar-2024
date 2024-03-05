import { DashboardConfig } from '@/types';

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: 'command',
    },
    {
      title: 'Appointments',
      href: '/dashboard/appointments',
      icon: 'calendar',
    },
    {
      title: 'Payments',
      href: '/dashboard/payments',
      icon: 'creditCard',
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings',
    },
  ],
};
