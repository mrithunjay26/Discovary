"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CASES, type BurglaryCase, type MatchStatus, type Status } from "./data";

export type ActivityItem = { id: number; at: Date; text: string; tone: "ai" | "detective" | "success" };

interface Store {
  cases: BurglaryCase[];
  analyzed: Record<number, boolean>;
  matchStatus: Record<string, MatchStatus>;
  activity: ActivityItem[];
  leadsApproved: number;
  casesClearedInDemo: number;
  setStatus: (id: number, s: Status, note?: string) => void;
  assign: (id: number, detective: string) => void;
  markAnalyzed: (id: number) => void;
  setMatch: (matchId: string, s: MatchStatus) => void;
  log: (text: string, tone?: ActivityItem["tone"]) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);
let seq = 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<number, Partial<BurglaryCase>>>({});
  const [analyzed, setAnalyzed] = useState<Record<number, boolean>>({});
  const [matchStatus, setMatchStatus] = useState<Record<string, MatchStatus>>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const log = useCallback((text: string, tone: ActivityItem["tone"] = "detective") => {
    setActivity((a) => [{ id: ++seq, at: new Date(), text, tone }, ...a].slice(0, 40));
  }, []);

  const cases = useMemo(() => CASES.map((c) => ({ ...c, ...overrides[c.id] })), [overrides]);

  const setStatus = useCallback(
    (id: number, status: Status, note?: string) => {
      setOverrides((o) => ({ ...o, [id]: { ...o[id], status } }));
      log(note ?? `Case #${id} moved to “${status}”`, status === "Cleared" ? "success" : "detective");
    },
    [log],
  );

  const assign = useCallback(
    (id: number, detective: string) => {
      setOverrides((o) => ({ ...o, [id]: { ...o[id], detective } }));
      log(`Case #${id} assigned to ${detective}`);
    },
    [log],
  );

  const value: Store = {
    cases,
    analyzed,
    matchStatus,
    activity,
    leadsApproved: cases.filter((c) => c.status === "Lead Approved" || (c.status === "Cleared" && overrides[c.id]?.status)).length,
    casesClearedInDemo: Object.values(overrides).filter((o) => o.status === "Cleared").length,
    setStatus,
    assign,
    markAnalyzed: (id) => setAnalyzed((a) => ({ ...a, [id]: true })),
    setMatch: (mid, s) => {
      setMatchStatus((m) => ({ ...m, [mid]: s }));
      log(`LeadsOnline ${mid}: ${s}`, s === "Confirmed" ? "success" : "detective");
    },
    log,
    reset: () => {
      setOverrides({});
      setAnalyzed({});
      setMatchStatus({});
      setActivity([]);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
