import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Security",
  description: "How AquaSentinel protects community data, and what is completed before a field pilot. English and Kiswahili.",
};

export default function Page() {
  return (
    <Suspense>
      <LegalDoc slug="security" />
    </Suspense>
  );
}
