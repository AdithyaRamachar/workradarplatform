import type { SourceKind } from "@/lib/types";

export const sourceLabels: Record<SourceKind, string> = { jira: "Jira", github: "GitHub", slack: "Slack", gmail: "Email" };

export interface Searchable {
  id: string;
  title: string;
  description: string;
  owner: string;
  ref: string;
  source: SourceKind;
}

/** Relevance: title/ID/ref hits weigh most, then owner and source, then description. 0 = no match. */
export function scoreMatch(r: Searchable, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (r.title.toLowerCase().includes(t)) s += 5;
    if (r.id.toLowerCase().includes(t) || r.ref.toLowerCase().includes(t)) s += 4;
    if (r.owner.toLowerCase().includes(t)) s += 3;
    if (r.source.includes(t) || sourceLabels[r.source].toLowerCase().includes(t) || (r.source === "gmail" && "gmail".includes(t))) s += 2;
    if (r.description.toLowerCase().includes(t)) s += 1;
    if (s === 0) return 0; // every term must match somewhere
    total += s;
  }
  return total;
}

/** Split text into parts, flagging those that match any query term (case-insensitive). */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const terms = query.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return [{ text, match: false }];
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  const exact = new RegExp(`^(${terms.join("|")})$`, "i");
  return text.split(re).filter(Boolean).map((p) => ({ text: p, match: exact.test(p) }));
}
