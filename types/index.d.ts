import { Icons } from '@/components/icons';
import type { Icon } from '@/components/icons';

export type MainNavSubItem = {
  href: string;
  label: string;
  description?: string;
};

export type MainNavItem = {
  label: string;
  href?: string;
  submenu?: boolean;
  type?: "description" | "simple";
  items?: MainNavSubItem[];
};

export type FeatureItem = {
  name: string;
  description: string;
  icon: keyof typeof Icons;
};

export type StatItem = {
  description: string;
  value: string;
};

export type TestimonialItem = {
  author: {
    name: string;
    imageUrl: string;
  };
  rating: number;
  body: string;
};

export type MarketingConfig = {
  mainNav: MainNavItem[];
  steps: StepItem[];
  stats: StatItem[];
  testimonials: TestimonialItem[];
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
