import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "What personal data AquaSentinel uses, why, who sees it, how long it is kept and your rights. English and Kiswahili.",
};

export default function Page() {
  return (
    <Suspense>
      <LegalDoc slug="privacy" />
    </Suspense>
  );
}
