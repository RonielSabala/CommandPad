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
    expect(spans(book, "{NAME}")).toEqual([
      { text: "api", depth: 1, source: "NAME" },
    ]);
  });

  it("puts a reference inside that value one level deeper", () => {
    expect(spans(book, "{SERVICE}")).toEqual([
      { text: "svc-", depth: 1, source: "SERVICE" },
      { text: "api", depth: 2, source: "NAME" },
    ]);
  });

  it("keeps counting through a third level", () => {
    expect(spans(book, "{HOST}")).toEqual([
      { text: "svc-", depth: 2, source: "SERVICE" },
      { text: "api", depth: 3, source: "NAME" },
      { text: ".example.com", depth: 1, source: "HOST" },
    ]);
  });

  it("clamps past the deepest level the palette colors", () => {
    const deepest = Math.max(
      ...spans(book, "{DEEP}").map((span) => span.depth),
    );
    expect(deepest).toBe(ReferenceConfig.MAX_NESTING_DEPTH);
  });

  it("keeps the neighbours the clamp lands on one level apart by source", () => {
    expect(spans(book, "{DEEP}")).toEqual([
      { text: "a-", depth: 1, source: "DEEP" },
      { text: "svc-", depth: 3, source: "SERVICE" },
      { text: "api", depth: 3, source: "NAME" },
      { text: ".example.com", depth: 2, source: "HOST" },
      { text: "-z", depth: 1, source: "DEEP" },
    ]);
  });

  it("sits the text that filled a blank one level under the template", () => {
    expect(spans(book, "{GREETING;name=Ada}")).toEqual([
      { text: "Hi ", depth: 1, source: "GREETING" },
      { text: "Ada", depth: 2, source: "GREETING;name" },
    ]);
  });

  it("keeps the levels around a filled blank", () => {
    expect(spans(book, "{ROUTE;route=fav}")).toEqual([
      { text: "my/", depth: 1, source: "ROUTE" },
      { text: "fav", depth: 2, source: "ROUTE;route" },
      { text: "/path ", depth: 1, source: "ROUTE" },
      { text: "api", depth: 2, source: "NAME" },
    ]);
  });

  it("flattens a reference an operation transformed", () => {
    expect(spans(book, "{SERVICE|uppercase}")).toEqual([
      { text: "SVC-API", depth: 1, source: "SERVICE" },
    ]);
  });

  it("keeps the level a transformed nested reference sits at", () => {
    expect(spans(book, "{LOUD}")).toEqual([
      { text: "API", depth: 2, source: "NAME" },
    ]);
  });

  it("counts a reference that failed at its own level", () => {
    expect(spans(book, "{MISSING}")).toEqual([
      { text: "{MISSING}", depth: 1, unresolved: true },
    ]);
  });

  it("paints a reference inside a failed one one level deeper", () => {
    expect(spans(book, "{NAME|slice({MISSING};)}")).toEqual([
      { text: "{NAME|slice(", depth: 1, unresolved: true },
      { text: "{MISSING}", depth: 2, unresolved: true },
      { text: ";)}", depth: 1, unresolved: true },
    ]);
  });

  it("paints each argument of a failed call at its own level", () => {
    expect(spans(book, "{|IF(\n\t{COND};\n\t{A};\n\t{B}\n)}")).toEqual([
      { text: "{|IF(\n\t", depth: 1, unresolved: true },
      { text: "{COND}", depth: 2, unresolved: true },
      { text: ";\n\t", depth: 1, unresolved: true },
      { text: "{A}", depth: 2, unresolved: true },
      { text: ";\n\t", depth: 1, unresolved: true },
      { text: "{B}", depth: 2, unresolved: true },
      { text: "\n)}", depth: 1, unresolved: true },
    ]);
  });

  it("keeps a resolved reference inside a failed one at its own level", () => {
    expect(spans(book, "{|IF({MISSING};{NAME};x)}")).toEqual([
      { text: "{|IF(", depth: 1, unresolved: true },
      { text: "{MISSING}", depth: 2, unresolved: true },
      { text: ";{NAME};x)}", depth: 1, unresolved: true },
    ]);
  });

  it("keeps counting into a reference nested inside a failed argument", () => {
    expect(spans(book, "{NAME|slice({MISSING|slice({DEEPER};)};)}")).toEqual([
      { text: "{NAME|slice(", depth: 1, unresolved: true },
      { text: "{MISSING|slice(", depth: 2, unresolved: true },
      { text: "{DEEPER}", depth: 3, unresolved: true },
      { text: ";)}", depth: 2, unresolved: true },
      { text: ";)}", depth: 1, unresolved: true },
    ]);
  });
});

