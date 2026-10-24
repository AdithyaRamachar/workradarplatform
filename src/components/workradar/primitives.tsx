import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity, SourceHealth, WorkItem } from "@/lib/types";

export const severityStyles: Record<Severity, { label: string; cls: string; icon: LucideIcon }> = {
  critical: { label: "Critical", cls: "bg-critical-soft text-critical", icon: OctagonAlert },
  warning: { label: "Warning", cls: "bg-warning-soft text-warning", icon: AlertTriangle },
  success: { label: "Resolved", cls: "bg-success-soft text-success", icon: CheckCircle2 },
  info: { label: "Info", cls: "bg-info-soft text-info", icon: Info },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = severityStyles[severity];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>
      <s.icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}

const healthCls: Record<SourceHealth, string> = {
  connected: "bg-success",
  syncing: "bg-warning",
  error: "bg-critical",
};
export function StatusDot({ status }: { status: SourceHealth }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", healthCls[status])} aria-label={status} />;
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-lg border bg-card shadow-card", className)}>{children}</section>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-accent-foreground",
        size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

export function ItemRow({ item }: { item: WorkItem }) {
  return (
    <Link
      to="/items/$id"
      params={{ id: item.id }}
      className="flex items-start gap-4 border-b px-5 py-4 transition-colors last:border-0 hover:bg-muted/60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SeverityBadge severity={item.severity} />
          <span>#{item.rank}</span>·<span>{item.sourceRef}</span>·<span>{item.owner.name}</span>·<span>{item.status}</span>
        </div>
        <p className="mt-1.5 font-medium text-foreground">{item.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{item.summary}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 text-xs text-muted-foreground">
        <span>{item.updatedAt}</span>
        <Avatar initials={item.owner.initials} />
      </div>
    </Link>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
