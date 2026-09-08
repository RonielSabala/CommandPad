import { ReferenceSurface } from "@/common/enums";
import { VariableSyntax } from "@/common/variableSyntax";
import { describe, expect, it } from "vitest";

import {
  braceToken,
  braceTokenKeyRange,
  escapableReferenceAt,
  escapeBraces,
  getTokenKey,
  openReferenceAt,
  scanReferences,
  splitReferenceBody,
} from "./token";

describe("braceToken", () => {
  it("wraps a body in braces", () => {
    expect(braceToken("HOST")).toBe(
      `${VariableSyntax.BRACE_OPEN}HOST${VariableSyntax.BRACE_CLOSE}`,
    );
  });

  it("reports where the key sits inside the token it wrote", () => {
    expect(braceTokenKeyRange("HOST")).toEqual({
      start: VariableSyntax.BRACE_OPEN.length,
      length: "HOST".length,
    });
  });
});

describe("getTokenKey", () => {
  it("takes the key chunk and trims it", () => {
    expect(getTokenKey(" MY VAR ;a=b|len")).toBe("MY VAR");
  });

  it("is empty for an unnamed reference", () => {
    expect(getTokenKey("|date()")).toBe("");
  });
});

describe("scanReferences", () => {
  function found(
    text: string,
    surface: ReferenceSurface = ReferenceSurface.COMMAND,
  ): string[] {
    return scanReferences(text, surface).map((match) => match.token);
  }

  it("ends a reference at the brace that balances it", () => {
    expect(found("{A;b={C;d=x}}")).toEqual(["{A;b={C;d=x}}"]);
  });

  it("finds every top-level reference in order", () => {
    expect(found("ssh {USER}@{HOST}")).toEqual(["{USER}", "{HOST}"]);
  });

  it("leaves an escaped brace unopened on a command surface", () => {
    expect(found(String.raw`\{A} {B}`)).toEqual(["{B}"]);
  });

  it("still opens on an escaped brace inside a variable value", () => {
    expect(found(String.raw`\{A}`, ReferenceSurface.VALUE)).toEqual(["{A}"]);
  });

  it("recovers the references around a brace that never closes", () => {
    expect(found("{ {A} {B}")).toEqual(["{A}", "{B}"]);
  });

  it("treats an unclosed brace as literal text rather than swallowing the rest", () => {
    expect(found("echo { and {HOST}")).toEqual(["{HOST}"]);
  });
});

describe("splitReferenceBody", () => {
  function chunks(raw: string): string[] {
    return splitReferenceBody(raw).map(
      (chunk) => `${chunk.separator}${chunk.text}`,
    );
  }

  it("splits the key, the params and the operations", () => {
    expect(chunks("A;b=c|len")).toEqual(["A", ";b=c", "|len"]);
  });

  it("keeps a nested reference's own separators to itself", () => {
    expect(chunks("A;b={C;d=x|len}")).toEqual(["A", ";b={C;d=x|len}"]);
  });

  it("ignores a separator sitting inside a call's arguments", () => {
    expect(chunks("A|strip(;)")).toEqual(["A", "|strip(;)"]);
    expect(chunks("A|strip(|)")).toEqual(["A", "|strip(|)"]);
  });

  it("does not read a param value as a call, so its parens are plain characters", () => {
    expect(chunks("A;b=(x;y)")).toEqual(["A", ";b=(x", ";y)"]);
  });

  it("rejoins to the body it was given, character for character", () => {
    const body = " A ; b = c | slice(0;2) ";
    expect(chunks(body).join("")).toBe(body);
  });
});

describe("openReferenceAt", () => {
  it("returns the reference still open at the caret", () => {
    expect(openReferenceAt("ssh {US", 7, ReferenceSurface.COMMAND)).toEqual({
      start: 4,
      raw: "US",
    });
  });

  it("returns the innermost one when references nest", () => {
    expect(openReferenceAt("{A;b={C", 7, ReferenceSurface.COMMAND)).toEqual({
      start: 5,
      raw: "C",
    });
  });

  it("is null when every brace before the caret is closed", () => {
    expect(openReferenceAt("{A} ", 4, ReferenceSurface.COMMAND)).toBeNull();
  });

  it("is null when the brace that opened it is escaped", () => {
    expect(
      openReferenceAt(String.raw`\{US`, 4, ReferenceSurface.COMMAND),
    ).toBeNull();
  });
});

describe("escapeBraces", () => {
  it("escapes every reference in the text", () => {
    expect(escapeBraces("ssh {USER}@{HOST}")).toBe(
      String.raw`ssh \{USER}@\{HOST}`,
    );
  });

  it("leaves an already escaped reference with the one backslash it has", () => {
    expect(escapeBraces(String.raw`\{A} {B}`)).toBe(String.raw`\{A} \{B}`);
  });

  it("drops a backslash left against the closing brace", () => {
    expect(escapeBraces(String.raw`{A\}`)).toBe(String.raw`\{A}`);
  });

  it("normalizes a reference escaped at both ends", () => {
    expect(escapeBraces(String.raw`\{A\}`)).toBe(String.raw`\{A}`);
  });

  it("is idempotent", () => {
    const once = escapeBraces("ping {HOST}");
    expect(escapeBraces(once)).toBe(once);
  });
});

describe("escapableReferenceAt", () => {
  function spanAt(text: string, index: number): string | null {
    const span = escapableReferenceAt(text, index);
    return span ? text.slice(span.start, span.end) : null;
  }

  it("takes the reference the index sits inside", () => {
    expect(spanAt("ssh {USER}@{HOST}", 6)).toBe("{USER}");
  });

  it("takes the whole reference from inside a nested one", () => {
    expect(spanAt("{A;b={C}}", 6)).toBe("{A;b={C}}");
  });

  it("holds at either end of the reference", () => {
    expect(spanAt("{A} x", 0)).toBe("{A}");
    expect(spanAt("{A} x", 3)).toBe("{A}");
  });

  it("takes the backslash escaping it along", () => {
    expect(spanAt(String.raw`x \{A}`, 4)).toBe(String.raw`\{A}`);
  });

  it("is null outside every reference", () => {
    expect(spanAt("ssh {USER}@{HOST}", 2)).toBeNull();
  });
});
