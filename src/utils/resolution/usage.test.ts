import { buildVariables, commandBlock, dividerBlock, noteBlock } from "@/test";
import { describe, expect, it } from "vitest";

import { getUsedVariableKeys, isVariableUnused } from "./usage";

const variables = buildVariables({
  HOST: "example.com",
  ORIGIN: "https://{HOST}",
  ORPHAN: "nobody references me",
  DEEP: "{ORPHAN}",
});

function usedIn(...texts: string[]): string[] {
  return [
    ...getUsedVariableKeys(
      texts.map((text) => commandBlock(text)),
      variables,
    ),
  ].sort();
}

describe("getUsedVariableKeys", () => {
  it("collects the keys a command block references", () => {
    expect(usedIn("curl {HOST}")).toEqual(["HOST"]);
  });

  it("follows a reference through the value it resolves to", () => {
    expect(usedIn("curl {ORIGIN}")).toEqual(["HOST", "ORIGIN"]);
  });

  it("counts a key referenced only from a param or an operation", () => {
    expect(usedIn("{A;target={HOST}}", "{B|slice({ORPHAN|len};)}")).toEqual([
      "A",
      "B",
      "HOST",
      "ORPHAN",
    ]);
  });

  it("counts a key that no variable defines", () => {
    expect(usedIn("curl {UNDEFINED}")).toEqual(["UNDEFINED"]);
  });

  it("skips an escaped reference, which renders literally", () => {
    expect(usedIn(String.raw`echo \{HOST}`)).toEqual([]);
  });

  it("reads nothing from the block types that hold no commands", () => {
    expect(
      getUsedVariableKeys([noteBlock("see {HOST}"), dividerBlock()], variables),
    ).toEqual(new Set());
  });

  it("terminates on a reference loop", () => {
    const looping = buildVariables({ A: "{B}", B: "{A}" });
    expect(
      [...getUsedVariableKeys([commandBlock("{A}")], looping)].sort(),
    ).toEqual(["A", "B"]);
  });

  it("defaults to nothing used", () => {
    expect(getUsedVariableKeys()).toEqual(new Set());
  });
});

describe("isVariableUnused", () => {
  const [host] = buildVariables({ HOST: "example.com" });
  const [blank] = buildVariables({ "  ": "no key" });

  it("is false for a key that is used", () => {
    expect(isVariableUnused(host, new Set(["HOST"]))).toBe(false);
  });

  it("is true for a key that is not", () => {
    expect(isVariableUnused(host, new Set())).toBe(true);
  });

  it("is false for a variable with no key, which cannot be referenced", () => {
    expect(isVariableUnused(blank, new Set())).toBe(false);
  });
});
