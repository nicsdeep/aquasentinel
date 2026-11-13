import type { Metadata } from "next";
import { SiteOverview } from "@/components/dashboard/site-overview";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <SiteOverview />;
}
