import {
  Aperture,
  CalendarDays,
  ChevronLeft,
  CommandIcon,
  CreditCard,
  Loader2,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

import { FcGoogle } from 'react-icons/fc';
import { VscStarFull } from 'react-icons/vsc';

export const Icons = {
  aperture: Aperture,
  calendar: CalendarDays,
  chevronLeft: ChevronLeft,
  command: CommandIcon,
  creditCard: CreditCard,
  google: FcGoogle,
  payments: CreditCard,
  settings: Settings,
  spinner: Loader2,
  star: VscStarFull,
};
