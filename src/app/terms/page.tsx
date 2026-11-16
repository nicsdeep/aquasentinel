import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "What AquaSentinel does and never does, and how teams use it responsibly. English and Kiswahili.",
};

export default function Page() {
  return (
    <Suspense>
      <LegalDoc slug="terms" />
    </Suspense>
  );
}
