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

function splitWords(text: string): string[] {
  return text.split(WordBoundaryRegex).filter(Boolean);
}

export function upperFirst(text: string): string {
  const [first, ...rest] = Array.from(text);
  return first === undefined ? text : first.toUpperCase() + rest.join("");
}

function capitalizeWord(word: string): string {
  return upperFirst(word.toLowerCase());
}

export function toSnakeCase(text: string): string {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join(StringCaseConfig.SNAKE_SEPARATOR);
}

export function toKebabCase(text: string): string {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join(StringCaseConfig.KEBAB_SEPARATOR);
}

export function toCamelCase(text: string): string {
  return splitWords(text)
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : capitalizeWord(word),
    )
    .join("");
}

export function toPascalCase(text: string): string {
  return splitWords(text).map(capitalizeWord).join("");
}

export function capitalizeText(text: string): string {
  return upperFirst(text.toLowerCase());
}

export function toTitleCase(text: string): string {
  return text.replace(TitleWordRegex, (word) => capitalizeWord(word));
}

export function swapCase(text: string): string {
  return Array.from(text)
    .map((char) => {
      const upper = char.toUpperCase();
      return char === upper ? char.toLowerCase() : upper;
    })
    .join("");
}
