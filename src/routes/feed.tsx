import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellOff, Inbox, X } from "lucide-react";
import { useWorkStore, type ResolvedItem } from "@/lib/store";
import { team } from "@/data/mock";
import type { SourceKind, Urgency } from "@/lib/types";
import { EmptyState, PageHeader, Panel } from "@/components/workradar/primitives";
import { PriorityCard, sourceName } from "@/components/workradar/PriorityCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Priority Feed · WorkRadar" },
      { name: "description", content: "Ranked cross-system work items with AI rationale, filters and triage actions." },
      { property: "og:title", content: "Priority Feed · WorkRadar" },
      { property: "og:description", content: "Ranked cross-system work items with AI rationale, filters and triage actions." },
    ],
  }),
  component: Feed,
});

type View = "active" | "snoozed" | "resolved";
type Sort = "priority" | "recent" | "waiting";
const ALL = "all";
const urgencies: Urgency[] = ["Critical", "Blocker", "High", "Escalation", "Medium"];
const sorts: Record<Sort, { label: string; fn: (a: ResolvedItem, b: ResolvedItem) => number }> = {
  priority: { label: "Highest priority", fn: (a, b) => a.rank - b.rank },
  recent: { label: "Most recently updated", fn: (a, b) => a.updatedMinutes - b.updatedMinutes },
  waiting: { label: "Longest waiting", fn: (a, b) => b.waitingHours - a.waitingHours },
};

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-36 bg-surface text-sm" aria-label={label}>
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Feed() {
  const { items } = useWorkStore();
  const [view, setView] = useState<View>("active");
  const [status, setStatus] = useState(ALL);
  const [source, setSource] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [urgency, setUrgency] = useState(ALL);
  const [sort, setSort] = useState<Sort>("priority");

  const counts = {
    active: items.filter((i) => !i.done && !i.snoozed).length,
    snoozed: items.filter((i) => i.snoozed).length,
    resolved: items.filter((i) => i.done).length,
  };
  const statuses = [...new Set(items.filter((i) => !i.done && !i.snoozed).map((i) => i.status))];
  const owners = team.filter((p) => items.some((i) => i.assignee.id === p.id));

  const shown = useMemo(
    () =>
      items
        .filter((i) => (view === "resolved" ? i.done : view === "snoozed" ? i.snoozed : !i.done && !i.snoozed))
        .filter((i) => status === ALL || i.displayStatus === status)
        .filter((i) => source === ALL || i.source === source)
        .filter((i) => owner === ALL || i.assignee.id === owner)
        .filter((i) => urgency === ALL || i.urgency === urgency)
        .sort(sorts[sort].fn),
    [items, view, status, source, owner, urgency, sort],
  );

  const chips = [
    status !== ALL && { k: "Status", v: status, clear: () => setStatus(ALL) },
    source !== ALL && { k: "Source", v: sourceName[source as SourceKind], clear: () => setSource(ALL) },
    owner !== ALL && { k: "Owner", v: team.find((p) => p.id === owner)?.name, clear: () => setOwner(ALL) },
    urgency !== ALL && { k: "Urgency", v: urgency, clear: () => setUrgency(ALL) },
  ].filter(Boolean) as { k: string; v: string; clear: () => void }[];
  const clearAll = () => { setStatus(ALL); setSource(ALL); setOwner(ALL); setUrgency(ALL); };

  return (
    <>
      <PageHeader
        title="Priority Feed"
        description={`${counts.active} needing attention · synthesized across Jira, GitHub, Slack and Gmail`}
      />

      <div className="mb-4 flex gap-1 border-b">
        {([["active", "Active"], ["snoozed", "Snoozed"], ["resolved", "Resolved"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              view === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {l} <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{counts[k]}</span>
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterSelect label="Status" value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} />
        <FilterSelect label="Source" value={source} onChange={setSource} options={(Object.keys(sourceName) as SourceKind[]).map((s) => ({ value: s, label: sourceName[s] }))} />
        <FilterSelect label="Owner" value={owner} onChange={setOwner} options={owners.map((p) => ({ value: p.id, label: p.name }))} />
        <FilterSelect label="Urgency" value={urgency} onChange={setUrgency} options={urgencies.map((u) => ({ value: u, label: u }))} />
        <div className="ml-auto">
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-auto bg-surface text-sm" aria-label="Sort by">
              <span className="mr-1 text-muted-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(sorts) as Sort[]).map((s) => <SelectItem key={s} value={s}>{sorts[s].label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <span key={c.k} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground">
              {c.k}: {c.v}
              <button onClick={c.clear} aria-label={`Remove ${c.k} filter`} className="rounded-full hover:bg-primary/10"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <Button size="sm" variant="ghost" onClick={clearAll} className="text-primary">Clear filters</Button>
        </div>
      )}

      <Panel>
        {shown.length ? (
          shown.map((i) => <PriorityCard key={i.id} item={i} />)
        ) : view === "snoozed" && !chips.length ? (
          <EmptyState icon={BellOff} title="Nothing snoozed" description="Snoozed items appear here until they resurface." />
        ) : (
          <EmptyState
            icon={Inbox}
            title={chips.length ? "No items match these filters" : view === "resolved" ? "Nothing resolved yet" : "All caught up"}
            description={chips.length ? "Try removing a filter to see more." : "Items you act on will show up here."}
            action={chips.length ? <Button variant="outline" onClick={clearAll}>Clear filters</Button> : undefined}
          />
        )}
      </Panel>
    </>
  );
}
