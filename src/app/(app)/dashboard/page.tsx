import type { Metadata } from "next";
import { WorkspaceWelcome } from "@/components/workspace/welcome";

export const metadata: Metadata = { title: "Home" };

/** Where people land after signing in. Replaced by Operator Home in the next step. */
export default function HomePage() {
  return <WorkspaceWelcome />;
}
