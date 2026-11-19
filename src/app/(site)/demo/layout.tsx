import { MonitorPlay } from "lucide-react";
import { SimProvider } from "@/components/sim/sim-provider";
import { DemoBar } from "@/components/sim/water-simulation";

/** Shared frame for the simulation pages: one live simulation that stays connected while moving between pages. */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <SimProvider>
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-lp-pill px-3 py-1.5 text-xs font-semibold text-lp-blue-deep" data-testid="sim-label">
          <MonitorPlay className="size-4" aria-hidden /> Interactive Simulation — No Physical Equipment Connected.
        </p>
        <div className="mt-4">
          <DemoBar />
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </SimProvider>
  );
}
