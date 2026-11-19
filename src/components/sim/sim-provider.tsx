"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { applyAction, electLeader, type Member, type Shared, type SimAction, type Speed } from "@/lib/sim/actions";
import { initialState, step } from "@/lib/sim/engine";
import { getPublicSupabaseConfig } from "@/lib/env";
import { getSupabase } from "@/lib/supabase/client";

/*
 * One simulation shared by every open demo screen (phone, laptop, projector).
 *
 * Screens join the real-time broadcast channel "sim-demo". The screen that joined first is the leader: it runs the
 * engine and broadcasts a snapshot about 5 times per second. Every other screen shows those snapshots and sends its
 * button presses to the leader as actions. If the leader closes, the next screen takes over from the last snapshot.
 * Nothing is stored anywhere: no tables, no database writes, no production data. Without a connection the page
 * simply runs on its own.
 */

const CHANNEL = "sim-demo";
const SNAPSHOT_MS = 200;
const SUBSCRIBE_TIMEOUT_MS = 4000;

export type SyncStatus = "connecting" | "live" | "local";

interface SimContextValue {
  state: Shared["state"];
  speed: Speed;
  dispatch: (a: SimAction) => void;
  status: SyncStatus;
  screens: number;
  isLeader: boolean;
}

const SimContext = createContext<SimContextValue | null>(null);

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function SimProvider({ children }: { children: React.ReactNode }) {
  const [shared, setShared] = useState<Shared>(() => ({ state: initialState(), speed: 60 }));
  // Without real-time configuration the screen runs on its own from the start.
  const [offline] = useState(() => getPublicSupabaseConfig() === null);
  const [status, setStatus] = useState<SyncStatus>(offline ? "local" : "connecting");
  const [screens, setScreens] = useState(1);
  const [isLeader, setIsLeader] = useState(offline);

  const sharedRef = useRef(shared);
  const leaderRef = useRef(offline);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const me = useRef({ id: "", joinedAt: 0 });
  // Presses made before this screen knows its role (the first second or so) wait here, so none are lost.
  const pending = useRef<SimAction[]>([]);
  const ready = useRef(offline);

  useEffect(() => {
    sharedRef.current = shared;
  }, [shared]);

  const becomeLeader = useCallback((on: boolean) => {
    leaderRef.current = on;
    setIsLeader(on);
    ready.current = true;
    const queued = pending.current.splice(0);
    if (queued.length === 0) return;
    if (on || !channelRef.current) {
      const updated = queued.reduce(applyAction, sharedRef.current);
      sharedRef.current = updated;
      setShared(updated);
    } else {
      for (const a of queued) void channelRef.current.send({ type: "broadcast", event: "action", payload: a });
    }
  }, []);

  // Connect to the shared channel (or fall back to running locally).
  useEffect(() => {
    me.current = { id: randomId(), joinedAt: Date.now() };
    const db = offline ? null : getSupabase();
    if (!db) return;
    const channel = db.channel(CHANNEL, { config: { broadcast: { self: false }, presence: { key: me.current.id } } });
    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const members: Member[] = Object.entries(channel.presenceState<{ joinedAt: number }>()).map(([id, metas]) => ({
        id,
        joinedAt: metas[0]?.joinedAt ?? Number.MAX_SAFE_INTEGER,
      }));
      setScreens(Math.max(1, members.length));
      becomeLeader(electLeader(members) === me.current.id);
    });
    channel.on("broadcast", { event: "snapshot" }, ({ payload }) => {
      if (!leaderRef.current) setShared(payload as Shared);
    });
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      if (leaderRef.current) setShared((sh) => applyAction(sh, payload as SimAction));
    });

    const fallback = setTimeout(() => {
      // No connection in time: run on this screen alone.
      setStatus((st) => (st === "connecting" ? "local" : st));
      if (!leaderRef.current) becomeLeader(true);
    }, SUBSCRIBE_TIMEOUT_MS);

    channel.subscribe(async (st) => {
      if (st === "SUBSCRIBED") {
        clearTimeout(fallback);
        setStatus("live");
        await channel.track({ joinedAt: me.current.joinedAt });
      } else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") {
        setStatus("local");
        becomeLeader(true);
      }
    });

    return () => {
      clearTimeout(fallback);
      channelRef.current = null;
      db.removeChannel(channel);
    };
  }, [becomeLeader, offline]);

  // The leader runs the engine about 20 times per second and broadcasts snapshots. A timer (not animation frames)
  // keeps it running even when the leading screen's tab is in the background, so other screens never freeze.
  useEffect(() => {
    let last = performance.now();
    let sinceSnap = 0;
    const timer = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(2, (now - last) / 1000);
      last = now;
      if (!leaderRef.current) return;
      let left = dt * sharedRef.current.speed;
      let next = sharedRef.current.state;
      while (left > 0) {
        const d = Math.min(5, left);
        next = step(next, d);
        left -= d;
      }
      const updated = { ...sharedRef.current, state: next };
      sharedRef.current = updated;
      setShared(updated);
      sinceSnap += dt * 1000;
      if (sinceSnap >= SNAPSHOT_MS && channelRef.current) {
        sinceSnap = 0;
        void channelRef.current.send({ type: "broadcast", event: "snapshot", payload: updated });
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const dispatch = useCallback((a: SimAction) => {
    if (!ready.current) {
      pending.current.push(a);
      return;
    }
    if (leaderRef.current || !channelRef.current) {
      const updated = applyAction(sharedRef.current, a);
      sharedRef.current = updated;
      setShared(updated);
      void channelRef.current?.send({ type: "broadcast", event: "snapshot", payload: updated });
    } else {
      void channelRef.current.send({ type: "broadcast", event: "action", payload: a });
    }
  }, []);

  return (
    <SimContext.Provider value={{ state: shared.state, speed: shared.speed, dispatch, status, screens, isLeader }}>
      {children}
    </SimContext.Provider>
  );
}

export function useSim() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim must be used inside <SimProvider>");
  return ctx;
}
