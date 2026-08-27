import { ReferenceSurface } from "@/common/enums";
import { describe, expect, it } from "vitest";

import {
  braceToken,
  braceTokenKeyRange,
  getTokenKey,
  openReferenceAt,
  scanReferences,
  splitReferenceBody,
} from "./token";

describe("braceToken", () => {
  it("wraps a body in braces", () => {
    expect(braceToken("HOST")).toBe("{HOST}");
  });

  it("reports where the key sits inside the token it wrote", () => {
    expect(braceTokenKeyRange("HOST")).toEqual({ start: 1, length: 4 });
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
