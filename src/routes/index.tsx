import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, History, RefreshCw, Sparkles, UserX } from "lucide-react";
import { blockedPeople, briefs, currentUser, metrics, recentActivity, sources, workItems } from "@/data/mock";
import { Avatar, Panel, SeverityBadge, StatusDot, severityStyles } from "@/components/workradar/primitives";
import { PriorityCard, sourceIcon, type ItemState } from "@/components/workradar/PriorityCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · WorkRadar" },
      { name: "description", content: "AI daily brief, top priorities and blockers for your engineering org." },
      { property: "og:title", content: "Dashboard · WorkRadar" },
      { property: "og:description", content: "AI daily brief, top priorities and blockers for your engineering org." },
    ],
  }),
  component: Dashboard,
});

const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function Dashboard() {
  const [briefIdx, setBriefIdx] = useState(0);
  const [generatedAt, setGeneratedAt] = useState("8:42 AM");
  const [spinning, setSpinning] = useState(false);
  const [states, setStates] = useState<Record<string, ItemState>>({});
  const brief = briefs[briefIdx]!;

  const regenerate = () => {
    setSpinning(true);
    setTimeout(() => {
      setBriefIdx((i) => (i + 1) % briefs.length);
      setGeneratedAt(fmt(new Date()));
      setSpinning(false);
    }, 600);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Good morning, {currentUser.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform Engineering · 9 reports · Synced 8m ago across 4 sources
        </p>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> AI Daily Brief
            <span className="text-sm font-normal text-muted-foreground">· Generated today, {generatedAt}</span>
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={regenerate} disabled={spinning}>
              <RefreshCw className={cn(spinning && "animate-spin")} /> Regenerate Brief
            </Button>
            <Button size="sm" asChild><Link to="/feed">View Priorities <ArrowRight /></Link></Button>
          </div>
        </div>
        <div className={cn("p-5 transition-opacity", spinning && "opacity-40")}>
          <p className="text-[15px] leading-relaxed">{brief.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { label: "Critical Blockers", value: brief.blockers, cls: "border-l-critical" },
              { label: "Recent Changes", value: brief.changes, cls: "border-l-info" },
              { label: "Next Actions", value: brief.nextActions, cls: "border-l-success" },
            ].map((b) => (
              <div key={b.label} className={cn("rounded-md border border-l-4 bg-surface px-3 py-2.5", b.cls)}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{b.label}</p>
                <p className="mt-1 text-sm font-medium">{b.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supporting evidence</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {brief.evidence.map((e) => (
                <li key={e} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{e}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Panel key={m.label} className="px-4 py-3.5">
            <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{m.value}</span>
              <span className={cn("text-xs font-medium", severityStyles[m.severity].cls.split(" ")[1])}>{m.delta}</span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Top Priorities <span className="font-normal text-muted-foreground">· {workItems.length} items</span></h2>
            <span className="text-xs text-muted-foreground">Sorted by downstream urgency</span>
          </div>
          {workItems.map((i) => (
            <PriorityCard key={i.id} item={i} state={states[i.id] ?? {}} onChange={(s) => setStates((p) => ({ ...p, [i.id]: s }))} />
          ))}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold"><UserX className="h-4 w-4 text-critical" /> Blocked People</h2>
              <span className="text-xs text-muted-foreground">{blockedPeople.length}</span>
            </div>
            <ul>
              {blockedPeople.map((b) => (
                <li key={b.person.id} className="flex gap-3 border-b px-5 py-3.5 last:border-0">
                  <Avatar initials={b.person.initials} size="md" />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{b.person.name}</p>
                      <span className="text-xs font-medium text-critical">{b.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.person.role}</p>
                    <p className="mt-1 text-xs">Waiting on: {b.waitingOn} <span className="text-muted-foreground">({b.ref})</span></p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-primary" /> Recent Activity</h2>
              <span className="text-xs text-muted-foreground">Last 24h</span>
            </div>
            <ul className="px-5 py-2">
              {recentActivity.map((a) => (
                <li key={a.id} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="mt-1 font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <footer className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-surface px-5 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Source health</span>
        {sources.map((s) => {
          const I = sourceIcon[s.id];
          return (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <StatusDot status={s.status} /> <I className="h-3.5 w-3.5" /> {s.name} · {s.lastSync}
            </span>
          );
        })}
        <span className="ml-auto">Next sync in 7 min</span>
      </footer>
    </>
  );
}
