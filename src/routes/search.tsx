import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, ExternalLink, History, Search as SearchIcon, SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { useWorkStore } from "@/lib/store";
import { sourceRecords } from "@/data/searchRecords";
import { highlightParts, scoreMatch, sourceLabels, type Searchable } from "@/lib/search";
import type { Severity, SourceKind } from "@/lib/types";
import { Avatar, EmptyState, PageHeader, Panel, SeverityBadge } from "@/components/workradar/primitives";
import { sourceIcon } from "@/components/workradar/PriorityCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s['q'] === "string" && s['q'] ? { q: s['q'] } : {}),
  head: () => ({
    meta: [
      { title: "Search · WorkRadar" },
      { name: "description", content: "Search Jira, GitHub, Slack and email records indexed by WorkRadar." },
      { property: "og:title", content: "Search · WorkRadar" },
      { property: "og:description", content: "Search Jira, GitHub, Slack and email records indexed by WorkRadar." },
    ],
  }),
  component: SearchPage,
});

const RECENT_KEY = "workradar:recent-searches:v1";
const suggestions = ["webhook", "PAY-482", "Arjun", "migration"];

interface Result extends Searchable {
  status: string;
  updatedAt: string;
  updatedMinutes: number;
  itemId?: string;
  severity?: Severity;
  initials: string;
}

function Hl({ text, q }: { text: string; q: string }) {
  return <>{highlightParts(text, q).map((p, i) => (p.match ? <mark key={i} className="rounded-sm bg-warning-soft text-foreground">{p.text}</mark> : <span key={i}>{p.text}</span>))}</>;
}

