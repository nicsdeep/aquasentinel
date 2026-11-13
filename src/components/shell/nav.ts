import { House, ListChecks, MapPin, TriangleAlert, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  badge?: "alerts";
}

/** Main navigation: only screens that exist (no dead links). Same order on laptop and phone. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", short: "Home", icon: House },
  { href: "/site", label: "Site", short: "Site", icon: MapPin },
  { href: "/incidents", label: "Alerts & incidents", short: "Alerts", icon: TriangleAlert, badge: "alerts" },
  { href: "/tasks", label: "Tasks", short: "Tasks", icon: ListChecks },
];
