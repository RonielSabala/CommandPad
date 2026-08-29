import { ReferenceConfig } from "@/common/config";
import type { ResolvedSpan } from "@/common/types";
import { runbook } from "@/test";
import { describe, expect, it } from "vitest";

function spans(
  book: ReturnType<typeof runbook>,
  command: string,
): ResolvedSpan[] {
  return book.segments(command).flatMap((segment) => segment.spans ?? []);
}

describe("nesting depth", () => {
  const book = runbook({
    NAME: "api",
    SERVICE: "svc-{NAME}",
    HOST: "{SERVICE}.example.com",
    DEEP: "a-{HOST}-z",
    GREETING: "Hi {;name=Sam}",
    LOUD: "{NAME|uppercase}",
    ROUTE: "my/{;route}/path {NAME}",
  });

  it("puts a variable's own value at the first level", () => {
    expect(spans(book, "{NAME}")).toEqual([{ text: "api", depth: 1 }]);
  });

  it("puts a reference inside that value one level deeper", () => {
    expect(spans(book, "{SERVICE}")).toEqual([
      { text: "svc-", depth: 1 },
      { text: "api", depth: 2 },
    ]);
  });

  it("keeps counting through a third level", () => {
    expect(spans(book, "{HOST}")).toEqual([
      { text: "svc-", depth: 2 },
      { text: "api", depth: 3 },
      { text: ".example.com", depth: 1 },
    ]);
  });

  it("clamps past the deepest level the palette colors", () => {
    const deepest = Math.max(
      ...spans(book, "{DEEP}").map((span) => span.depth),
    );
    expect(deepest).toBe(ReferenceConfig.MAX_NESTING_DEPTH);
  });

  it("joins the neighbours the clamp lands on one level", () => {
    expect(spans(book, "{DEEP}")).toEqual([
      { text: "a-", depth: 1 },
      { text: "svc-api", depth: 3 },
      { text: ".example.com", depth: 2 },
      { text: "-z", depth: 1 },
    ]);
  });

  it("sits the text that filled a blank one level under the template", () => {
    expect(spans(book, "{GREETING;name=Ada}")).toEqual([
      { text: "Hi ", depth: 1 },
      { text: "Ada", depth: 2 },
    ]);
  });

  it("keeps the levels around a filled blank", () => {
    expect(spans(book, "{ROUTE;route=fav}")).toEqual([
      { text: "my/", depth: 1 },
      { text: "fav", depth: 2 },
      { text: "/path ", depth: 1 },
      { text: "api", depth: 2 },
    ]);
  });

  it("flattens a reference an operation transformed", () => {
    expect(spans(book, "{SERVICE|uppercase}")).toEqual([
      { text: "SVC-API", depth: 1 },
    ]);
  });

  it("keeps the level a transformed nested reference sits at", () => {
    expect(spans(book, "{LOUD}")).toEqual([{ text: "API", depth: 2 }]);
  });

  it("gives an unresolved reference no spans", () => {
    expect(spans(book, "{MISSING}")).toEqual([]);
  });
});
