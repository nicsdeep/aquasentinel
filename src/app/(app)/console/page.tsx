import type { Metadata } from "next";
import { ConsoleScreen } from "@/components/admin/console-screen";

export const metadata: Metadata = { title: "People" };

// Rendered only after the browser session loads (platform admins only), so opt out of instant-navigation checks.
export const instant = false;

export default function ConsolePage() {
  return <ConsoleScreen />;
}
