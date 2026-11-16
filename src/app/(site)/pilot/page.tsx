import type { Metadata } from "next";
import { Block, Facts, NextStep, PageBody, PageHero, StepList } from "@/components/public/page-kit";
import { PILOT_STEPS } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "Pilot in Ngomano",
  description: "The proposed AquaSentinel field pilot in Ngomano, Makueni County: scope, evaluation and limitations.",
};

export default function PilotPage() {
  return (
    <>
      <PageHero
        eyebrow="Pilot in Ngomano"
        title="What a pilot would look like."
        lead="A proposed pilot under the IFSL water scarcity challenge, to be agreed with the Ngomano community and Makueni County. No results are claimed until they are measured."
      />
      <PageBody>
        <Block title="Proposed activities">
          <StepList items={PILOT_STEPS} />
        </Block>
        <Block title="How it would be evaluated">
          <p>Measures would be compared with a baseline recorded before the pilot starts:</p>
          <Facts
            items={[
              "Time from a fault being detected to someone acknowledging it.",
              "Downtime: how long water service is lost before recovery is confirmed.",
              "The share of incidents completed with a recorded repair.",
              "False alarms, so the rules can be tuned.",
              "Feedback from the operator, technicians and committee.",
            ]}
          />
        </Block>
        <Block title="Limitations, stated plainly">
          <Facts
            items={[
              "No monitoring hardware is installed in Ngomano today; the software runs with demonstration data.",
              "Sensor choice, installation and calibration depend on a site assessment with qualified people.",
              "Kiswahili messages are to be reviewed with the community.",
              "Data responsibilities and consent are to be agreed before anyone's personal data is used.",
            ]}
          />
        </Block>
        <Block title="Budget">
          <p>
            Indicative pilot budget: <b className="font-semibold text-lp-ink">KES 350,000</b>, in line with the grant available
            to the two successful innovations in the challenge.
          </p>
        </Block>
      </PageBody>
      <NextStep href="/about" label="About AquaSentinel" text="Purpose, independence and how the project is developed." />
    </>
  );
}
