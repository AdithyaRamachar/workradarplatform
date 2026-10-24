import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { metrics, workItems } from "@/data/mock";
import { ItemRow, PageHeader, Panel, SeverityBadge } from "@/components/workradar/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · WorkRadar" },
      { name: "description", content: "Your engineering team at a glance: risks, blockers and progress." },
      { property: "og:title", content: "Dashboard · WorkRadar" },
      { property: "og:description", content: "Your engineering team at a glance: risks, blockers and progress." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Good evening, Priya"
        description="Here's what needs your attention across Platform Engineering."
        actions={<Button asChild><Link to="/feed">Open priority feed</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Panel key={m.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <SeverityBadge severity={m.severity} />
            </div>
            <p className="mt-3 text-3xl font-semibold">{m.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.delta}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Top priorities</h2>
            <Link to="/feed" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          {workItems.slice(0, 3).map((i) => <ItemRow key={i.id} item={i} />)}
        </Panel>
        <Panel className="p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> AI briefing</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            One critical incident is likely tied to yesterday's payments release. Two reviews are blocking the auth
            migration, and on-call load is trending up for the platform team.
          </p>
          <div className="mt-4 rounded-md bg-primary-soft p-3 text-sm text-accent-foreground">
            Suggested: reassign review on PR #4790 to unblock Thursday's milestone.
          </div>
        </Panel>
      </div>
    </>
  );
}
