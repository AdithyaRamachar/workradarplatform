import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SearchX, Search as SearchIcon } from "lucide-react";
import { workItems } from "@/data/mock";
import { EmptyState, ItemRow, PageHeader, Panel } from "@/components/workradar/primitives";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search · WorkRadar" },
      { name: "description", content: "Search pull requests, tickets, incidents and threads in one place." },
      { property: "og:title", content: "Search · WorkRadar" },
      { property: "og:description", content: "Search pull requests, tickets, incidents and threads in one place." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const results = term ? workItems.filter((i) => `${i.title} ${i.summary} ${i.team} ${i.tags.join(" ")}`.toLowerCase().includes(term)) : [];
  return (
    <>
      <PageHeader title="Search" description="Ask about any PR, ticket, incident or conversation." />
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “payments”, “blocked” or “release”"
          className="h-12 w-full rounded-lg border bg-surface pl-12 pr-4 shadow-card outline-none focus:border-primary"
        />
      </div>
      <Panel>
        {!term ? (
          <EmptyState icon={SearchIcon} title="Start typing to search" description="Results come from GitHub, Jira, Slack and PagerDuty." />
        ) : results.length ? (
          results.map((i) => <ItemRow key={i.id} item={i} />)
        ) : (
          <EmptyState icon={SearchX} title="No results" description={`Nothing matched “${q}”. Try a broader term.`} />
        )}
      </Panel>
    </>
  );
}
