import { FcGoogle } from "react-icons/fc";
import { VscStarFull } from "react-icons/vsc";
import {
  Aperture,
  Brain,
  CalendarDays,
  ChevronLeft,
  ClipboardPenLine,
  CommandIcon,
  CreditCard,
  Heart,
  Loader2,
  LogOut,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  aperture: Aperture,
  booking: ClipboardPenLine,
  calendar: CalendarDays,
  chevronLeft: ChevronLeft,
  command: CommandIcon,
  creditCard: CreditCard,
  google: FcGoogle,
  heart: Heart,
  logout: LogOut,
  mind: Brain,
  payments: CreditCard,
  settings: Settings,
  spinner: Loader2,
  star: VscStarFull,
  user: User,
};
