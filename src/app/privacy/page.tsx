import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalPage } from "@/components/legal/legal-page";
import { PRIVACY } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "What personal data AquaSentinel uses, why, who can see it, how long it is kept and your rights. English and Kiswahili.",
};

export default function PrivacyPage() {
  return (
    <Suspense>
      <LegalPage docs={PRIVACY} />
    </Suspense>
  );
}
