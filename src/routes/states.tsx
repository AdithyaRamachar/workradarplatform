import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/workradar/primitives";
import {
  AllCaughtUpState, ItemUnavailableState, NewWorkspaceState, NoSearchResultsState, SourceErrorState, StaleDataState,
} from "@/components/workradar/states";

export const Route = createFileRoute("/states")({
  head: () => ({
    meta: [
      { title: "System States · WorkRadar" },
      { name: "description", content: "Empty, error and recovery states used across WorkRadar." },
      { property: "og:title", content: "System States · WorkRadar" },
      { property: "og:description", content: "Empty, error and recovery states used across WorkRadar." },
    ],
  }),
  component: States,
});

function Cell({ label, where, children }: { label: string; where: string; children: ReactNode }) {
  return (
    <Panel className="flex flex-col">
      <div className="flex items-center justify-between border-b px-5 py-3 text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{where}</span>
      </div>
      <div className="flex flex-1 items-center">{children}</div>
    </Panel>
  );
}

function States() {
  const note = (m: string) => () => toast(m);
  return (
    <>
      <PageHeader
        title="System States & Error Recovery"
        description="Reusable states shown across WorkRadar. Anything marked “Simulated state” is a prototype demo, not a real system failure."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Cell label="New workspace" where="Dashboard"><NewWorkspaceState onUseSample={note("Sample data is already loaded in this prototype")} /></Cell>
        <Cell label="No urgent items" where="Priority Feed"><AllCaughtUpState /></Cell>
        <Cell label="No search results" where="Search"><NoSearchResultsState query="kubernetes" onClearSearch={note("Search cleared")} onClearFilters={note("Filters cleared")} /></Cell>
        <Cell label="Source connection error" where="Sidebar · Dashboard"><SourceErrorState /></Cell>
        <Cell label="Item unavailable" where="Item details"><ItemUnavailableState id="PAY-999" /></Cell>
        <Cell label="Stale data" where="Dashboard"><StaleDataState onContinue={note("Continuing with available data")} /></Cell>
      </div>
    </>
  );
}
