import { createFileRoute, Link, notFound, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, CloudOff, Eye, Radar, Sparkles, Undo2 } from "lucide-react";
import { getItem } from "@/data/mock";
import { itemDetails } from "@/data/itemDetails";
import { Avatar, EmptyState, Panel, SeverityBadge, severityStyles } from "@/components/workradar/primitives";
import { AssignPicker, DoneButton, Feedback, SnoozeMenu, sourceIcon, sourceName } from "@/components/workradar/PriorityCard";
import { Button } from "@/components/ui/button";
import { ItemUnavailableState } from "@/components/workradar/states";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtTime, useWorkStore, type ResolvedItem } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/items/$id")({
  loader: ({ params }) => {
    const item = getItem(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.item.title} · WorkRadar` : "Item unavailable · WorkRadar" },
      { name: "description", content: loaderData?.item.summary ?? "Work item details in WorkRadar." },
      { property: "og:title", content: loaderData ? `${loaderData.item.title} · WorkRadar` : "WorkRadar" },
      { property: "og:description", content: loaderData?.item.summary ?? "Work item details in WorkRadar." },
      ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
    ],
  }),
  pendingComponent: DetailSkeleton,
  notFoundComponent: () => {
    const { id } = Route.useParams();
    return <Panel><ItemUnavailableState id={id} /></Panel>;
  },
  errorComponent: DetailError,
  component: ItemDetails,
});

function DetailError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <Panel>
      <EmptyState icon={CloudOff} title="Couldn't load this item" description="Something went wrong rendering this item."
        action={<Button variant="outline" onClick={() => { router.invalidate(); reset(); }}>Try again</Button>} />
    </Panel>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Loading item">
      <div className="space-y-4 lg:col-span-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-56 w-full" /></div>
    </div>
  );
}

function SectionTitle({ children, tag }: { children: React.ReactNode; tag?: "ai" | "source" }) {
  return (
    <div className="flex items-center justify-between border-b px-5 py-3.5">
      <h2 className="font-semibold">{children}</h2>
      {tag && <SourceTag kind={tag} />}
    </div>
  );
}

/** Explicit label distinguishing AI interpretation from source observation. */
function SourceTag({ kind }: { kind: "ai" | "source" }) {
  return kind === "ai" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
      <Sparkles className="h-3 w-3" /> AI interpretation
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      <Eye className="h-3 w-3" /> Source observation
    </span>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

const lifecycle = ["Detected", "Ranked", "In triage", "Resolved"];

function ItemDetails() {
  const { item: base } = Route.useLoaderData();
  const store = useWorkStore();
  const item = store.get(base.id);
  const d = itemDetails[base.id];
  if (!store.hydrated || !item || !d) return <DetailSkeleton />;
  const SIcon = sourceIcon[item.source];
  const stage = item.done ? 3 : 2;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Dashboard</Link><ChevronRight className="h-3 w-3" />
        <Link to="/feed" className="hover:text-foreground">Priority Feed</Link><ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{item.sourceRef}</span>
      </nav>
      <Link to="/feed" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Priority Feed
      </Link>

      {item.done && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-5 w-5" />
          <span className="flex-1 font-medium">Marked done in WorkRadar. The original {sourceName[item.source]} record has not been changed.</span>
          <Button size="sm" variant="outline" onClick={() => store.setDone(item.id, false)}><Undo2 /> Undo</Button>
        </div>
      )}
      {item.snoozed && item.snoozedUntil && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          <span className="flex-1 font-medium">Snoozed {item.snoozeLabel?.toLowerCase()} · returns {fmtTime(item.snoozedUntil)}</span>
          <Button size="sm" variant="outline" onClick={() => store.unsnooze(item.id)}><Undo2 /> Unsnooze</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-medium"><SIcon className="h-3.5 w-3.5" /> {item.sourceRef}</span>

            </div>
            <h1 className={cn("mt-2 text-2xl font-semibold tracking-tight", item.done && "text-muted-foreground line-through")}>{item.title}</h1>
            <p className="mt-1 text-muted-foreground">{item.summary}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground">Priority</dt><dd className="mt-1"><span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase", severityStyles[item.severity].cls)}>#{item.rank} · {item.urgency}</span></dd></div>
              <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-1 font-medium">{item.displayStatus}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Assignee</dt><dd className="mt-1 flex items-center gap-1.5 font-medium"><Avatar initials={item.assignee.initials} />{item.assignee.name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Due</dt><dd className="mt-1 font-medium">{d.dueDate}</dd></div>
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <AssignPicker item={item} /><SnoozeMenu item={item} /><DoneButton item={item} />
            </div>
          </Panel>

          <Panel>
            <SectionTitle tag="ai"><span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Assessment & Priority Rationale</span></SectionTitle>
            <div className="space-y-3 p-5 text-sm">
              <p className="leading-relaxed">{d.assessment}</p>
              <p className="rounded-md bg-muted px-3 py-2"><span className="font-medium">Why ranked #{item.rank}: </span><span className="text-muted-foreground">{item.rationale}</span></p>
              <p className="text-xs text-muted-foreground">Confidence: {d.confidence} · Impact score {d.impactScore}/100 · Pre-written sample analysis</p>
            </div>
          </Panel>

          <Panel>
            <SectionTitle tag="source">Supporting Evidence</SectionTitle>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {d.evidence.map((e, i) => {
                const I = sourceIcon[e.source];
                return (
                  <div key={i} className="rounded-md border bg-surface p-3.5 text-sm">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground"><I className="h-3.5 w-3.5" /> {sourceName[e.source]} · {e.ref}</span>
                      <span>{e.time}</span>
                    </div>
                    <p className="mt-2">{e.observation}</p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <SectionTitle>Evidence & Activity Timeline</SectionTitle>
            <ol className="relative mx-5 my-4 border-l">
              {d.timeline.map((t, i) => {
                const I = t.source === "workradar" ? Radar : sourceIcon[t.source];
                return (
                  <li key={i} className="mb-4 ml-5 last:mb-0">
                    <span className={cn("absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border bg-surface", t.source === "workradar" && "border-primary text-primary")}>
                      <I className="h-3 w-3" />
                    </span>
                    <p className="text-sm">{t.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.time} · {t.source === "workradar" ? "WorkRadar (AI ranking)" : sourceName[t.source]}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel>
            <SectionTitle>Related Work Items</SectionTitle>
            <ul>
              {d.related.map((rid) => {
                const r = store.get(rid);
                if (!r) return null;
                return <RelatedRow key={rid} r={r} />;
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <SectionTitle>Lifecycle</SectionTitle>
            <ol className="space-y-2.5 p-5 text-sm">
              {lifecycle.map((s, i) => (
                <li key={s} className="flex items-center gap-2.5">
                  <span className={cn("h-2.5 w-2.5 rounded-full", i < stage ? "bg-primary" : i === stage ? "bg-primary ring-4 ring-primary-soft" : "bg-border")} />
                  <span className={cn(i === stage ? "font-semibold" : i > stage && "text-muted-foreground")}>{s}</span>
                  {i === stage && item.snoozed && <span className="text-xs text-warning">(snoozed)</span>}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel>
            <SectionTitle>Assignment</SectionTitle>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar initials={item.assignee.initials} size="md" />
                <div className="text-sm"><p className="font-medium">{item.assignee.name}</p><p className="text-xs text-muted-foreground">{item.assignee.role}</p></div>
              </div>
              {item.assignee.id !== item.owner.id && <p className="mt-3 text-xs text-muted-foreground">Reassigned in WorkRadar from {item.owner.name}. Not synced to {sourceName[item.source]}.</p>}
              <div className="mt-4"><AssignPicker item={item} /></div>
            </div>
          </Panel>

          <Panel>
            <SectionTitle>Details</SectionTitle>
            <dl className="divide-y px-5 py-2">
              <Meta label="Source">{sourceName[item.source]}</Meta>
              <Meta label="Reference">{item.sourceRef}</Meta>
              <Meta label="Team">{item.team}</Meta>
              <Meta label="Waiting">{item.timing}</Meta>
              <Meta label="Last updated">{item.updatedAt}</Meta>
              {d.metadata.map((m) => <Meta key={m.label} label={m.label}>{m.value}</Meta>)}
            </dl>
          </Panel>

          <Panel>
            <SectionTitle>Manager Feedback & Triage</SectionTitle>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Is this ranking right?</span>
                <Feedback item={item} />
              </div>
              <div className="flex flex-wrap gap-2"><SnoozeMenu item={item} /><DoneButton item={item} /></div>
              <p className="text-xs text-muted-foreground">Actions are saved in this prototype only and don't change {sourceName[item.source]}.</p>
            </div>
          </Panel>

          {d.exposure && (
            <Panel>
              <SectionTitle tag="ai">Downstream Exposure</SectionTitle>
              <ul className="divide-y px-5 py-1 text-sm">
                {d.exposure.map((x) => (
                  <li key={x.label} className="py-2.5"><p className="font-medium">{x.label}</p><p className="text-xs text-muted-foreground">{x.detail}</p></li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}

function RelatedRow({ r }: { r: ResolvedItem }) {
  return (
    <li className="border-b last:border-0">
      <Link to="/items/$id" params={{ id: r.id }} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-muted/60">
        <SeverityBadge severity={r.severity} />
        <span className="flex-1 font-medium">{r.title}</span>
        <span className="text-xs text-muted-foreground">{r.sourceRef} · {r.displayStatus}</span>
        <ArrowUpRight className="h-4 w-4 text-primary" />
      </Link>
    </li>
  );
}
