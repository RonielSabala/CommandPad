import { describe, expect, it } from "vitest";

import { extractedVariableKey, uniqueVariableKey } from "./keys";

describe("uniqueVariableKey", () => {
  it("keeps a key nothing has taken", () => {
    expect(uniqueVariableKey("HOST", new Set())).toBe("HOST");
  });

  it("counts up from 1 while the key is taken", () => {
    expect(uniqueVariableKey("HOST", new Set(["HOST"]))).toBe("HOST1");
    expect(uniqueVariableKey("HOST", new Set(["HOST", "HOST1"]))).toBe("HOST2");
  });
});

describe("extractedVariableKey", () => {
  const free = new Set<string>();

  it.each([
    ["example.com", "EXAMPLE_COM"],
    ["payment gateway", "PAYMENT_GATEWAY"],
    ["one two three four", "ONE_TWO_THREE"],
  ])("%s -> %s", (value, expected) => {
    expect(extractedVariableKey(value, free)).toBe(expected);
  });

  it.each([
    ["10.0.0.1"],
    ["8080"],
    ["2026-07-31"],
    [""],
    ["averyverylongsinglewordthatkeepsgoing"],
  ])("falls back to the default key for %s", (value) => {
    expect(extractedVariableKey(value, free)).toBe("VARIABLE");
  });

  it("uniquifies against the keys already taken", () => {
    expect(extractedVariableKey("8080", new Set(["VARIABLE"]))).toBe(
      "VARIABLE1",
    );
  });
});