function SearchPage() {
  const { q: urlQ = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { items } = useWorkStore();
  const [q, setQ] = useState(urlQ);
  const [source, setSource] = useState<SourceKind | "all">("all");
  const [sort, setSort] = useState<"relevance" | "recent">("relevance");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQ(urlQ), [urlQ]);
  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")); } catch { /* ignore */ }
  }, []);

  const saveRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const clearRecent = () => { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ } };

  const commit = (term: string) => { setQ(term); saveRecent(term); navigate({ search: term.trim() ? { q: term.trim() } : {}, replace: true }); };
  const clearSearch = () => { setQ(""); navigate({ search: {}, replace: true }); inputRef.current?.focus(); };

  const index: Result[] = useMemo(
    () => [
      ...items.map((i) => ({
        id: i.id, itemId: i.id, title: i.title, description: i.summary, owner: i.assignee.name, initials: i.assignee.initials,
        ref: i.sourceRef, source: i.source, status: i.displayStatus, updatedAt: i.updatedAt, updatedMinutes: i.updatedMinutes, severity: i.severity,
      })),
      ...sourceRecords.map((r) => ({
        ...r, initials: r.owner.split(" ").map((w) => w[0]).join(""),
      })),
    ],
    [items],
  );

  const term = q.trim();
  const matched = useMemo(() => index.map((r) => ({ r, s: scoreMatch(r, term) })).filter((x) => x.s > 0), [index, term]);
  const counts = (Object.keys(sourceLabels) as SourceKind[]).reduce((acc, k) => ({ ...acc, [k]: matched.filter((m) => m.r.source === k).length }), {} as Record<SourceKind, number>);
  const results = matched
    .filter((m) => source === "all" || m.r.source === source)
    .sort((a, b) => (sort === "relevance" ? b.s - a.s || a.r.updatedMinutes - b.r.updatedMinutes : a.r.updatedMinutes - b.r.updatedMinutes))
    .map((m) => m.r);
  const sourcesHit = new Set(results.map((r) => r.source)).size;

  return (
    <>
      <PageHeader title="Search" description="Search across Jira, GitHub, Slack and email in Platform Engineering · Index sync 8m ago" />

      <form onSubmit={(e) => { e.preventDefault(); commit(q); }} className="relative mb-4">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => saveRecent(q)}
          onKeyDown={(e) => { if (e.key === "Escape") clearSearch(); }}
          placeholder="Search titles, IDs, owners, sources…"
          aria-label="Search work items"
          className="h-14 w-full rounded-lg border bg-surface pl-12 pr-28 text-base shadow-card outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
        />
        {q && (
          <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted" aria-label="Clear search">
            <X className="h-4 w-4" /> <span className="hidden sm:inline">ESC to clear</span>
          </button>
        )}
      </form>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", ...Object.keys(sourceLabels)] as (SourceKind | "all")[]).map((s) => {
          const Icon = s === "all" ? null : sourceIcon[s];
          const n = s === "all" ? matched.length : counts[s];
          return (
            <button
              key={s}
              onClick={() => setSource(s)}
              aria-pressed={source === s}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                source === s ? "border-primary bg-primary text-primary-foreground" : "bg-surface hover:bg-muted",
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {s === "all" ? "All Sources" : sourceLabels[s]}
              {term && <span className={cn("rounded-full px-1.5 text-xs", source === s ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>{n}</span>}
            </button>
          );
        })}
        {source !== "all" && <Button size="sm" variant="ghost" className="text-primary" onClick={() => setSource("all")}>Clear filters</Button>}
      </div>

      {!term ? (
        <Panel>
          <EmptyState icon={SearchIcon} title="Search your engineering signals" description="Find PRs, tickets, threads and customer emails by title, ID, owner or source." />
          <div className="grid gap-6 border-t px-6 py-5 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><History className="h-3.5 w-3.5" /> Recent searches</p>
                {recent.length > 0 && <button onClick={clearRecent} className="text-xs text-primary hover:underline">Clear</button>}
              </div>
              {recent.length ? (
                <ul className="flex flex-wrap gap-2">
                  {recent.map((r) => <li key={r}><button onClick={() => commit(r)} className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-primary-soft">{r}</button></li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No recent searches yet.</p>}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((s) => <li key={s}><button onClick={() => commit(s)} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">{s}</button></li>)}
              </ul>
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-foreground">{results.length}</span> matching {results.length === 1 ? "item" : "items"} across {sourcesHit} {sourcesHit === 1 ? "source" : "sources"} for <span className="font-semibold text-foreground">“{term}”</span>
            </p>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-9 w-auto bg-surface text-sm" aria-label="Sort results">
                <span className="mr-1 text-muted-foreground">Sort:</span><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="recent">Most recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Panel>
            {results.length ? results.map((r) => <ResultRow key={r.id} r={r} q={term} />) : (
              <EmptyState
                icon={SearchX}
                title="No results found"
                description={`Nothing matched “${term}”${source !== "all" ? ` in ${sourceLabels[source]}` : ""}. Try a broader term or another source.`}
                action={
                  <div className="flex gap-2">
                    {source !== "all" && <Button variant="outline" onClick={() => setSource("all")}>Clear filters</Button>}
                    <Button variant="outline" onClick={clearSearch}>Clear search</Button>
                  </div>
                }
              />
            )}
          </Panel>
        </>
      )}
    </>
  );
}

function ResultRow({ r, q }: { r: Result; q: string }) {
  const Icon = sourceIcon[r.source];
  return (
    <article className="border-b px-5 py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-foreground"><Icon className="h-3.5 w-3.5" /> <Hl text={r.ref} q={q} /></span>
        <span className="rounded bg-muted px-1.5 py-0.5">{r.status}</span>
        {r.severity && <SeverityBadge severity={r.severity} />}
        {!r.itemId && <span className="rounded border px-1.5 py-0.5">Source record</span>}
      </div>
      <h3 className="mt-1.5 font-semibold"><Hl text={r.title} q={q} /></h3>
      <p className="mt-0.5 text-sm text-muted-foreground"><Hl text={r.description} q={q} /></p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Avatar initials={r.initials} /><Hl text={r.owner} q={q} /></span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Updated {r.updatedAt}</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" className="text-primary" onClick={() => toast(`Prototype only — would open ${r.ref} in ${sourceLabels[r.source]}`)}>
            Open in {sourceLabels[r.source]} <ExternalLink />
          </Button>
          {r.itemId && (
            <Button size="sm" variant="outline" asChild>
              <Link to="/items/$id" params={{ id: r.itemId }}>Inspect Item Details <ArrowRight /></Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
