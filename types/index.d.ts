import { Icons } from '@/components/icons';
import type { Icon } from '@/components/icons';

export type MainNavItem = {
  title: string;
  href: string;
};

export type MarketingConfig = {
  mainNav: mainNavItem[];
};

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href: string;
  icon?: keyof typeof Icons;
};

export type DashboardConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};
