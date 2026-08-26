import { StringTestConfig } from "@/common/config";
import {
  LETTER,
  LOWERCASE_LETTER,
  NUMBER,
  UPPERCASE_LETTER,
  WHITESPACE,
  anchored,
  anyOf,
  either,
  oneOrMore,
  unicodeRegex,
} from "@/common/regex";
import { toTitleCase } from "@/utils/stringCase";

const DECIMAL_DIGIT = String.raw`\p{Nd}`;

/** Whether every character is one of `sources`, and there is at least one of them. */
const madeOf = (...sources: string[]) =>
  unicodeRegex(anchored(oneOrMore(anyOf(...sources))));

const HasUppercaseRegex = unicodeRegex(UPPERCASE_LETTER);
const HasLowercaseRegex = unicodeRegex(LOWERCASE_LETTER);
const HasLetterRegex = unicodeRegex(LETTER);
const NumericRegex = madeOf(NUMBER);
const DigitRegex = madeOf(DECIMAL_DIGIT);
const AlphanumericRegex = madeOf(LETTER, NUMBER);
const AlphabeticRegex = madeOf(LETTER);
const WhitespaceRegex = madeOf(WHITESPACE);
const CasedRegex = unicodeRegex(either(UPPERCASE_LETTER, LOWERCASE_LETTER));

export function isUpperText(text: string): boolean {
  return CasedRegex.test(text) && !HasLowercaseRegex.test(text);
}

export function isLowerText(text: string): boolean {
  return CasedRegex.test(text) && !HasUppercaseRegex.test(text);
}

export function isTitleText(text: string): boolean {
  return HasLetterRegex.test(text) && toTitleCase(text) === text;
}

export function isNumericText(text: string): boolean {
  return NumericRegex.test(text);
}

export function isDigitText(text: string): boolean {
  return DigitRegex.test(text);
}

export function isAlnumText(text: string): boolean {
  return AlphanumericRegex.test(text);
}

export function isAlphaText(text: string): boolean {
  return AlphabeticRegex.test(text);
}

export function isSpaceText(text: string): boolean {
  return WhitespaceRegex.test(text);
}

export function isAsciiText(text: string): boolean {
  return Array.from(text).every(
    (char) =>
      (char.codePointAt(0) ?? 0) <= StringTestConfig.ASCII_MAX_CODE_POINT,
  );
}

export function isEmptyText(text: string): boolean {
  return text.length === 0;
}
