import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Block, Facts, NextStep, PageBody, PageHero } from "@/components/public/page-kit";
import { CHALLENGE_GROUPS, CHALLENGE_SUMMARY, SOURCE_NOTE } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "The Problem",
  description: "Water challenges in Ngomano, Makueni County, as recorded in the IFSL Digital Innovation Challenge information pack.",
};

export default function ChallengePage() {
  return (
    <>
      <PageHero eyebrow="The Problem" title="Water problems in Ngomano" lead={CHALLENGE_SUMMARY}>
        <p className="mt-7 inline-flex items-center gap-3 rounded-full bg-lp-pill px-6 py-3 text-[17px] font-semibold text-lp-ink">
          <MapPin className="size-5 fill-lp-cyan text-lp-cyan [&>circle]:fill-white [&>circle]:stroke-white" aria-hidden />
          Ngomano <span className="h-5 w-px bg-lp-ink/30" aria-hidden /> <span className="font-medium">Makueni County</span>
        </p>
      </PageHero>
      <PageBody>
        {CHALLENGE_GROUPS.map((g) => (
          <Block key={g.title} title={g.title}>
            <Facts items={g.facts} />
          </Block>
        ))}
        <p className="border-t border-[#e3edf2] pt-6 text-[14px] text-lp-body/80">{SOURCE_NOTE}</p>
      </PageBody>
      <NextStep href="/approach" label="Our Approach" text="How AquaSentinel proposes to help keep the system working." />
    </>
  );
}
