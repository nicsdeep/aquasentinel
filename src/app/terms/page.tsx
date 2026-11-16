import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalPage } from "@/components/legal/legal-page";
import { TERMS } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "What AquaSentinel does and does not do, and how team members use it. English and Kiswahili.",
};

export default function TermsPage() {
  return (
    <Suspense>
      <LegalPage docs={TERMS} />
    </Suspense>
  );
}
