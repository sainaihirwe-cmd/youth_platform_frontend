import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HardHat,
  Headphones,
  HeartPulse,
  Home,
  Hotel,
  Laptop,
  Megaphone,
  Palette,
  Scissors,
  ShoppingBag,
  Sprout,
  Truck,
  Wrench,
  Banknote,
  Factory,
  Utensils,
} from 'lucide-react';

/** Icons administrators can assign to categories (stored by name in the database). */
export const CATEGORY_ICONS = {
  Briefcase,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HardHat,
  Headphones,
  HeartPulse,
  Home,
  Hotel,
  Laptop,
  Megaphone,
  Palette,
  Scissors,
  ShoppingBag,
  Sprout,
  Truck,
  Wrench,
  Banknote,
  Factory,
  Utensils,
};

export default function CategoryIcon({ name, className = 'h-5 w-5' }) {
  const Icon = CATEGORY_ICONS[name] || Briefcase;
  return <Icon className={className} aria-hidden />;
}
