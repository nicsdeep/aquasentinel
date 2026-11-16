import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalHub } from "@/components/legal/legal-hub";

export const metadata: Metadata = {
  title: "Trust & legal",
  description: "What AquaSentinel collects, why, who can see it and the promises we make. English and Kiswahili.",
};

export default function Page() {
  return (
    <Suspense>
      <LegalHub />
    </Suspense>
  );
}
