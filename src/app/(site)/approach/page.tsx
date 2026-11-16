import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Block, Facts, NextStep, PageBody, PageHero, StepList } from "@/components/public/page-kit";
import { STEPS } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "Our Approach",
  description: "How AquaSentinel proposes to monitor, detect faults, notify the team, organise repairs and keep maintenance records.",
};

export default function ApproachPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Approach"
        title="One loop, from fault to fix."
        lead="AquaSentinel is designed to strengthen the water system the community already has: watch it, warn the right people and keep the record. It would never control the pump."
      />
      <PageBody>
        <Block title="How it would work">
          <StepList items={STEPS} numbered />
        </Block>
        <Block title="What it would not do">
          <Facts
            items={[
              "It would never switch a pump or any equipment on or off. People on site do all physical work.",
              "It is not an emergency service.",
              "An alert names a suspected cause. A qualified person confirms the real cause on site.",
            ]}
          />
        </Block>
        <Block title="Built for ordinary phones">
          <p>
            Alerts would reach the operator and technician by SMS as well as on the dashboard, so the team can respond without a
            smartphone or internet. Replying 1 acknowledges an alert; closing an incident by SMS needs a confirmation.
          </p>
          <details className="group rounded-2xl border border-[#e3edf2] bg-lp-band px-5 py-1">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium text-lp-ink">
              More detail: how faults are recognised
              <span className="text-lp-cyan transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <div className="pb-4 pt-1">
              <Facts
                items={[
                  "Pump running but no water flowing for a sustained period: a suspected pump or intake fault.",
                  "Flow lower than normal for the site: a suspected leak or blockage.",
                  "Storage below a safe level: low storage.",
                  "Low solar power in daylight: a suspected power fault.",
                  "No readings from the monitoring unit: the unit is offline.",
                ]}
              />
            </div>
          </details>
        </Block>
        <Block title="See it working">
          <p>The software already runs end to end with demonstration accounts. No field sensors are installed yet.</p>
          <Link href="/sign-in" className="inline-flex h-[52px] items-center gap-3 rounded-full bg-lp-blue-deep px-7 text-[17px] font-medium text-white transition hover:brightness-110">
            Explore the prototype <ArrowRight className="size-5" aria-hidden />
          </Link>
        </Block>
      </PageBody>
      <NextStep href="/pilot" label="Pilot in Ngomano" text="What a proposed field pilot would include and how it would be evaluated." />
    </>
  );
}
