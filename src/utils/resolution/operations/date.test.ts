import { DateSyntax } from "@/common/variableSyntax";
import { runbook } from "@/test";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const book = runbook({ TEXT: "ignored" });

describe("date", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 31, 9, 5, 3));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it.each([
    ["{|date}", "2026-07-31"],
    ["{|date()}", "2026-07-31"],
    [`{|date(${DateSyntax.DEFAULT_FORMAT})}`, "2026-07-31"],
    ["{|date(YYYYMMDD-HHmmss)}", "20260731-090503"],
    ["{|date(YY)}", "26"],
    ["{|date(DD/MM/YYYY)}", "31/07/2026"],
    ["{|date(on YYYY at HH)}", "on 2026 at 09"],
    ["{|date(YYYY)}", "2026"],
    ["{TEXT|date(YYYY)}", "2026"],
  ])("%s -> %s", (command, expected) => {
    expect(book.resolve(command)).toBe(expected);
  });

  it("is matched exactly", () => {
    expect(book.resolve("{|DATE()}")).toBe("{|DATE()}");
    expect(book.hasUnresolved("{|DATE()}")).toBe(true);
  });
});
