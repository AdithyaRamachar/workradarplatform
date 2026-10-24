import type { Metric, Person, Source, WorkItem, Workspace } from "@/lib/types";

export const workspaces: Workspace[] = [
  { id: "platform", name: "Platform Engineering" },
  { id: "mobile", name: "Mobile Apps" },
  { id: "data", name: "Data Infrastructure" },
] as const satisfies readonly Person[];

export const currentUser: Person = { id: "u0", name: "Priya Nair", initials: "PN", role: "Engineering Manager" };

const people = [
  { id: "u1", name: "Marcus Lee", initials: "ML", role: "Senior Engineer" },
  { id: "u2", name: "Sofia Alvarez", initials: "SA", role: "Staff Engineer" },
  { id: "u3", name: "Dev Patel", initials: "DP", role: "Engineer II" },
] as const satisfies readonly Person[];

export const sources: Source[] = [
  { id: "github", name: "GitHub", status: "connected" },
  { id: "jira", name: "Jira", status: "syncing" },
  { id: "slack", name: "Slack", status: "connected" },
  { id: "pagerduty", name: "PagerDuty", status: "error" },
] as const satisfies readonly Person[];

export const metrics: Metric[] = [
  { label: "Critical items", value: "3", delta: "+1 since yesterday", severity: "critical" },
  { label: "Blocked PRs", value: "7", delta: "-2 this week", severity: "warning" },
  { label: "Sprint progress", value: "68%", delta: "On track", severity: "success" },
  { label: "Open incidents", value: "1", delta: "P2 · 3h open", severity: "info" },
] as const satisfies readonly Person[];

export const workItems: WorkItem[] = [
  {
    id: "WR-101",
    title: "Payments API latency regression after v2.14 deploy",
    summary: "p95 latency up 340ms on /checkout since last night's release.",
    severity: "critical",
    source: "pagerduty",
    team: "Payments",
    owner: people[0],
    updatedAt: "12 min ago",
    tags: ["incident", "release"],
    aiInsight: "Correlates with PR #4821 introducing a synchronous fraud check. Consider rollback or feature flag.",
  },
  {
    id: "WR-102",
    title: "Auth service migration PR blocked on review for 4 days",
    summary: "PR #4790 has 2 pending reviewers and failing integration tests.",
    severity: "warning",
    source: "github",
    team: "Identity",
    owner: people[1],
    updatedAt: "1 h ago",
    tags: ["review", "blocked"],
    aiInsight: "Sofia is the only approver with context; reassigning one review could unblock Thursday's milestone.",
  },
  {
    id: "WR-103",
    title: "Sprint 42 scope creep: 9 tickets added mid-sprint",
    summary: "Velocity forecast dropped from 48 to 39 points.",
    severity: "warning",
    source: "jira",
    team: "Platform",
    owner: people[2],
    updatedAt: "3 h ago",
    tags: ["planning"],
    aiInsight: "Five of the added tickets are low priority and could move to Sprint 43.",
  },
  {
    id: "WR-104",
    title: "Team raised concern about on-call load in #eng-platform",
    summary: "Three engineers mentioned burnout in the last week.",
    severity: "info",
    source: "slack",
    team: "Platform",
    owner: people[0],
    updatedAt: "Yesterday",
    tags: ["team-health"],
    aiInsight: "On-call pages up 2.3x month over month. Worth discussing in your next 1:1s.",
  },
  {
    id: "WR-105",
    title: "Search indexing pipeline shipped to production",
    summary: "Rollout completed with zero errors across all regions.",
    severity: "success",
    source: "github",
    team: "Data",
    owner: people[1],
    updatedAt: "Yesterday",
    tags: ["release"],
    aiInsight: "Good candidate for a team shout-out in Friday's update.",
  },
] as const satisfies readonly Person[];

export const getItem = (id: string) => workItems.find((i) => i.id === id);
export const lastUpdated = "2 min ago";
