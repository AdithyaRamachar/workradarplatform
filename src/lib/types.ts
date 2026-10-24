export type Severity = "critical" | "warning" | "success" | "info";
export type SourceKind = "github" | "jira" | "slack" | "pagerduty";
export type SourceHealth = "connected" | "syncing" | "error";

export interface Source {
  id: SourceKind;
  name: string;
  status: SourceHealth;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface WorkItem {
  id: string;
  title: string;
  summary: string;
  severity: Severity;
  source: SourceKind;
  team: string;
  owner: Person;
  updatedAt: string;
  tags: string[];
  aiInsight: string;
}

export interface Metric {
  label: string;
  value: string;
  delta: string;
  severity: Severity;
}

export interface Workspace {
  id: string;
  name: string;
}
