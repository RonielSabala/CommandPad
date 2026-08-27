import { describe, expect, it } from "vitest";

import { readBoolean, readBooleans, writeBoolean } from "./boolean";

describe("readBoolean", () => {
  it.each([
    ["true", true],
    ["false", false],
    ["1", true],
    ["0", false],
    ["  TRUE  ", true],
    ["False", false],
  ])("%s -> %s", (raw, expected) => {
    expect(readBoolean(raw)).toBe(expected);
  });

  it.each([["yes"], ["maybe"], [""], ["2"]])(
    "does not answer for %s",
    (raw) => {
      expect(readBoolean(raw)).toBeUndefined();
    },
  );
});

describe("readBooleans", () => {
  it("reads every argument", () => {
    expect(readBooleans(["true", "0"])).toEqual([true, false]);
  });

  it("fails the lot when any one of them is not an answer", () => {
    expect(readBooleans(["true", "maybe"])).toBeNull();
  });
});

describe("writeBoolean", () => {
  it("writes the spelling the operations answer with", () => {
    expect(writeBoolean(true)).toBe("true");
    expect(writeBoolean(false)).toBe("false");
  });
});
