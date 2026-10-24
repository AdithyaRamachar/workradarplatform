import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity, ArrowUpRight, BellOff, Check, Clock, ExternalLink, Github, Mail, MessageSquare, SquareKanban,
  ThumbsDown, ThumbsUp, Undo2, UserPlus, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { SourceKind } from "@/lib/types";
import { fmtTime, snoozeUntil, useWorkStore, type ResolvedItem } from "@/lib/store";
import { team } from "@/data/mock";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Avatar, severityStyles } from "./primitives";
import { cn } from "@/lib/utils";

export const sourceIcon: Record<SourceKind, LucideIcon> = { github: Github, jira: SquareKanban, slack: MessageSquare, gmail: Mail };
export const sourceName: Record<SourceKind, string> = { github: "GitHub", jira: "Jira", slack: "Slack", gmail: "Gmail" };

export function AssignPicker({ item }: { item: ResolvedItem }) {
  const { assign } = useWorkStore();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" disabled={item.done}><UserPlus /> Assign</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search team members…" />
          <CommandList>
            <CommandEmpty>No one found.</CommandEmpty>
            <CommandGroup heading="Assign engineer">
              {team.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.role}`}
                  onSelect={() => {
                    const prev = item.assignee.id;
                    assign(item.id, p.id);
                    setOpen(false);
                    toast.success(`${item.title} assigned to ${p.name}`, {
                      action: { label: "Undo", onClick: () => assign(item.id, prev) },
                    });
                  }}
                >
                  <Avatar initials={p.initials} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.role}</span>
                  </span>
                  {p.id === item.assignee.id && <Check className="h-4 w-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const snoozeOptions = [
  { key: "1h", label: "1 hour" },
  { key: "4h", label: "4 hours" },
  { key: "tomorrow", label: "Until tomorrow" },
] as const;

export function SnoozeMenu({ item }: { item: ResolvedItem }) {
  const { snooze, unsnooze } = useWorkStore();
  if (item.snoozed)
    return (
      <Button size="sm" variant="outline" onClick={() => { unsnooze(item.id); toast("Unsnoozed — back in the active feed"); }}>
        <Undo2 /> Unsnooze
      </Button>
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={item.done}><BellOff /> Snooze</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {snoozeOptions.map((o) => {
          return (
            <DropdownMenuItem
              key={o.key}
              onClick={() => {
                const until = snoozeUntil(o.key, new Date());
                snooze(item.id, until, o.label);
                toast(`Snoozed ${o.label.toLowerCase()} · returns ${fmtTime(until)}`, {
                  action: { label: "Undo", onClick: () => unsnooze(item.id) },
                });
              }}
            >
              {o.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DoneButton({ item }: { item: ResolvedItem }) {
  const { setDone } = useWorkStore();
  if (item.done)
    return <Button size="sm" variant="outline" onClick={() => setDone(item.id, false)}><Undo2 /> Reopen</Button>;
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setDone(item.id, true);
        toast.success(`Resolved: ${item.title}`, { action: { label: "Undo", onClick: () => setDone(item.id, false) } });
      }}
    >
      <Check /> Mark Done
    </Button>
  );
}

export function Feedback({ item }: { item: ResolvedItem }) {
  const { setFeedback } = useWorkStore();
  const v = item.feedback;
  const give = (x: "up" | "down") => {
    const next = v === x ? undefined : x;
    setFeedback(item.id, next);
    if (next) toast("Thanks — feedback saved locally to tune this prototype's ranking");
  };
  return (
    <div className="flex">
      <Button size="icon" variant="ghost" aria-label="Ranking is right" aria-pressed={v === "up"} className={cn(v === "up" && "text-primary")} onClick={() => give("up")}><ThumbsUp /></Button>
      <Button size="icon" variant="ghost" aria-label="Ranking is wrong" aria-pressed={v === "down"} className={cn(v === "down" && "text-critical")} onClick={() => give("down")}><ThumbsDown /></Button>
    </div>
  );
}

export function PriorityCard({ item, showLatest = true }: { item: ResolvedItem; showLatest?: boolean }) {
  const SIcon = sourceIcon[item.source];
  const sev = severityStyles[item.severity];
  return (
    <article className={cn("border-b px-5 py-4 last:border-0", (item.done || item.snoozed) && "bg-muted/40")}>
      <div className="flex items-start gap-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{item.rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", sev.cls)}>{item.urgency}</span>
            <h3 className={cn("font-semibold", item.done && "text-muted-foreground line-through")}>{item.title}</h3>
            <button
              type="button"
              onClick={() => toast(`Prototype only — would open ${item.sourceRef} in ${sourceName[item.source]}`)}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {sourceName[item.source]} <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><SIcon className="h-3.5 w-3.5" />{item.sourceRef}</span>·
            <span className="inline-flex items-center gap-1.5"><Avatar initials={item.assignee.initials} />{item.assignee.name}</span>·
            <span>Status: <span className={cn("font-medium text-foreground", item.done && "text-success")}>{item.displayStatus}</span></span>·
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {item.snoozed && item.snoozedUntil ? `Snoozed ${item.snoozeLabel?.toLowerCase()} · returns ${fmtTime(item.snoozedUntil)}` : item.timing}
            </span>
          </div>
          {showLatest && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Latest: {item.latest}
            </p>
          )}
          <p className="mt-2.5 rounded-md bg-muted px-3 py-2 text-sm">
            <span className="font-medium">Why this matters: </span>
            <span className="text-muted-foreground">{item.rationale}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AssignPicker item={item} />
            <SnoozeMenu item={item} />
            <DoneButton item={item} />
            <Feedback item={item} />
            <Button size="sm" variant="ghost" asChild className="ml-auto text-primary">
              <Link to="/items/$id" params={{ id: item.id }}>View Details <ArrowUpRight /></Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
