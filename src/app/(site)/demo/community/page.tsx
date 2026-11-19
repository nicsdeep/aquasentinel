import type { Metadata } from "next";
import { SimAlerts, SimDiagramCard, SimStats } from "@/components/sim/water-simulation";

export const metadata: Metadata = { title: "Community view (simulation)" };

/** The community's screen: water arriving through the pipeline and the tank level, live from the shared simulation. */
export default function CommunityDemoPage() {
  return (
    <>
      <h1 className="lp-heading text-[clamp(34px,4vw,52px)] leading-[1.02] text-lp-ink">Community view</h1>
      <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-lp-body">
        See water coming from the River Athi through the pipeline into the storage tank, as the technician operates the pump.
      </p>
      <div className="mx-auto mt-6 max-w-5xl space-y-5">
        <SimDiagramCard />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <SimStats compact />
          <SimAlerts />
        </div>
      </div>
    </>
  );
}
