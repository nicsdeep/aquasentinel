import type { Metadata } from "next";
import { SimAlerts, SimControls, SimStats } from "@/components/sim/water-simulation";

export const metadata: Metadata = { title: "Technician view (simulation)" };

/** The technician's screen: pump, mode and fault controls. Changes appear live on every other demo screen. */
export default function TechnicianDemoPage() {
  return (
    <>
      <h1 className="lp-heading text-[clamp(34px,4vw,52px)] leading-[1.02] text-lp-ink">Technician view</h1>
      <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-lp-body">
        Operate the pump and test faults here. The Community view on any other screen shows the water arriving.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <SimControls wide />
        <div className="space-y-3">
          <SimStats compact />
          <SimAlerts />
        </div>
      </div>
    </>
  );
}
