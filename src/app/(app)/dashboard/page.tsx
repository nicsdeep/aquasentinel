import type { Metadata } from "next";
import { OperatorHome } from "@/components/operator-home/operator-home";

export const metadata: Metadata = { title: "Home" };

// Rendered only after the browser session loads (the app shell waits for sign-in), so the framework cannot
// pre-render it for instant-navigation checks. Opt out of that dev-time validation for this segment.
export const instant = false;

/** Where people land after signing in: Operator Home (owner's choice, Option A, 18 Nov 2026). */
export default function HomePage() {
  return <OperatorHome />;
}
