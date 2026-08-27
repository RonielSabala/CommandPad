import { describe, expect, it } from "vitest";

import {
  countCharacters,
  countLines,
  countOccurrences,
  fillBoth,
  fillEnd,
  fillStart,
  sliceString,
  stripBoth,
  stripEnd,
  stripStart,
} from "./string";

describe("countCharacters", () => {
  it("counts code points, so a surrogate pair is one character", () => {
    expect(countCharacters("abc")).toBe(3);
    expect(countCharacters("a\u{1F600}b")).toBe(3);
    expect(countCharacters("")).toBe(0);
  });
});

describe("countLines", () => {
  it.each([
    ["", 1],
    ["one", 1],
    ["one\ntwo", 2],
    ["one\n", 2],
  ])("%s -> %s", (text, expected) => {
    expect(countLines(text)).toBe(expected);
  });
});

describe("countOccurrences", () => {
  it("counts non-overlapping matches", () => {
    expect(countOccurrences("aaaa", "aa")).toBe(2);
    expect(countOccurrences("/var/log/app", "/")).toBe(3);
    expect(countOccurrences("abc", "z")).toBe(0);
  });
});

describe("sliceString", () => {
  const TEXT = "abcdef";

  it.each([
    [0, 3, 1, "abc"],
    [3, null, 1, "def"],
    [null, 3, 1, "abc"],
    [null, null, 1, "abcdef"],
    [-2, null, 1, "ef"],
    [null, -2, 1, "abcd"],
    [null, null, -1, "fedcba"],
    [-1, null, -2, "fdb"],
    [0, 6, 2, "ace"],
    [0, 99, 1, "abcdef"],
    [99, null, 1, ""],
    [-99, null, 1, "abcdef"],
    [3, 3, 1, ""],
    [3, 1, 1, ""],
  ])("(%s, %s, %s) -> %s", (start, stop, step, expected) => {
    expect(sliceString(TEXT, start, stop, step)).toBe(expected);
  });

  it("slices code points, so a surrogate pair never splits", () => {
    expect(sliceString("a\u{1F600}b", 0, 2, 1)).toBe("a\u{1F600}");
  });
});

describe("stripping", () => {
  it("removes the cut as many times as it is present", () => {
    expect(stripStart("xxbody", "x")).toBe("body");
    expect(stripEnd("bodyxx", "x")).toBe("body");
    expect(stripBoth("xxbodyxx", "x")).toBe("body");
  });

  it("removes a literal string, not a set of characters", () => {
    expect(stripStart("/tmp/build", "/tmp/")).toBe("build");
    expect(stripStart("/tmp/build", "pmt/")).toBe("/tmp/build");
  });

  it("is a no-op for an empty cut, rather than spinning", () => {
    expect(stripBoth("body", "")).toBe("body");
  });

  it("leaves text the cut is not on alone", () => {
    expect(stripStart("body", "x")).toBe("body");
  });
});

describe("filling", () => {
  it("appends that many copies of the text", () => {
    expect(fillStart("api", "0", 2)).toBe("00api");
    expect(fillEnd("api", ".", 3)).toBe("api...");
    expect(fillBoth("api", "-", 2)).toBe("--api--");
  });

  it("adds nothing for zero copies", () => {
    expect(fillEnd("api", ".", 0)).toBe("api");
  });

  it("appends copies rather than padding to a width", () => {
    expect(fillEnd("a", "..", 2)).toBe("a....");
  });
});
