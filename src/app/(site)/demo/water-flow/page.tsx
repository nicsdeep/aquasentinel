import type { Metadata } from "next";
import { MonitorPlay } from "lucide-react";
import { WaterSimulation } from "@/components/sim/water-simulation";

export const metadata: Metadata = {
  title: "Live simulation",
  description: "Interactive simulation of water moving from the River Athi through the pump and smart meter into storage.",
};

/** Interactive water-flow simulation for presentations. Frontend only: no equipment, no production data. */
export default function WaterFlowPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <p className="inline-flex items-center gap-2 rounded-full bg-lp-pill px-3 py-1.5 text-xs font-semibold text-lp-blue-deep" data-testid="sim-label">
        <MonitorPlay className="size-4" aria-hidden /> Interactive Simulation — No Physical Equipment Connected.
      </p>
      <h1 className="lp-heading mt-4 text-[clamp(34px,4vw,56px)] leading-[1.02] text-lp-ink">Live water-flow simulation</h1>
      <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-lp-body">
        From the River Athi through the pump and smart meter into storage. AquaSentinel monitors and sends requests; the
        local pump controller acts. Nothing here reaches real equipment or production data.
      </p>
      <div className="mt-6">
        <WaterSimulation />
      </div>
    </div>
  );
}
