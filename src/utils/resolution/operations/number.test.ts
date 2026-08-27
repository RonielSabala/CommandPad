import { describe, expect, it } from "vitest";

import { readNumberArgument, readNumberArguments } from "./number";

describe("readNumberArgument", () => {
  it.each([
    ["0", 0],
    ["7", 7],
    ["-2", -2],
    ["+2", 2],
    ["10 - 2", 8],
    ["10 - 2 + 1", 9],
    ["2-1", 1],
    [" 10 - 2 ", 8],
    ["- 2", -2],
  ])("%s -> %s", (raw, expected) => {
    expect(readNumberArgument(raw)).toBe(expected);
  });

  it("reads a blank argument as left out, not as zero", () => {
    expect(readNumberArgument("")).toBeNull();
    expect(readNumberArgument("   ")).toBeNull();
  });

  it.each([["1 2"], ["abc"], ["1.5"], ["2 * 3"], ["(1 + 2)"], ["1 +"]])(
    "rejects %s",
    (raw) => {
      expect(readNumberArgument(raw)).toBeUndefined();
    },
  );
});

describe("readNumberArguments", () => {
  it("reads every argument, keeping the blanks apart from the numbers", () => {
    expect(readNumberArguments(["1", "", "-1"])).toEqual([1, null, -1]);
  });

  it("fails the lot when any one of them fails", () => {
    expect(readNumberArguments(["1", "two"])).toBeNull();
  });

  it("is an empty list for no arguments", () => {
    expect(readNumberArguments([])).toEqual([]);
  });
});
