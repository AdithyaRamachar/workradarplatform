import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Clock, FileQuestion, FlaskConical, Loader2, PlugZap, RefreshCw, SearchX, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "critical";
const toneCls: Record<Tone, string> = {
  neutral: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  critical: "bg-critical-soft text-critical",
};

/** Badge marking a state as a prototype simulation, never a real outage. */
export function SimulatedTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <FlaskConical className="h-3 w-3" /> Simulated state
    </span>
  );
}

export function StateCard({
  icon: Icon, tone = "neutral", title, description, primary, secondary, simulated, children, className,
}: {
  icon: LucideIcon; tone?: Tone; title: string; description: string; primary: ReactNode; secondary?: ReactNode;
  simulated?: boolean; children?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      {simulated && <div className="mb-4"><SimulatedTag /></div>}
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-full", toneCls[tone])}><Icon className="h-6 w-6" /></span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{primary}{secondary}</div>
      {children && <div className="mt-5 w-full max-w-md text-left">{children}</div>}
    </div>
  );
}

/** Local-only retry: shows a spinner briefly, then a recovered message. Never contacts a service. */
function useSimulatedRetry(onDone?: () => void) {
  const [phase, setPhase] = useState<"idle" | "retrying" | "done">("idle");
  const retry = () => {
    setPhase("retrying");
    setTimeout(() => { setPhase("done"); onDone?.(); }, 1200);
  };
  return { phase, retry };
}

export function NewWorkspaceState({ onUseSample }: { onUseSample?: () => void }) {
  return (
    <StateCard
      icon={Sparkles}
      title="Your AI Daily Brief is getting ready"
      description="WorkRadar needs a little activity from your connected sources before it can write the first brief. You can explore with sample data meanwhile."
      primary={<Button onClick={onUseSample}>Explore with sample data</Button>}
    />
  );
}

export function AllCaughtUpState() {
  return (
    <StateCard
      icon={CheckCircle2}
      tone="success"
      title="You're all caught up"
      description="Nothing needs your attention right now. Snoozed and resolved items are in their own tabs."
      primary={<Button asChild variant="outline"><Link to="/">Go to Dashboard</Link></Button>}
    />
  );
}

export function NoSearchResultsState({ query, onClearSearch, onClearFilters }: { query?: string; onClearSearch: () => void; onClearFilters?: () => void }) {
  return (
    <StateCard
      icon={SearchX}
      title="No matching items found"
      description={query ? `Nothing matched “${query}”. Try a broader term or another source.` : "Try a broader term or another source."}
      primary={<Button onClick={onClearSearch}>Clear search</Button>}
      secondary={onClearFilters && <Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
    />
  );
}

export function SourceErrorState({ source = "Gmail", onRecovered }: { source?: string; onRecovered?: () => void }) {
  const { phase, retry } = useSimulatedRetry(onRecovered);
  const [open, setOpen] = useState(false);
  if (phase === "done")
    return (
      <StateCard icon={CheckCircle2} tone="success" simulated title={`${source} reconnected`} description="Simulated recovery complete. No real connection was attempted."
        primary={<Button variant="outline" onClick={() => location.reload()}>Reset demo</Button>} />
    );
  return (
    <StateCard
      icon={PlugZap}
      tone="critical"
      simulated
      title={`Couldn't sync ${source}`}
      description={`WorkRadar couldn't refresh ${source} on the last attempt. Other sources are unaffected.`}
      primary={<Button onClick={retry} disabled={phase === "retrying"}>{phase === "retrying" ? <Loader2 className="animate-spin" /> : <RefreshCw />} {phase === "retrying" ? "Retrying…" : "Retry"}</Button>}
    >
      <button onClick={() => setOpen((o) => !o)} className="mx-auto flex items-center gap-1 text-xs font-medium text-primary" aria-expanded={open}>
        Diagnostic details <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <dl className="mt-3 space-y-1 rounded-md bg-muted p-3 font-mono text-xs">
          <div><dt className="inline text-muted-foreground">source: </dt><dd className="inline">{source.toLowerCase()}</dd></div>
          <div><dt className="inline text-muted-foreground">code: </dt><dd className="inline">SIM_AUTH_EXPIRED (mock)</dd></div>
          <div><dt className="inline text-muted-foreground">last success: </dt><dd className="inline">12 min ago</dd></div>
          <div><dt className="inline text-muted-foreground">note: </dt><dd className="inline">Prototype simulation, no network call made</dd></div>
        </dl>
      )}
    </StateCard>
  );
}

export function ItemUnavailableState({ id }: { id?: string }) {
  return (
    <StateCard
      icon={FileQuestion}
      title="This item isn't available"
      description={id ? `We couldn't find an item with ID “${id}”. It may have been removed or the link may be incorrect.` : "The link may be incorrect or the item was removed."}
      primary={<Button asChild><Link to="/feed">Return to Priority Feed</Link></Button>}
    />
  );
}

export function StaleDataState({ onContinue }: { onContinue?: () => void }) {
  const { phase, retry } = useSimulatedRetry();
  return (
    <StateCard
      icon={Clock}
      tone="warning"
      simulated
      title={phase === "done" ? "Data refreshed" : "Some information may be out of date"}
      description={phase === "done" ? "Simulated refresh complete. Mock data timestamps were not changed." : "The mock source data hasn't been refreshed for over an hour. You can retry or keep working with what's available."}
      primary={<Button onClick={retry} disabled={phase !== "idle"}>{phase === "retrying" ? <Loader2 className="animate-spin" /> : <RefreshCw />} {phase === "retrying" ? "Retrying…" : "Retry"}</Button>}
      secondary={<Button variant="outline" onClick={onContinue}>Continue with available data</Button>}
    />
  );
}
