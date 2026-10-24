import type { SourceKind } from "@/lib/types";

export interface Evidence {
  source: SourceKind;
  ref: string;
  time: string;
  /** Verbatim-style observation recorded from the source (mock). */
  observation: string;
}
export interface TimelineEvent {
  time: string;
  source: SourceKind | "workradar";
  text: string;
}
export interface ItemDetail {
  assessment: string;
  confidence: string;
  impactScore: number;
  dueDate: string;
  evidence: Evidence[];
  timeline: TimelineEvent[];
  related: string[];
  metadata: { label: string; value: string }[];
  exposure?: { label: string; detail: string }[];
}

export const itemDetails: Record<string, ItemDetail> = {
  "gh-1428": {
    assessment:
      "This PR is the last open change on the v2.4.1 release path. With no reviewer activity for 18h, it is the most likely cause of a release slip. Reassigning review to a backend lead would remove the bottleneck fastest.",
    confidence: "High", impactScore: 98, dueDate: "Today, 5:00 PM (release cut)",
    evidence: [
      { source: "github", ref: "PR #1428", time: "Yesterday 4:12 PM", observation: "Review requested from @backend-leads. 0 approvals, 0 comments." },
      { source: "github", ref: "PR #1428 checks", time: "Yesterday 4:30 PM", observation: "All 14 CI checks passed." },
      { source: "slack", ref: "#release-v2-4", time: "Today 8:05 AM", observation: "“Auth smoke tests are waiting on the API fix.” — Sofia Chen" },
    ],
    timeline: [
      { time: "Yesterday 3:58 PM", source: "github", text: "Arjun Mehta opened PR #1428" },
      { time: "Yesterday 4:12 PM", source: "github", text: "Review requested from @backend-leads" },
      { time: "Today 8:05 AM", source: "slack", text: "Release channel flagged dependency on this PR" },
      { time: "Today 9:40 AM", source: "github", text: "Marcus Vance added as reviewer" },
      { time: "Today 10:02 AM", source: "workradar", text: "Ranked #1 — release-blocking review older than 12h" },
    ],
    related: ["plat-216", "pay-482"],
    metadata: [
      { label: "Repository", value: "platform/public-api" }, { label: "Branch", value: "fix/token-refresh" },
      { label: "Changes", value: "+142 / −38 · 6 files" }, { label: "Milestone", value: "v2.4.1" },
    ],
    exposure: [
      { label: "Checkout service", detail: "Deploy paused pending this fix" },
      { label: "Accounts service", detail: "Auth smoke tests waiting" },
    ],
  },
  "pay-482": {
    assessment:
      "The retry fix is a day overdue and appears linked to the Tier-1 customer's webhook timeouts. Closing it likely resolves both the ticket and the escalation.",
    confidence: "Medium", impactScore: 86, dueDate: "Yesterday, 5:00 PM (overdue)",
    evidence: [
      { source: "jira", ref: "PAY-482", time: "Yesterday 5:00 PM", observation: "Due date passed. Status: In Progress." },
      { source: "slack", ref: "#payments-dev", time: "Today 9:15 AM", observation: "“Checkout integration tests time out without the retry change.” — Neha Rao" },
      { source: "gmail", ref: "Escalation thread", time: "Today 11:20 AM", observation: "Customer reports intermittent 504s on webhook delivery." },
    ],
    timeline: [
      { time: "Mon 10:00 AM", source: "jira", text: "PAY-482 created by Neha Rao" },
      { time: "Yesterday 5:00 PM", source: "jira", text: "Due date passed" },
      { time: "Today 9:15 AM", source: "slack", text: "Timeout discussion in #payments-dev" },
      { time: "Today 12:50 PM", source: "jira", text: "Moved from Backlog to In Progress" },
    ],
    related: ["gmail-webhook-escalation", "gh-1428"],
    metadata: [
      { label: "Project", value: "Payments (PAY)" }, { label: "Type", value: "Bug" },
      { label: "Sprint", value: "Sprint 42" }, { label: "Story points", value: "5" },
    ],
    exposure: [{ label: "Checkout service", detail: "Relies on webhook retry logic" }],
  },
  "slack-eng-db": {
    assessment:
      "The migration script is technically ready; the only blocker is a governance approval. A direct ping to the DBA on-call is the quickest unblock.",
    confidence: "High", impactScore: 81, dueDate: "Before staging rollout (Thu)",
    evidence: [
      { source: "slack", ref: "#eng-db", time: "Yesterday 10:14 AM", observation: "“Requesting DBA approval for events partition migration.” — Daniel Kim" },
      { source: "github", ref: "CI run #8812", time: "Today 9:30 AM", observation: "Partition script dry run passed on test cluster." },
    ],
    timeline: [
      { time: "Yesterday 10:14 AM", source: "slack", text: "Approval requested in #eng-db" },
      { time: "Today 9:30 AM", source: "github", text: "Dry run passed" },
      { time: "Today 10:00 AM", source: "slack", text: "Reminder sent to @dba-oncall" },
    ],
    related: ["plat-216"],
    metadata: [
      { label: "Channel", value: "#eng-db" }, { label: "Database", value: "events-primary" },
      { label: "Approver", value: "Central DBA team" },
    ],
    exposure: [{ label: "Staging rollout", detail: "Cannot start until migration runs" }],
  },
  "plat-216": {
    assessment:
      "Regression coverage is behind pace for the release cut in 48h. Staging latency, not test failures, is the main cause.",
    confidence: "Medium", impactScore: 64, dueDate: "In 2 days",
    evidence: [
      { source: "jira", ref: "PLAT-216", time: "Today 10:45 AM", observation: "Regression suite 42% complete (126 / 300 cases)." },
      { source: "slack", ref: "#qa-release", time: "Today 9:10 AM", observation: "“Staging environment is slow again.” — Sofia Chen" },
    ],
    timeline: [
      { time: "Mon 9:00 AM", source: "jira", text: "PLAT-216 created for v2.4.1 regression" },
      { time: "Today 9:10 AM", source: "slack", text: "Staging slowness reported" },
      { time: "Today 10:45 AM", source: "jira", text: "Progress updated to 42%" },
    ],
    related: ["gh-1428", "slack-eng-db"],
    metadata: [
      { label: "Project", value: "Platform (PLAT)" }, { label: "Type", value: "Task" }, { label: "Release", value: "v2.4.1" },
    ],
  },
  "gmail-webhook-escalation": {
    assessment:
      "A Tier-1 customer is affected. The symptoms match the open retry bug in PAY-482, so the reply can reference that fix's progress.",
    confidence: "Medium", impactScore: 72, dueDate: "Reply within 4h (SLA)",
    evidence: [
      { source: "gmail", ref: "Escalation thread", time: "Today 11:20 AM", observation: "“We see intermittent 504s on outbound webhooks affecting invoices.”" },
      { source: "gmail", ref: "Escalation thread", time: "Today 12:05 PM", observation: "Customer attached new 504 logs." },
    ],
    timeline: [
      { time: "Today 11:20 AM", source: "gmail", text: "Escalation email received" },
      { time: "Today 11:35 AM", source: "gmail", text: "Priya Shah acknowledged" },
      { time: "Today 12:05 PM", source: "gmail", text: "Customer replied with logs" },
    ],
    related: ["pay-482"],
    metadata: [
      { label: "Account tier", value: "Tier-1 Enterprise" }, { label: "Channel", value: "Email" }, { label: "SLA", value: "4h response" },
    ],
  },
};
