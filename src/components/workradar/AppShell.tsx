import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, LayoutDashboard, ListOrdered, Radar, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { currentUser, lastUpdated, sources, workspaces } from "@/data/mock";
import { Avatar, StatusDot } from "./primitives";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/feed", label: "Priority Feed", icon: ListOrdered },
  { to: "/search", label: "Search", icon: Search },
  { to: "/states", label: "States", icon: ShieldAlert },
] as const;

const crumbs: Record<string, string> = { "/": "Dashboard", "/feed": "Priority Feed", "/search": "Search", "/states": "System States" };

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ws, setWs] = useState(workspaces[0]!);
  const navigate = useNavigate();
  const crumb = crumbs[path] ?? (path.startsWith("/items") ? "Item details" : "");

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Radar className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">WorkRadar</span>
        </div>

        <div className="px-3 pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted">
              <span>
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">Workspace</span>
                <span className="font-medium">{ws.name}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {workspaces.map((w) => (
                <DropdownMenuItem key={w.id} onClick={() => setWs(w)}>{w.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-muted",
                )}
              >
                {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />}
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sources</p>
          <ul className="mt-3 space-y-2.5">
            {sources.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className="flex items-center gap-2 text-xs capitalize text-muted-foreground">
                  {s.status}
                  <StatusDot status={s.status} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t px-5 py-4">
          <Avatar initials={currentUser.initials} size="md" />
          <div className="text-sm leading-tight">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.role}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-6 border-b bg-surface px-6 lg:px-8">
          <div className="hidden text-sm sm:block">
            <span className="text-muted-foreground">{ws.name}</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="font-medium">{crumb}</span>
          </div>
          <div className="relative ml-auto w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Global search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = e.currentTarget.value.trim();
                  navigate({ to: "/search", search: v ? { q: v } : {} });
                  e.currentTarget.value = "";
                }
              }}
              placeholder="Search PRs, tickets, threads…"
              className="h-9 w-full rounded-md border bg-muted pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-surface"
            />
          </div>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
            <RefreshCw className="h-3.5 w-3.5" /> Updated {lastUpdated}
          </span>
          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-critical" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Profile menu"><Avatar initials={currentUser.initials} size="md" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
