import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileQuestion, Sparkles } from "lucide-react";
import { getItem } from "@/data/mock";
import { Avatar, EmptyState, Panel, SeverityBadge } from "@/components/workradar/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/items/$id")({
  loader: ({ params }) => {
    const item = getItem(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.item.id} · WorkRadar` : "Item not found · WorkRadar" },
      { name: "description", content: loaderData?.item.summary ?? "Work item details in WorkRadar." },
      { property: "og:title", content: loaderData ? `${loaderData.item.title} · WorkRadar` : "WorkRadar" },
      { property: "og:description", content: loaderData?.item.summary ?? "Work item details in WorkRadar." },
    ],
  }),
  notFoundComponent: () => (
    <Panel>
      <EmptyState icon={FileQuestion} title="Item not found" description="It may have been resolved or removed."
        action={<Button asChild variant="outline"><Link to="/feed">Back to feed</Link></Button>} />
    </Panel>
  ),
  component: ItemDetails,
});

function ItemDetails() {
  const { item } = Route.useLoaderData();
  return (
    <>
      <Link to="/feed" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Priority Feed
      </Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SeverityBadge severity={item.severity} /> {item.sourceRef} · {item.status} · {item.timing}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{item.title}</h1>
          <p className="mt-2 text-muted-foreground">{item.summary}</p>
          <div className="mt-6 rounded-lg border bg-primary-soft p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground"><Sparkles className="h-4 w-4" /> Why this matters</p>
            <p className="mt-2 text-sm">{item.rationale}</p>
          </div>
          <div className="mt-6 flex gap-2">
            <Button>Take action</Button>
            <Button variant="outline">Snooze</Button>
          </div>
        </Panel>
        <Panel className="p-5 text-sm">
          <dl className="space-y-4">
            <div><dt className="text-muted-foreground">Owner</dt><dd className="mt-1 flex items-center gap-2 font-medium"><Avatar initials={item.owner.initials} />{item.owner.name}</dd></div>
            <div><dt className="text-muted-foreground">Team</dt><dd className="mt-1 font-medium">{item.team}</dd></div>
            <div><dt className="text-muted-foreground">Last updated</dt><dd className="mt-1 font-medium">{item.updatedAt}</dd></div>
            <div><dt className="text-muted-foreground">Tags</dt><dd className="mt-1 flex flex-wrap gap-1.5">{item.tags.map((t) => <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs">{t}</span>)}</dd></div>
          </dl>
        </Panel>
      </div>
    </>
  );
}
