import type { SourceKind } from "@/lib/types";

/** Extra indexed source records (not ranked priorities) that appear only in Search. */
export interface SourceRecord {
  id: string;
  source: SourceKind;
  ref: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  updatedAt: string;
  updatedMinutes: number;
}

export const sourceRecords: SourceRecord[] = [
  {
    id: "gh-310", source: "github", ref: "GitHub PR #310", status: "Merged", owner: "Neha Rao", updatedAt: "3h ago", updatedMinutes: 180,
    title: "Implement exponential backoff for failed webhook deliveries",
    description: "Fixes the retry loop causing high CPU on worker nodes during timeout spikes. Adds jitter to avoid a thundering herd on merchants.",
  },
  {
    id: "slack-payments-dev", source: "slack", ref: "Slack #payments-dev", status: "Active discussion", owner: "Marcus Vance", updatedAt: "1h ago", updatedMinutes: 60,
    title: "Discussion: downstream dependency on webhook retry deploy",
    description: "Checking on status for the checkout deploy milestone. Needs PR #310 merged before the 3 PM staging cutoff. 14 replies.",
  },
  {
    id: "jira-plat-201", source: "jira", ref: "Jira PLAT-201", status: "Done", owner: "Lena Ortiz", updatedAt: "2d ago", updatedMinutes: 2880,
    title: "Provision staging cluster capacity for release testing",
    description: "Added two worker nodes to the staging cluster ahead of the v2.4.1 regression run.",
  },
];
