import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { workItems } from "@/data/mock";
import type { Severity } from "@/lib/types";
import { EmptyState, ItemRow, PageHeader, Panel } from "@/components/workradar/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Priority Feed · WorkRadar" },
      { name: "description", content: "AI-ranked feed of the engineering work that needs you most." },
      { property: "og:title", content: "Priority Feed · WorkRadar" },
      { property: "og:description", content: "AI-ranked feed of the engineering work that needs you most." },
    ],
  }),
  component: Feed,
});

const filters: (Severity | "all")[] = ["all", "critical", "warning", "info", "success"];

function Feed() {
  const [f, setF] = useState<Severity | "all">("all");
  const items = workItems.filter((i) => f === "all" || i.severity === f);
  return (
    <>
      <PageHeader title="Priority Feed" description="Ranked by urgency and impact across all connected sources." />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium capitalize transition-colors",
              f === x ? "border-primary bg-primary text-primary-foreground" : "bg-surface hover:bg-muted",
            )}
          >
            {x}
          </button>
        ))}
      </div>
      <Panel>
        {items.length ? items.map((i) => <ItemRow key={i.id} item={i} />) : (
          <EmptyState icon={Inbox} title="Nothing here" description="No items match this filter right now." />
        )}
      </Panel>
    </>
  );
}
