import type { Metadata } from "next";
import { NextStep, PageBody, PageHero } from "@/components/public/page-kit";
import { PptEmbed } from "@/components/public/ppt-embed";

export const metadata: Metadata = {
  title: "Demo PPT",
  description: "The AquaSentinel demo presentation.",
};

export default function DemoPptPage() {
  return (
    <>
      <PageHero eyebrow="Demo PPT" title="The demo presentation." lead="The AquaSentinel demo presentation. Use the arrows in the viewer to move through the slides." />
      <PageBody>
        <div className="pb-10 md:pb-14">
          <PptEmbed />
        </div>
      </PageBody>
      <NextStep href="/" label="Back to home" text="Return to the AquaSentinel homepage." />
    </>
  );
}
