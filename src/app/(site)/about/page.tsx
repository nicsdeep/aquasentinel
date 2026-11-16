import type { Metadata } from "next";
import Link from "next/link";
import { Block, Facts, NextStep, PageBody, PageHero } from "@/components/public/page-kit";

export const metadata: Metadata = {
  title: "About",
  description: "AquaSentinel's purpose, independence, responsible development and project background.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built for the water systems communities already have."
        lead="AquaSentinel aims to keep existing community water systems working, by helping local teams notice problems early, respond and keep a record of every repair."
      />
      <PageBody>
        <Block title="Background">
          <p>
            AquaSentinel is an independent project developed for the IFSL Digital Innovation Challenge, led by the Kenya Red Cross
            Society and the International Center for Humanitarian Affairs (ICHA). The challenge focuses on food insecurity and
            water scarcity in Makueni County. No partnership is implied.
          </p>
        </Block>
        <Block title="Responsible development">
          <Facts
            items={[
              "Honest claims: capabilities are described as proposed until they are tested in the field.",
              "Private by design: it watches water systems, not people, and each team sees only its own site.",
              "Human control: people confirm repairs and close incidents. It never controls a pump.",
              "Built for ordinary phones, in English and Kiswahili.",
            ]}
          />
          <p>
            Read how data is handled in our <Link href="/privacy" className="font-medium text-lp-blue underline decoration-lp-cyan underline-offset-4">Privacy Policy</Link> and{" "}
            <Link href="/security" className="font-medium text-lp-blue underline decoration-lp-cyan underline-offset-4">Security</Link> pages.
          </p>
        </Block>
      </PageBody>
      <NextStep href="/contact" label="Contact" text="How to reach the AquaSentinel team." />
    </>
  );
}
