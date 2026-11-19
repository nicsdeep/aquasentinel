import type { Metadata } from "next";
import { WaterSimulation } from "@/components/sim/water-simulation";

export const metadata: Metadata = {
  title: "Live simulation",
  description: "Interactive simulation of water moving from the River Athi through the pump and smart meter into storage.",
};

/** The whole water system on one screen. Frontend only: no equipment, no production data. */
export default function WaterFlowPage() {
  return (
    <>
      <h1 className="lp-heading text-[clamp(34px,4vw,56px)] leading-[1.02] text-lp-ink">Live water-flow simulation</h1>
      <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-lp-body">
        From the River Athi through the pump and smart meter into storage. AquaSentinel monitors and sends requests; the
        local pump controller acts. Open the Technician and Community pages on other screens: they all stay in step.
      </p>
      <div className="mt-6">
        <WaterSimulation />
      </div>
    </>
  );
}