describe("nesting through an IF branch", () => {
  const book = runbook({
    NAME: "api",
    SERVICE: "svc-{NAME}",
    ENV: "prod",
  });

  it("keeps the nesting of the branch it took", () => {
    expect(spans(book, "{|IF(true;{SERVICE};{NAME})}")).toEqual([
      { text: "svc-", depth: 2, source: "SERVICE" },
      { text: "api", depth: 3, source: "NAME" },
    ]);
  });

  it("keeps the nesting of the branch it did not skip", () => {
    expect(spans(book, "{|IF(false;{SERVICE};{NAME})}")).toEqual([
      { text: "api", depth: 2, source: "NAME" },
    ]);
  });

  it("leaves a literal branch at the first level", () => {
    expect(spans(book, "{|IF(false;{SERVICE};plain)}")).toEqual([
      { text: "plain", depth: 1 },
    ]);
  });

  it("keeps a branch mixing literal text and a reference apart", () => {
    expect(spans(book, "{|IF(true;run {NAME};skip)}")).toEqual([
      { text: "run ", depth: 1 },
      { text: "api", depth: 2, source: "NAME" },
    ]);
  });

  it("names the reference itself as the source of a literal branch", () => {
    expect(spans(book, "{ENV|IF(true;plain;no)}")).toEqual([
      { text: "plain", depth: 1, source: "ENV" },
    ]);
  });

  it("drops the whitespace the branch was spaced out with", () => {
    expect(spans(book, "{|IF(true; {NAME} ;no)}")).toEqual([
      { text: "api", depth: 2, source: "NAME" },
    ]);
  });

  it("gives an empty else branch no spans", () => {
    expect(spans(book, "{|IF(false;{NAME})}")).toEqual([]);
  });

  it("flattens a branch a later operation transformed", () => {
    expect(spans(book, "{|IF(true;{SERVICE};{NAME})|uppercase}")).toEqual([
      { text: "SVC-API", depth: 1 },
    ]);
  });

  it("paints a reference the branch could not resolve on its own ramp", () => {
    expect(spans(book, "{|IF(true;{NAME} {MISSING};x)}")).toEqual([
      { text: "api", depth: 2, source: "NAME" },
      { text: " ", depth: 1 },
      { text: "{MISSING}", depth: 2, unresolved: true },
    ]);
  });
});

describe("nesting an unresolved reference", () => {
  const book = runbook({
    BROKEN: "hi {MISSING}",
    SHELL: "find {} +",
    BLANK: "hi {;name}",
    INNER: "{MISSING}",
    MID: "{INNER}",
    DEEP: "{MID}",
  });

  it("puts a reference a value could not resolve one level under it", () => {
    expect(spans(book, "{BROKEN}")).toEqual([
      { text: "hi ", depth: 1, source: "BROKEN" },
      { text: "{MISSING}", depth: 2, unresolved: true },
    ]);
  });

  it("keeps braces that spell no reference as the value's own text", () => {
    expect(spans(book, "{SHELL}")).toEqual([
      { text: "find {} +", depth: 1, source: "SHELL" },
    ]);
  });

  it("keeps the level a filled blank sits at", () => {
    expect(spans(book, "{BLANK;name=Ada}")).toEqual([
      { text: "hi ", depth: 1, source: "BLANK" },
      { text: "Ada", depth: 2, source: "BLANK;name" },
    ]);
  });

  it("clamps past the deepest level the palette colors", () => {
    expect(spans(book, "{DEEP}")).toEqual([
      { text: "{MISSING}", depth: 3, unresolved: true },
    ]);
  });
});
