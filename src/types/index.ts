import { Icons } from "@/components/icons";
import type { Icon } from "@/components/icons";

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

export type StepItem = {
  title: string;
  description: string;
  cta?: string;
};

export type TestimonialItem = {
  author: {
    name: string;
    imageUrl: string;
  };
  rating: number;
  body: string;
};

export type TherapistBenefitItem = {
  title: string;
  description: string;
  icon: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type MarketingConfig = {
  mainNav: MainNavItem[];
  steps: StepItem[];
  stats: StatItem[];
  testimonials: TestimonialItem[];
  therapistSteps: StepItem[];
  therapistStats: StatItem[];
  therapistBenefits: TherapistBenefitItem[];
  therapistFAQ: FAQItem[];
  homepageFAQ: FAQItem[];
};

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href: string;
  icon?: Icon;
};

export type DashboardConfig = {
  mainNav: MainNavItem[];
  sidebarNav: Record<Role, SidebarNavItem[]>;
};

export type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export const Role = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
