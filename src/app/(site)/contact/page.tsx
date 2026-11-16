import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Block, NextStep, PageBody, PageHero } from "@/components/public/page-kit";
import { CONTACT } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to contact the AquaSentinel team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us." lead="Questions about AquaSentinel, the proposed pilot or your data? Write to us and a person will reply, in English or Kiswahili." />
      <PageBody>
        <Block title="Email">
          <a href={`mailto:${CONTACT}`} className="inline-flex min-h-[52px] items-center gap-3 rounded-full bg-lp-blue-deep px-7 text-[17px] font-medium text-white transition hover:brightness-110">
            <Mail className="size-5" aria-hidden /> {CONTACT}
          </a>
        </Block>
        <Block title="Privacy and data requests">
          <p>
            To see, correct or delete your personal data, email us and see the{" "}
            <Link href="/privacy#rights" className="font-medium text-lp-blue underline decoration-lp-cyan underline-offset-4">rights section of our Privacy Policy</Link>.
          </p>
        </Block>
        <Block title="Security concerns">
          <p>
            Found a security problem? Please follow the steps on our{" "}
            <Link href="/security#report" className="font-medium text-lp-blue underline decoration-lp-cyan underline-offset-4">Security page</Link>.
          </p>
        </Block>
      </PageBody>
      <NextStep href="/" label="Back to home" text="Return to the AquaSentinel homepage." />
    </>
  );
}
