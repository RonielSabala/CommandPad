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
export const notBefore = (source: string) => `(?!${source})`;
export const notAfter = (source: string) => `(?<!${source})`;

// Composition

export const sequence = (...sources: string[]) => sources.join("");
export const either = (...sources: string[]) => sources.join("|");
export const anchored = (source: string) => `^${source}$`;
export const atEnd = (source: string) => `${source}$`;
export const globalRegex = (source: string) => new RegExp(source, "g");

// Escaping

export const ESCAPE = escapeLiteral("\\");
export const unescaped = (source: string) => `${notAfter(ESCAPE)}${source}`;
