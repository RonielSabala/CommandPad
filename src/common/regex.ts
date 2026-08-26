/**
 * Primitives for composing regex sources out of literal syntax characters.
 */

import { isString } from "@/utils/typeGuards";

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

function escapeLiteral(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function escapeSyntax<T extends Record<string, unknown>>(
  syntax: T,
): Readonly<Record<StringKeys<T>, string>> {
  const entries = Object.entries(syntax).filter(
    (entry): entry is [string, string] => isString(entry[1]),
  );

  return Object.freeze(
    Object.fromEntries(
      entries.map(([key, literal]) => [key, escapeLiteral(literal)]),
    ),
  ) as Record<StringKeys<T>, string>;
}

// Building blocks

export const ANY = ".";
export const WHITESPACE = String.raw`\s`;
export const DIGIT = String.raw`\d`;

// Unicode categories
export const LETTER = String.raw`\p{L}`;
export const UPPERCASE_LETTER = String.raw`\p{Lu}`;
export const LOWERCASE_LETTER = String.raw`\p{Ll}`;
export const NUMBER = String.raw`\p{N}`;

// Character classes

export const anyOf = (...sources: string[]) => `[${sources.join("")}]`;
export const noneOf = (...sources: string[]) => `[^${sources.join("")}]`;

// Groups

export const group = (source: string) => `(?:${source})`;
export const capture = (source: string) => `(${source})`;
export const named = (name: string, source: string) => `(?<${name}>${source})`;
export const backreference = (name: string) => `\\k<${name}>`;

// Quantifiers

export const optional = (source: string) => `${source}?`;
export const oneOrMore = (source: string) => `${source}+`;
export const zeroOrMore = (source: string) => `${source}*`;
export const oneOrMoreLazy = (source: string) => `${source}+?`;

// Lookaround

export const before = (source: string) => `(?=${source})`;
export const after = (source: string) => `(?<=${source})`;
export const notBefore = (source: string) => `(?!${source})`;
export const notAfter = (source: string) => `(?<!${source})`;

// Composition

export const sequence = (...sources: string[]) => sources.join("");
export const either = (...sources: string[]) => sources.join("|");
export const anchored = (source: string) => `^${source}$`;
export const atStart = (source: string) => `^${source}`;
export const atEnd = (source: string) => `${source}$`;
export const globalRegex = (source: string) => new RegExp(source, "g");
export const globalUnicodeRegex = (source: string) => new RegExp(source, "gu");
export const unicodeRegex = (source: string) => new RegExp(source, "u");
export const dotAllRegex = (source: string) => new RegExp(source, "s");

// Escaping

export const ESCAPE_CHAR = "\\";
export const ESCAPE = escapeLiteral(ESCAPE_CHAR);
export const unescaped = (source: string) => `${notAfter(ESCAPE)}${source}`;
