import { describe, expect, it } from "vitest";
import { applyAction, electLeader, type Shared } from "@/lib/sim/actions";
import { initialState, tankPct } from "@/lib/sim/engine";

const start = (): Shared => ({ state: initialState(), speed: 60 });

describe("applyAction (actions sent between screens)", () => {
  it("applies pump, fault and restore actions through the engine", () => {
    let sh = applyAction(start(), { kind: "setPump", on: true });
    expect(sh.state.pumpRunning).toBe(true);
    sh = applyAction(sh, { kind: "failSolar" });
    expect(sh.state.pumpRunning).toBe(false);
    sh = applyAction(sh, { kind: "restoreNormal" });
    expect(sh.state.pumpRunning).toBe(true);
  });

  it("changes the shared speed without touching the engine state", () => {
    const before = start();
    const sh = applyAction(before, { kind: "setSpeed", speed: 300 });
    expect(sh.speed).toBe(300);
    expect(sh.state).toBe(before.state);
  });

  it("actions survive a JSON round trip (as sent over the channel)", () => {
    const action = JSON.parse(JSON.stringify({ kind: "setTankPct", pct: 30 }));
    expect(tankPct(applyAction(start(), action).state)).toBeCloseTo(30, 6);
  });

  it("a snapshot survives a JSON round trip unchanged", () => {
    const sh = applyAction(start(), { kind: "startLeak" });
    expect(JSON.parse(JSON.stringify(sh))).toEqual(sh);
  });
});

describe("electLeader (which screen runs the engine)", () => {
  it("picks the screen that joined first, and every screen agrees", () => {
    const members = [{ id: "c", joinedAt: 30 }, { id: "a", joinedAt: 10 }, { id: "b", joinedAt: 20 }];
    expect(electLeader(members)).toBe("a");
    expect(electLeader([...members].reverse())).toBe("a");
  });

  it("breaks ties by id and hands over when the leader leaves", () => {
    expect(electLeader([{ id: "y", joinedAt: 5 }, { id: "x", joinedAt: 5 }])).toBe("x");
    expect(electLeader([{ id: "b", joinedAt: 20 }, { id: "c", joinedAt: 30 }])).toBe("b");
    expect(electLeader([])).toBeNull();
  });
});
