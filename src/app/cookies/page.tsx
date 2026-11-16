import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Cookies",
  description: "The only two things AquaSentinel stores in your browser. No analytics or tracking. English and Kiswahili.",
};

export default function Page() {
  return (
    <Suspense>
      <LegalDoc slug="cookies" />
    </Suspense>
  );
}
