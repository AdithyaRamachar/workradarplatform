import { createFileRoute } from "@tanstack/react-router";
import { CloudOff, Inbox, PlugZap } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/workradar/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/states")({
  head: () => ({
    meta: [
      { title: "Empty & Error States · WorkRadar" },
      { name: "description", content: "Reference empty, error and disconnected states for WorkRadar." },
      { property: "og:title", content: "Empty & Error States · WorkRadar" },
      { property: "og:description", content: "Reference empty, error and disconnected states for WorkRadar." },
    ],
  }),
  component: States,
});

function States() {
  return (
    <>
      <PageHeader title="Empty & Error States" description="Reference patterns used across the app." />
      <div className="grid gap-6 md:grid-cols-3">
        <Panel><EmptyState icon={Inbox} title="All caught up" description="No priority items need your attention." /></Panel>
        <Panel><EmptyState icon={CloudOff} title="Couldn't load data" description="Something went wrong while syncing." action={<Button variant="outline">Retry</Button>} /></Panel>
        <Panel><EmptyState icon={PlugZap} title="PagerDuty disconnected" description="Reconnect to resume incident tracking." action={<Button>Reconnect</Button>} /></Panel>
      </div>
    </>
  );
}
