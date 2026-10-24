export type Severity = "critical" | "warning" | "success" | "info";
export type SourceKind = "github" | "jira" | "slack" | "gmail";
export type SourceHealth = "connected" | "syncing" | "error";
export type Urgency = "Critical" | "High" | "Blocker" | "Medium" | "Escalation";

export interface Source {
  id: SourceKind;
  name: string;
  status: SourceHealth;
  lastSync: string;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface WorkItem {
  id: string;
  rank: number;
  title: string;
  summary: string;
  rationale: string;
  source: SourceKind;
  sourceRef: string;
  status: string;
  urgency: Urgency;
  severity: Severity;
  timing: string;
  team: string;
  owner: Person;
  updatedAt: string;
  tags: string[];
}

export interface Metric {
  label: string;
  value: string;
  delta: string;
  severity: Severity;
}

export interface Brief {
  summary: string;
  blockers: string;
  changes: string;
  nextActions: string;
  evidence: string[];
}

export interface BlockedPerson {
  person: Person;
  duration: string;
  waitingOn: string;
  ref: string;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  time: string;
  severity: Severity;
}

export interface Workspace {
  id: string;
  name: string;
}
