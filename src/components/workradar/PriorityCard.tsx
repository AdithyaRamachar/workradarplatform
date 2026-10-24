import { Link } from "@tanstack/react-router";
import { Check, Clock, Github, Mail, MessageSquare, SquareKanban, UserPlus, BellOff, ArrowUpRight, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { SourceKind, WorkItem } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, severityStyles } from "./primitives";
import { cn } from "@/lib/utils";

export const sourceIcon: Record<SourceKind, LucideIcon> = { github: Github, jira: SquareKanban, slack: MessageSquare, gmail: Mail };

export type ItemState = { done?: boolean; snoozed?: string; assignee?: string };

export function PriorityCard({ item, state, onChange }: { item: WorkItem; state: ItemState; onChange: (s: ItemState) => void }) {
  const SIcon = sourceIcon[item.source];
  const sev = severityStyles[item.severity];
  return (
    <article className={cn("border-b px-5 py-4 last:border-0", state.done && "opacity-55")}>
      <div className="flex items-start gap-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{item.rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", sev.cls)}>{item.urgency}</span>
            <h3 className={cn("font-semibold", state.done && "line-through")}>{item.title}</h3>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><SIcon className="h-3.5 w-3.5" />{item.sourceRef}</span>·
            <span className="inline-flex items-center gap-1.5"><Avatar initials={item.owner.initials} />{state.assignee ?? item.owner.name}</span>·
            <span>Status: <span className="font-medium text-foreground">{state.done ? "Done" : item.status}</span></span>·
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{state.snoozed ? `Snoozed ${state.snoozed}` : item.timing}</span>
          </div>
          <p className="mt-2.5 rounded-md bg-muted px-3 py-2 text-sm">
            <span className="font-medium">Why this matters: </span>
            <span className="text-muted-foreground">{item.rationale}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><UserPlus /> Assign</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                {["Marcus Lee", "Sofia Chen", "Daniel Kim"].map((n) => (
                  <DropdownMenuItem key={n} onClick={() => { onChange({ ...state, assignee: n }); toast.success(`Assigned to ${n}`); }}>{n}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><BellOff /> Snooze</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                {["for 1 hour", "until tomorrow", "for 1 week"].map((d) => (
                  <DropdownMenuItem key={d} onClick={() => { onChange({ ...state, snoozed: d }); toast(`Snoozed ${d}`); }}>{d}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" onClick={() => { onChange({ ...state, done: !state.done }); toast.success(state.done ? "Reopened" : "Marked done"); }}>
              <Check /> {state.done ? "Undo" : "Mark Done"}
            </Button>
            <Button size="sm" variant="ghost" asChild className="ml-auto text-primary">
              <Link to="/items/$id" params={{ id: item.id }}>View Details <ArrowUpRight /></Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
