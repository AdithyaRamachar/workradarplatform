import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPerson, workItems } from "@/data/mock";
import type { Person, WorkItem } from "@/lib/types";

/** Local-only overrides layered on top of mock work items. Never synced anywhere. */
export interface ItemOverride {
  assigneeId?: string | undefined;
  done?: boolean | undefined;
  snoozedUntil?: number | undefined;
  snoozeLabel?: string | undefined;
  feedback?: "up" | "down" | undefined;
}

export interface ResolvedItem extends WorkItem {
  assignee: Person;
  done: boolean;
  snoozed: boolean;
  snoozedUntil?: number | undefined;
  snoozeLabel?: string | undefined;
  displayStatus: string;
  feedback?: "up" | "down" | undefined;
}

const KEY = "workradar:item-state:v1";

export function resolveItem(item: WorkItem, o: ItemOverride = {}, now = 0): ResolvedItem {
  const snoozed = !o.done && !!o.snoozedUntil && o.snoozedUntil > now;
  return {
    ...item,
    assignee: (o.assigneeId && getPerson(o.assigneeId)) || item.owner,
    done: !!o.done,
    snoozed,
    snoozedUntil: snoozed ? o.snoozedUntil : undefined,
    snoozeLabel: snoozed ? o.snoozeLabel : undefined,
    feedback: o.feedback,
    displayStatus: o.done ? "Resolved" : snoozed ? "Snoozed" : item.status,
  };
}

/** Snooze option -> wake-up timestamp. "Until tomorrow" means 9:00 AM next day. */
export function snoozeUntil(option: "1h" | "4h" | "tomorrow", from: Date): number {
  if (option === "1h") return from.getTime() + 3_600_000;
  if (option === "4h") return from.getTime() + 4 * 3_600_000;
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

interface Store {
  items: ResolvedItem[];
  get: (id: string) => ResolvedItem | undefined;
  assign: (id: string, personId: string) => void;
  setDone: (id: string, done: boolean) => void;
  snooze: (id: string, until: number, label: string) => void;
  unsnooze: (id: string) => void;
  setFeedback: (id: string, f: "up" | "down" | undefined) => void;
  hydrated: boolean;
}

const Ctx = createContext<Store | null>(null);

export function WorkStoreProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ItemOverride>>({});
  const [now, setNow] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch { /* ignore */ }
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const patch = useCallback((id: string, p: Partial<ItemOverride>) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...p } };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setNow(Date.now());
  }, []);

  const value = useMemo<Store>(() => {
    const items = workItems.map((i) => resolveItem(i, overrides[i.id], now));
    return {
      items,
      get: (id) => items.find((i) => i.id === id),
      assign: (id, personId) => patch(id, { assigneeId: personId }),
      setDone: (id, done) => patch(id, { done }),
      snooze: (id, until, label) => patch(id, { snoozedUntil: until, snoozeLabel: label }),
      setFeedback: (id, f) => patch(id, { feedback: f }),
      hydrated: now > 0,
      unsnooze: (id) => patch(id, { snoozedUntil: undefined, snoozeLabel: undefined }),
    };
  }, [overrides, now, patch]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWorkStore must be used inside WorkStoreProvider");
  return c;
}

export const fmtTime = (ms: number) =>
  new Date(ms).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
