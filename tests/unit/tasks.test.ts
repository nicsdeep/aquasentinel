import { describe, expect, it } from "vitest";
import { deriveTasks, type TaskInput } from "@/lib/tasks";
import { firstName, greeting, statusSentence } from "@/lib/greeting";
import type { IncidentSummary } from "@/lib/data/types";

const now = Date.parse("2026-11-14T09:00:00Z"); // 12:00 in Nairobi
const incident = (over: Partial<IncidentSummary>): IncidentSummary => ({
  id: "i1", reference: "AS-0001", title: "No water flow while the pump runs", severity: "needs_attention",
  status: "open", detected_at: "2026-11-14T08:50:00Z", evidence: { recommended_action: "Inspect the intake" },
  assigned_to: null, assigned_at: null, diagnosis: null, ...over,
});
const base: TaskInput = {
  role: "operator", userId: "op", timezone: "Africa/Nairobi", status: "needs_attention", active: [],
  members: [{ user_id: "tech", role: "technician", full_name: "Otieno Kamau" }], checks: [], now,
};

describe("deriveTasks", () => {
  it("asks the operator to acknowledge a new fault first, then do the routine check", () => {
    const t = deriveTasks({ ...base, active: [incident({})] });
    expect(t.map((x) => x.id)).toEqual(["ack-i1", "routine"]);
  });

  it("moves the incident through assign → follow up → close", () => {
    expect(deriveTasks({ ...base, active: [incident({ status: "acknowledged" })] })[0].id).toBe("assign-i1");
    const assigned = incident({ status: "assigned", assigned_to: "tech", assigned_at: "2026-11-14T06:00:00Z" });
    expect(deriveTasks({ ...base, active: [assigned] })[0].title).toContain("Follow up with Otieno Kamau");
    expect(deriveTasks({ ...base, active: [incident({ status: "recovered" })] })[0].id).toBe("close-i1");
  });

  it("gives the assigned technician inspect, then verify", () => {
    const mine = incident({ status: "assigned", assigned_to: "tech" });
    expect(deriveTasks({ ...base, role: "technician", userId: "tech", active: [mine] })[0].id).toBe("inspect-i1");
    expect(deriveTasks({ ...base, role: "technician", userId: "tech", active: [{ ...mine, diagnosis: "Blocked screen" }] })[0].id).toBe("verify-i1");
  });

  it("drops the routine check once one is logged today (site time) and adds an offline check", () => {
    const t = deriveTasks({ ...base, status: "offline", checks: [{ occurred_at: "2026-11-14T05:00:00Z", actor_name: "Mwende", issues: 0 }] });
    expect(t.map((x) => x.id)).toEqual(["offline"]);
  });

  it("never gives the water committee a routine check", () => {
    expect(deriveTasks({ ...base, role: "committee", status: "normal" })).toEqual([]);
  });
});

describe("greeting", () => {
  it("greets by the site's local time and first name", () => {
    expect(greeting("Africa/Nairobi", new Date("2026-11-14T05:00:00Z"))).toBe("Good morning");
    expect(greeting("Africa/Nairobi", new Date("2026-11-14T11:00:00Z"))).toBe("Good afternoon");
    expect(greeting("Africa/Nairobi", new Date("2026-11-14T16:00:00Z"))).toBe("Good evening");
    expect(greeting("Africa/Nairobi", new Date("2026-11-13T22:35:00Z"))).toBe("Good evening"); // 01:35 EAT
    expect(firstName("Mwende Musyoka")).toBe("Mwende");
  });

  it("answers 'is my water OK?' in words for every status", () => {
    expect(statusSentence("normal").emphasis).toBe("running well.");
    expect(statusSentence("needs_attention").tone).toBe("crit");
    expect(statusSentence("offline").emphasis).toBe("is not reporting.");
  });
});
