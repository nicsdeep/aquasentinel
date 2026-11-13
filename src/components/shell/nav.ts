import { BookOpenCheck, LayoutDashboard, Siren, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Main navigation. Items are added only when their screen exists (no dead links). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidents", icon: Siren },
  { href: "/brief", label: "The brief", icon: BookOpenCheck },
];
