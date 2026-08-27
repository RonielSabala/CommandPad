import { BooleanSyntax } from "@/common/variableSyntax";
import { describe, expect, it } from "vitest";

import { readBoolean, readBooleans, writeBoolean } from "./boolean";

const { TRUE, FALSE, TRUE_ALT, FALSE_ALT } = BooleanSyntax;

describe("readBoolean", () => {
  it.each([
    [TRUE, true],
    [FALSE, false],
    [TRUE_ALT, true],
    [FALSE_ALT, false],
    [`  ${TRUE.toUpperCase()}  `, true],
    [`${FALSE[0].toUpperCase()}${FALSE.slice(1)}`, false],
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
    expect(readBooleans([TRUE, FALSE_ALT])).toEqual([true, false]);
  });

  it("fails the lot when any one of them is not an answer", () => {
    expect(readBooleans([TRUE, "maybe"])).toBeNull();
  });
});

describe("writeBoolean", () => {
  it("writes the spelling the operations answer with", () => {
    expect(writeBoolean(true)).toBe(TRUE);
    expect(writeBoolean(false)).toBe(FALSE);
  });
});
