import { describe, expect, it } from "vitest";
import { highlightParts, scoreMatch } from "@/lib/search";

const rec = { id: "pay-482", title: "Payment webhook retry issue", description: "Dropped events", owner: "Neha Rao", ref: "Jira PAY-482", source: "jira" as const };

describe("search", () => {
  it("matches by owner", () => expect(scoreMatch(rec, "neha")).toBeGreaterThan(0));
  it("matches by ID", () => expect(scoreMatch(rec, "PAY-482")).toBeGreaterThan(0));
  it("matches by source name", () => expect(scoreMatch(rec, "jira")).toBeGreaterThan(0));
  it("title hits outrank description hits", () => expect(scoreMatch(rec, "webhook")).toBeGreaterThan(scoreMatch(rec, "dropped")));
  it("returns no match when a term is missing", () => expect(scoreMatch(rec, "webhook github")).toBe(0));
  it("highlights matches case-insensitively", () =>
    expect(highlightParts("Payment Webhook", "webhook").filter((p) => p.match).map((p) => p.text)).toEqual(["Webhook"]));
});
