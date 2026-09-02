import { CallSyntax } from "@/common/variableSyntax";
import { isString } from "@/utils/typeGuards";
import { describe, expect, it } from "vitest";

import { defineCallOperation } from "./call";
import type { OperationContext } from "./types";

const CONTEXT: OperationContext = { key: "KEY" };

function reporter(arity: number) {
  return defineCallOperation({
    arity,
    builders: {
      report: (args) => () => JSON.stringify(args),
    },
  });
}

function call(arity: number, operation: string): string | null {
  const transform = reporter(arity).parse({ text: operation });
  if (!transform) {
    return null;
  }

  const output = transform("", CONTEXT);
  return isString(output) ? output : output.text;
}

describe("defineCallOperation", () => {
  it("declares its keywords with the arity it was given", () => {
    expect(reporter(2).keywords).toEqual([{ keyword: "report", arity: 2 }]);
  });

  it("does not answer for another keyword", () => {
    expect(call(1, "other(x)")).toBeNull();
  });

  it("hands over an empty list when the call is written without parentheses", () => {
    expect(call(1, "report")).toBe("[]");
  });

  it("reads empty parentheses as no arguments too, so `f` and `f()` agree", () => {
    expect(call(1, "report()")).toBe("[]");
  });

  it("splits the arguments on the separator", () => {
    expect(call(3, "report(a;b;c)")).toBe('["a","b","c"]');
  });

  it("keeps every argument verbatim, spaces included", () => {
    expect(call(2, "report( a ; b )")).toBe('[" a "," b "]');
  });

  it("eats the whitespace around the keyword and outside the parentheses", () => {
    expect(call(1, "  report(x)  ")).toBe('["x"]');
  });

  it("stops splitting at the declared arity, so the rest is content", () => {
    expect(call(2, "report(a;b;c)")).toBe('["a","b;c"]');
    expect(call(1, "report(a;b)")).toBe('["a;b"]');
  });

  it("takes as many arguments as it is written with when variadic", () => {
    expect(call(CallSyntax.VARIADIC, "report(a;b;c;d)")).toBe(
      '["a","b","c","d"]',
    );
  });

  it("lets an argument hold parentheses of its own", () => {
    expect(call(1, "report(f(x))")).toBe('["f(x)"]');
  });
});
