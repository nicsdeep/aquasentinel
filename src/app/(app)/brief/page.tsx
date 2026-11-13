import type { Metadata } from "next";
import { Brief } from "@/components/brief/brief";

export const metadata: Metadata = { title: "How it meets the brief" };

export default function BriefPage() {
  return <Brief />;
}
