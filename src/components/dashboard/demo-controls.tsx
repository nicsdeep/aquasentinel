"use client";

import { useState } from "react";
import { Gauge, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Demonstration input (water committee only). Sends readings from the virtual unit through the same validation
 * and rules as a field device, so the full loop can be shown live in minutes.
 */
export function DemoControls({ siteId, onDone }: { siteId: string; onDone: () => void }) {
  const { notify } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(scenario: "pump_fault" | "recovery") {
    setBusy(scenario);
    const { data, error } = await getSupabase()!.rpc("demo_simulate", { p_site: siteId, p_scenario: scenario });
    setBusy(null);
    if (error || !data?.ok) {
      notify("error", data?.error === "not_authorised" ? "Only the water committee can use demonstration input." : "Could not send the demonstration input.");
      return;
    }
    onDone();
    notify(
      "success",
      scenario === "pump_fault"
        ? "Pump fault sent: 12 minutes of 'pump on, no flow'. Watch the alert and SMS arrive."
        : "Flow restored. The system will verify recovery from the readings.",
    );
  }

  return (
    <Card>
      <CardHeader title="Demonstration input" description="Plays a fault or a repair through the virtual monitoring unit. Same validation and rules as field sensors." />
      <div className="grid gap-2 p-5">
        <Button variant="secondary" onClick={() => run("pump_fault")} loading={busy === "pump_fault"} disabled={busy !== null}>
          <Gauge className="size-4" aria-hidden />
          Trigger pump fault
        </Button>
        <Button variant="secondary" onClick={() => run("recovery")} loading={busy === "recovery"} disabled={busy !== null}>
          <Waves className="size-4" aria-hidden />
          Restore flow
        </Button>
      </div>
    </Card>
  );
}
