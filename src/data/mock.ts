import type { Activity, BlockedPerson, Brief, Metric, Person, Source, Urgency, Severity, WorkItem, Workspace } from "@/lib/types";

export const workspaces: Workspace[] = [
  { id: "platform", name: "Platform Engineering" },
  { id: "payments", name: "Payments" },
  { id: "data", name: "Data Infrastructure" },
];

export const currentUser: Person = { id: "u0", name: "Priya Sharma", initials: "PS", role: "Director of Engineering" };

const p = (id: string, name: string, role: string): Person => ({
  id, name, role, initials: name.split(" ").map((w) => w[0]).join("").slice(0, 2),
});
export const people = {
  arjun: p("arjun", "Arjun Mehta", "Senior Frontend Eng"),
  neha: p("neha", "Neha Rao", "Backend Eng"),
  daniel: p("daniel", "Daniel Kim", "Database Eng"),
  sofia: p("sofia", "Sofia Chen", "QA Lead"),
  priyaS: p("priya-shah", "Priya Shah", "Technical Account Manager"),
};

export const sources: Source[] = [
  { id: "jira", name: "Jira", status: "connected", lastSync: "8m ago" },
  { id: "github", name: "GitHub", status: "connected", lastSync: "5m ago" },
  { id: "slack", name: "Slack", status: "connected", lastSync: "3m ago" },
  { id: "gmail", name: "Gmail", status: "syncing", lastSync: "12m ago" },
];

export const urgencySeverity: Record<Urgency, Severity> = {
  Critical: "critical", Blocker: "critical", High: "warning", Escalation: "warning", Medium: "info",
};

export const workItems: WorkItem[] = [
  {
    id: "gh-1428", rank: 1, title: "Production API fix awaiting review", source: "github", sourceRef: "GitHub PR #1428",
    owner: people.arjun, status: "Review pending", urgency: "Critical", severity: "critical", timing: "18h pending",
    team: "Platform", updatedAt: "1h ago", tags: ["review", "release"],
    summary: "Hotfix for auth token refresh on the public API is waiting on senior backend review.",
    rationale: "Waiting 18h for senior review; the v2.4.1 release depends on this patch and blocks auth smoke tests.",
  },
  {
    id: "pay-482", rank: 2, title: "Payment webhook retry issue", source: "jira", sourceRef: "Jira PAY-482",
    owner: people.neha, status: "In Progress", urgency: "High", severity: "warning", timing: "Overdue by 1d",
    team: "Payments", updatedAt: "25m ago", tags: ["overdue", "payments"],
    summary: "Failed webhook deliveries are not retried with backoff, causing dropped payment events.",
    rationale: "Overdue by a day; #payments-dev confirms checkout depends directly on this retry logic.",
  },
  {
    id: "slack-eng-db", rank: 3, title: "Database migration approval", source: "slack", sourceRef: "Slack #eng-db",
    owner: people.daniel, status: "Blocked", urgency: "Blocker", severity: "critical", timing: "Blocked 22h",
    team: "Data", updatedAt: "4h ago", tags: ["blocked", "migration"],
    summary: "Partition migration for the events table needs DBA sign-off before staging.",
    rationale: "Partition script passed dry run but still awaits central DBA approval before the staging rollout.",
  },
  {
    id: "plat-216", rank: 4, title: "Release regression tests outstanding", source: "jira", sourceRef: "Jira PLAT-216",
    owner: people.sofia, status: "In Progress", urgency: "Medium", severity: "info", timing: "Due in 2d",
    team: "QA", updatedAt: "3h ago", tags: ["release", "testing"],
    summary: "Core regression suite for the v2.4.1 release candidate is 42% complete.",
    rationale: "RC cut is in 48h and regression is only 42% done due to slow staging environments.",
  },
  {
    id: "gmail-webhook-escalation", rank: 5, title: "Customer escalation: webhook failures", source: "gmail", sourceRef: "Gmail thread",
    owner: people.priyaS, status: "Needs attention", urgency: "Escalation", severity: "warning", timing: "2h ago",
    team: "Customer Success", updatedAt: "2h ago", tags: ["customer", "webhooks"],
    summary: "Tier-1 enterprise account reports intermittent 504s on outbound webhooks.",
    rationale: "Tier-1 account sees 504 timeouts affecting invoice delivery; likely linked to PAY-482.",
  },
];

export const briefs: Brief[] = [
  {
    summary: "Today's release is at risk due to a pending production API review and a blocked database migration. Resolve the review dependency first, then confirm database approval before the staging rollout.",
    blockers: "PR #1428 (18h) and DB migration (22h)",
    changes: "PAY-482 in progress; 1 customer escalation",
    nextActions: "Unblock Arjun and verify the DBA script",
    evidence: ["GitHub PR #1428 · no reviewer activity for 18h", "Slack #eng-db · DBA approval requested yesterday 10:14", "Jira PAY-482 · due date passed 1d ago"],
  },
  {
    summary: "Payments reliability is the main customer-facing risk. The webhook retry fix (PAY-482) is overdue and a Tier-1 customer has escalated timeouts; pairing Neha with a reviewer today would close both.",
    blockers: "PAY-482 overdue and DB migration (22h)",
    changes: "Escalation email received; CI passed on partition script",
    nextActions: "Pair-review PAY-482 and reply to the customer",
    evidence: ["Gmail · Tier-1 escalation received 2h ago", "Slack #payments-dev · checkout depends on retry logic", "CI · partition script dry run passed 4h ago"],
  },
  {
    summary: "The v2.4.1 release candidate cut is in 48h. Regression coverage sits at 42% and two items block the critical path; consider moving the cut by one day if the DBA approval does not land by noon.",
    blockers: "Regression at 42% and DB approval pending",
    changes: "New reviewer pinged on PR #1428",
    nextActions: "Decide on RC cut timing by noon",
    evidence: ["Jira PLAT-216 · 42% of regression suite complete", "GitHub · @marcus-db requested on PR #1428", "Slack #eng-db · awaiting central DBA team"],
  },
];

export const metrics: Metric[] = [
  { label: "Priority Items", value: "5", delta: "2 critical", severity: "critical" },
  { label: "Active Blockers", value: "3", delta: "Longest 22h", severity: "warning" },
  { label: "Overdue Tickets", value: "1", delta: "PAY-482 · 1d", severity: "warning" },
  { label: "Stale Review", value: "1", delta: "PR #1428 · 18h", severity: "info" },
];

export const blockedPeople: BlockedPerson[] = [
  { person: people.arjun, duration: "18h blocked", waitingOn: "Code review from senior backend lead", ref: "#1428" },
  { person: people.neha, duration: "1d blocked", waitingOn: "DB schema verification and access token", ref: "PAY-482" },
  { person: people.sofia, duration: "6h blocked", waitingOn: "Staging cluster release deployment", ref: "PLAT-216" },
];

export const recentActivity: Activity[] = [
  { id: "a1", title: "PAY-482 moved to In Progress", detail: "Retry logic unblocked after PR #310 merged.", time: "25m ago", severity: "info" },
  { id: "a2", title: "Review requested", detail: "@marcus-db pinged on PR #1428.", time: "1h ago", severity: "warning" },
  { id: "a3", title: "Customer escalation", detail: "Tier-1 customer email about timeout errors.", time: "2h ago", severity: "critical" },
  { id: "a4", title: "CI tests passed", detail: "DB partition script passed dry run on test cluster.", time: "4h ago", severity: "success" },
];

export const getItem = (id: string) => workItems.find((i) => i.id === id);
export const lastUpdated = "8 min ago";
