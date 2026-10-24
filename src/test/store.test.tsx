import { describe, expect, it } from "vitest";
import { resolveItem, snoozeUntil } from "@/lib/store";
import { workItems } from "@/data/mock";

const from = new Date(2026, 9, 24, 14, 30);

describe("snooze", () => {
  it("1 hour returns one hour later", () => {
    expect(snoozeUntil("1h", from)).toBe(new Date(2026, 9, 24, 15, 30).getTime());
  });
  it("4 hours returns four hours later", () => {
    expect(snoozeUntil("4h", from)).toBe(new Date(2026, 9, 24, 18, 30).getTime());
  });
  it("until tomorrow returns 9:00 AM next day", () => {
    expect(snoozeUntil("tomorrow", from)).toBe(new Date(2026, 9, 25, 9, 0).getTime());
  });
  it("snoozed items leave the active feed until they wake up", () => {
    const item = workItems[0]!;
    expect(resolveItem(item, { snoozedUntil: 2000 }, 1000).snoozed).toBe(true);
    expect(resolveItem(item, { snoozedUntil: 2000 }, 3000).snoozed).toBe(false);
  });
});

describe("mark done", () => {
  it("shows Resolved status", () => {
    expect(resolveItem(workItems[0]!, { done: true }).displayStatus).toBe("Resolved");
  });
});
