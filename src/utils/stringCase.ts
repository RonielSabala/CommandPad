import { StringCaseConfig } from "@/common/config";
import {
  LETTER,
  LOWERCASE_LETTER,
  NUMBER,
  UPPERCASE_LETTER,
  after,
  anyOf,
  before,
  either,
  escapeSyntax,
  globalUnicodeRegex,
  group,
  noneOf,
  oneOrMore,
  sequence,
  zeroOrMore,
} from "@/common/regex";

const Case = escapeSyntax(StringCaseConfig);

/** Where one word ends and the next begins */
const WordBoundaryRegex = globalUnicodeRegex(
  either(
    oneOrMore(noneOf(LETTER, NUMBER)),
    group(
      sequence(
        after(anyOf(LOWERCASE_LETTER, NUMBER)),
        before(UPPERCASE_LETTER),
      ),
    ),
    group(
      sequence(
        after(UPPERCASE_LETTER),
        before(sequence(UPPERCASE_LETTER, LOWERCASE_LETTER)),
      ),
    ),
  ),
);

const TitleWordRegex = globalUnicodeRegex(
  sequence(LETTER, zeroOrMore(group(either(LETTER, NUMBER, Case.APOSTROPHE)))),
);

export function splitWords(text: string): string[] {
  return text.split(WordBoundaryRegex).filter(Boolean);
}

export function upperFirst(text: string): string {
  const first = text.codePointAt(0);
  if (first === undefined) {
    return text;
  }

  const head = String.fromCodePoint(first);
  return head.toUpperCase() + text.slice(head.length);
}

function joinLowerWords(text: string, separator: string): string {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join(separator);
}

export function toSnakeCase(text: string): string {
  return joinLowerWords(text, StringCaseConfig.SNAKE_SEPARATOR);
}

export function toKebabCase(text: string): string {
  return joinLowerWords(text, StringCaseConfig.KEBAB_SEPARATOR);
}

export function toCamelCase(text: string): string {
  return splitWords(text)
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : capitalizeText(word),
    )
    .join("");
}

export function toPascalCase(text: string): string {
  return splitWords(text).map(capitalizeText).join("");
}

export function capitalizeText(text: string): string {
  return upperFirst(text.toLowerCase());
}

export function toTitleCase(text: string): string {
  return text.replace(TitleWordRegex, capitalizeText);
}

export function swapCase(text: string): string {
  return Array.from(text)
    .map((char) => {
      const upper = char.toUpperCase();
      return char === upper ? char.toLowerCase() : upper;
    })
    .join("");
}
