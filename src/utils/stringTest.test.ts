import { describe, expect, it } from "vitest";

import {
  isAlnumText,
  isAlphaText,
  isAsciiText,
  isDigitText,
  isEmptyText,
  isLowerText,
  isNumericText,
  isSpaceText,
  isTitleText,
  isUpperText,
} from "./stringTest";

const ALL_CHARACTER_TESTS = [
  isDigitText,
  isNumericText,
  isAlphaText,
  isAlnumText,
  isSpaceText,
  isUpperText,
  isLowerText,
  isTitleText,
];

describe("the character-class tests", () => {
  it("answers true for a value made only of that class", () => {
    expect(isDigitText("8080")).toBe(true);
    expect(isAlphaText("api")).toBe(true);
    expect(isAlnumText("api2")).toBe(true);
    expect(isSpaceText(" \t\n")).toBe(true);
  });

  it("answers false as soon as one character is not", () => {
    expect(isDigitText("80 80")).toBe(false);
    expect(isAlphaText("api2")).toBe(false);
    expect(isAlnumText("/var")).toBe(false);
    expect(isSpaceText(" a ")).toBe(false);
  });

  it("is wider for isnumeric than for isdigit", () => {
    expect(isNumericText("\u2168")).toBe(true);
    expect(isDigitText("\u2168")).toBe(false);
  });

  it("is false for the empty string, exactly like Python", () => {
    for (const test of ALL_CHARACTER_TESTS) {
      expect(test("")).toBe(false);
    }
  });
});

describe("the casing tests", () => {
  it("needs a cased character to answer true", () => {
    expect(isUpperText("API")).toBe(true);
    expect(isLowerText("api")).toBe(true);
    expect(isUpperText("8080")).toBe(false);
    expect(isLowerText("8080")).toBe(false);
  });

  it("ignores the uncased characters around them", () => {
    expect(isUpperText("API-2")).toBe(true);
    expect(isLowerText("api-2")).toBe(true);
  });

  it("reads a title as one that title casing would not change", () => {
    expect(isTitleText("Payment Gateway")).toBe(true);
    expect(isTitleText("Payment gateway")).toBe(false);
    expect(isTitleText("Don't Stop")).toBe(true);
    expect(isTitleText("42")).toBe(false);
  });
});

describe("isAsciiText", () => {
  it("accepts every character up to the ASCII maximum", () => {
    expect(isAsciiText("api-2 /var")).toBe(true);
    expect(isAsciiText("caf\u00e9")).toBe(false);
    expect(isAsciiText("")).toBe(true);
  });
});

describe("isEmptyText", () => {
  it("covers the gap every other test leaves", () => {
    expect(isEmptyText("")).toBe(true);
    expect(isEmptyText(" ")).toBe(false);
  });
});
