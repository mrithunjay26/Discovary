"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CASES, type BurglaryCase, type MatchStatus, type Status } from "./data";
import { DEMO_NOW, RULES_VERSION, type Query } from "./listings";

export type ActivityItem = { id: number; at: Date; text: string; tone: "ai" | "detective" | "success" };

// ---------- Phase 1 audit log (V6: every query and every result is logged; no case data) ----------
export type AuditAction = "Search run" | "Query blocked" | "Saved copy opened" | "Lead exported to case file" | "Lead set aside";
export interface AuditEntry {
  id: number;
  at: string; // demo-clock timestamp
  user: string;
  action: AuditAction;
  query: string; // structured descriptors only
  result: string;
  rules: string;
}
export type LeadStatus = "exported" | "set-aside";

export const DEMO_USER = "Det. K. Nguyen · D-0417";

const stamp = (offsetSec: number) => {
  const d = new Date(DEMO_NOW.getTime() + offsetSec * 1000);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
};

// Earlier synthetic entries (other detectives, previous days) so the log isn't empty.
export const SEEDED_AUDIT: AuditEntry[] = [
  { id: -1, at: "Aug 7, 4:02:18 PM", user: "Det. M. Brooks · D-0388", action: "Lead exported to case file", query: "Bicycle · Trek FX 3 hybrid bike · Blue · Aug 1–7 · West", result: "Lead SS-47960 (score 78)", rules: RULES_VERSION },
  { id: -2, at: "Aug 7, 4:01:40 PM", user: "Det. M. Brooks · D-0388", action: "Search run", query: "Bicycle · Trek FX 3 hybrid bike · Blue · Aug 1–7 · West", result: "1 lead · 2 below threshold · 3 sources (all complete)", rules: RULES_VERSION },
  { id: -3, at: "Aug 7, 11:20:05 AM", user: "Det. T. Haddad · D-0452", action: "Search run", query: "Camera · Sony Alpha 7 IV · Black · Jul 30–Aug 7 · South", result: "No match found · 3 sources (1 partial)", rules: RULES_VERSION },
  { id: -4, at: "Aug 6, 3:48:51 PM", user: "Det. R. Alvarez · D-0371", action: "Query blocked", query: "Model field rejected: looks like a street address (blocked text is not stored)", result: "Nothing searched", rules: RULES_VERSION },
];

interface Store {
  // Phase 2 concept state
  cases: BurglaryCase[];
  analyzed: Record<number, boolean>;
  matchStatus: Record<string, MatchStatus>;
  activity: ActivityItem[];
  leadsApproved: number;
  setStatus: (id: number, s: Status, note?: string) => void;
  assign: (id: number, detective: string) => void;
  markAnalyzed: (id: number) => void;
  setMatch: (matchId: string, s: MatchStatus) => void;
  log: (text: string, tone?: ActivityItem["tone"]) => void;
  // Phase 1 pilot state
  lastQuery: Query | null;
  setLastQuery: (q: Query | null) => void;
  leadStatus: Record<string, LeadStatus>;
  setLeadStatus: (listingId: string, s: LeadStatus | null, score?: number) => void;
  audit: AuditEntry[];
  addAudit: (e: Omit<AuditEntry, "id" | "at" | "user" | "rules">) => void;
  reset: () => void;
  nonce: number; // bumps on reset so pages can remount cleanly
}

const Ctx = createContext<Store | null>(null);
let seq = 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<number, Partial<BurglaryCase>>>({});
  const [analyzed, setAnalyzed] = useState<Record<number, boolean>>({});
  const [matchStatus, setMatchStatus] = useState<Record<string, MatchStatus>>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [lastQuery, setLastQuery] = useState<Query | null>(null);
  const [leadStatus, setLeadStatusMap] = useState<Record<string, LeadStatus>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [nonce, setNonce] = useState(0);

  const log = useCallback((text: string, tone: ActivityItem["tone"] = "detective") => {
    setActivity((a) => [{ id: ++seq, at: new Date(), text, tone }, ...a].slice(0, 40));
  }, []);

  const addAudit = useCallback((e: Omit<AuditEntry, "id" | "at" | "user" | "rules">) => {
    setAudit((a) => {
      const id = a.length + 1;
      return [{ ...e, id, at: stamp(id * 23), user: DEMO_USER, rules: RULES_VERSION }, ...a];
    });
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
    leadsApproved: cases.filter((c) => c.status === "Lead Approved").length,
    setStatus,
    assign,
    markAnalyzed: (id) => setAnalyzed((a) => ({ ...a, [id]: true })),
    setMatch: (mid, s) => {
      setMatchStatus((m) => ({ ...m, [mid]: s }));
      log(`LeadsOnline ${mid}: ${s}`, s === "Confirmed" ? "success" : "detective");
    },
    log,
    lastQuery,
    setLastQuery,
    leadStatus,
    setLeadStatus: (listingId, s, score) => {
      setLeadStatusMap((m) => {
        const next = { ...m };
        if (s) next[listingId] = s;
        else delete next[listingId];
        return next;
      });
      if (s)
        addAudit({
          action: s === "exported" ? "Lead exported to case file" : "Lead set aside",
          query: "—",
          result: `Lead ${listingId}${score !== undefined ? ` (score ${score})` : ""}. Ranking unchanged.`,
        });
    },
    audit,
    addAudit,
    reset: () => {
      setOverrides({});
      setAnalyzed({});
      setMatchStatus({});
      setActivity([]);
      setLastQuery(null);
      setLeadStatusMap({});
      setAudit([]);
      setNonce((n) => n + 1);
    },
    nonce,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
