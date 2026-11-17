import { charFlagsAt } from "@/common/charFlags";
import { ReferenceSurface } from "@/common/enums";
import { ESCAPE_CHAR } from "@/common/regex";
import type { ResolvedSpan } from "@/common/types";
import {
  ESCAPED_BRACE_OPEN,
  EscapedBraceOpenRegex,
  SYNTAX_CHAR_FLAGS,
  SyntaxChar,
  VariableSyntax,
} from "@/common/variableSyntax";

import { mergeSpans, sliceSpans, spansText } from "./spans";
import type { ResolvedValue } from "./types";

/** Whether `\{` is a literal brace rather than the start of a reference. */
const ESCAPES_REFERENCES: Record<ReferenceSurface, boolean> = {
  [ReferenceSurface.COMMAND]: true,
  [ReferenceSurface.VALUE]: true,
};

/** Whether the backslash itself is dropped here. */
const CONSUMES_ESCAPES: Record<ReferenceSurface, boolean> = {
  [ReferenceSurface.COMMAND]: true,
  [ReferenceSurface.VALUE]: false,
};

const SEPARATORS = SyntaxChar.PARAM_SEPARATOR | SyntaxChar.OPERATION_SEPARATOR;
const ARGUMENT_PARENS = SyntaxChar.ARGUMENT_OPEN | SyntaxChar.ARGUMENT_CLOSE;

/** Whether a backslash sits right before `index`. */
function isEscapedAt(text: string, index: number): boolean {
  return text[index - 1] === ESCAPE_CHAR;
}

/** Visits every brace before `end` in order. */
function forEachBrace(
  text: string,
  end: number,
  visit: (index: number, opens: boolean) => void,
): void {
  const { BRACE_OPEN, BRACE_CLOSE } = VariableSyntax;
  let open = text.indexOf(BRACE_OPEN);
  let close = text.indexOf(BRACE_CLOSE);

  for (;;) {
    const opens = open !== -1 && (close === -1 || open < close);
    const index = opens ? open : close;

    if (index === -1 || index >= end) {
      return;
    }

    visit(index, opens);

    if (opens) {
      open = text.indexOf(BRACE_OPEN, index + 1);
    } else {
      close = text.indexOf(BRACE_CLOSE, index + 1);
    }
  }
}

export interface ReferenceMatch {
  token: string;
  raw: string;
  start: number;
  end: number;
}

export interface ReferenceBodyChunk {
  separator: string;
  text: string;
}

export interface OpenReference {
  start: number;
  raw: string;
}

/** Drops every backslash that escapes a brace. */
export function dropBraceEscapes(text: string): string {
  return text.replace(EscapedBraceOpenRegex, VariableSyntax.BRACE_OPEN);
}

/** Drops a backslash left against a closing brace. */
function dropTrailingEscape(raw: string): string {
  return raw.endsWith(ESCAPE_CHAR) ? raw.slice(0, -1) : raw;
}

/** Drops the backslash that escapes a reference. */
export function unescapeBraces(
  text: string,
  surface: ReferenceSurface,
): string {
  return CONSUMES_ESCAPES[surface] ? dropBraceEscapes(text) : text;
}

/** The text an operation reads. */
export function literalBraceSpans(value: ResolvedValue): ResolvedValue {
  if (!value.text.includes(ESCAPED_BRACE_OPEN)) {
    return value;
  }

  const kept: ResolvedSpan[] = [];
  let lastEnd = 0;

  for (const match of value.text.matchAll(EscapedBraceOpenRegex)) {
    kept.push(...sliceSpans(value.spans, lastEnd, match.index));
    lastEnd = match.index + ESCAPE_CHAR.length;
  }

  kept.push(...sliceSpans(value.spans, lastEnd, value.text.length));
  const spans = mergeSpans(kept);

  return { text: spansText(spans), spans };
}

/** `unescapeBraces` over a resolved value, keeping its spans aligned. */
export function unescapeBraceSpans(
  value: ResolvedValue,
  surface: ReferenceSurface,
): ResolvedValue {
  return CONSUMES_ESCAPES[surface] ? literalBraceSpans(value) : value;
}

/** Writes an operation's output back for this surface where escapes are kept. */
export function escapeLiteralBraceSpans(
  value: ResolvedValue,
  surface: ReferenceSurface,
): ResolvedValue {
  if (
    CONSUMES_ESCAPES[surface] ||
    !value.text.includes(VariableSyntax.BRACE_OPEN)
  ) {
    return value;
  }

  const escape = (text: string): string =>
    text.replaceAll(VariableSyntax.BRACE_OPEN, ESCAPED_BRACE_OPEN);

  return {
    text: escape(value.text),
    spans: value.spans.map((span) => ({ ...span, text: escape(span.text) })),
  };
}

/** Escapes every reference in `text`, and normalizes the escaping it finds. */
export function escapeBraces(text: string): string {
  let result = "";
  let lastEnd = 0;

  for (const match of scanBraces(text, false)) {
    const start = match.start;
    const escaped = isEscapedAt(text, start) && start - 1 >= lastEnd;

    result +=
      text.slice(lastEnd, escaped ? start - 1 : start) +
      ESCAPE_CHAR +
      braceToken(escapeBraces(dropTrailingEscape(match.raw)));

    lastEnd = match.end;
  }

  return result + text.slice(lastEnd);
}

export function braceToken(raw: string): string {
  return `${VariableSyntax.BRACE_OPEN}${raw}${VariableSyntax.BRACE_CLOSE}`;
}

/** Where `key` sits inside `braceToken(key)`, as an offset into the token. */
export function braceTokenKeyRange(key: string): {
  start: number;
  length: number;
} {
  return { start: VariableSyntax.BRACE_OPEN.length, length: key.length };
}

function referenceAt(text: string, start: number, end: number): ReferenceMatch {
  return {
    token: text.slice(start, end),
    raw: text.slice(start + 1, end - 1),
    start,
    end,
  };
}

/** Recovers the references from a text whose braces do not balance. */
function scanUnbalanced(text: string, escapes: boolean): ReferenceMatch[] {
  const open: number[] = [];
  const pairs: ReferenceMatch[] = [];

  forEachBrace(text, text.length, (i, opens) => {
    if (opens) {
      open.push(i);
      return;
    }

    const start = open.pop();
    if (start !== undefined && !(escapes && isEscapedAt(text, start))) {
      pairs.push(referenceAt(text, start, i + 1));
    }
  });

  pairs.sort((a, b) => a.start - b.start);

  const matches: ReferenceMatch[] = [];
  let lastEnd = 0;

  for (const pair of pairs) {
    if (pair.start >= lastEnd) {
      matches.push(pair);
      lastEnd = pair.end;
    }
  }

  return matches;
}

/** Finds the balanced brace groups sitting at the top level of `text`. */
export function scanBraces(text: string, escapes: boolean): ReferenceMatch[] {
  const matches: ReferenceMatch[] = [];
  let start = -1;
  let depth = 0;

  forEachBrace(text, text.length, (i, opens) => {
    if (opens) {
      if (depth > 0) {
        depth += 1;
      } else if (!escapes || !isEscapedAt(text, i)) {
        depth = 1;
        start = i;
      }
    } else if (depth > 0) {
      depth -= 1;
      if (depth === 0) {
        matches.push(referenceAt(text, start, i + 1));
      }
    }
  });

  return depth === 0 ? matches : scanUnbalanced(text, escapes);
}

/** Finds the references sitting at the top level of `text`. */
export function scanReferences(
  text: string,
  surface: ReferenceSurface,
): ReferenceMatch[] {
  return scanBraces(text, ESCAPES_REFERENCES[surface]);
}

/** The reference `index` sits inside, together with the backslash escaping it. */
export function escapableReferenceAt(
  text: string,
  index: number,
): { start: number; end: number } | null {
  const escapedStart = (start: number) =>
    isEscapedAt(text, start) ? start - 1 : start;

  const match = scanBraces(text, false).find(
    (reference) =>
      index >= escapedStart(reference.start) && index <= reference.end,
  );

  return match ? { start: escapedStart(match.start), end: match.end } : null;
}

/** The innermost reference still open at `index`, `null` when there is none. */
export function openReferenceAt(
  text: string,
  index: number,
  surface: ReferenceSurface,
): OpenReference | null {
  const open: number[] = [];

  forEachBrace(text, index, (i, opens) => {
    if (opens) {
      open.push(i);
    } else {
      open.pop();
    }
  });

  const start = open.pop();
  return start === undefined ||
    (ESCAPES_REFERENCES[surface] && isEscapedAt(text, start))
    ? null
    : { start, raw: text.slice(start + 1, index) };
}

export interface ReferencePart {
  text: string;
  match: ReferenceMatch | null;
}

function splitMatches(
  text: string,
  matches: ReferenceMatch[],
  literal: (text: string) => string,
): ReferencePart[] {
  const parts: ReferencePart[] = [];
  let lastEnd = 0;

  for (const match of matches) {
    parts.push({
      text: literal(text.slice(lastEnd, match.start)),
      match: null,
    });

    parts.push({ text: match.token, match });
    lastEnd = match.end;
  }

  parts.push({ text: literal(text.slice(lastEnd)), match: null });
  return parts;
}

/** Splits `text` into its literal runs and the references between them. */
export function splitReferenceParts(
  text: string,
  surface: ReferenceSurface,
): ReferencePart[] {
  return splitMatches(
    text,
    scanReferences(text, surface),
    (literal) => literal,
  );
}

function replaceMatches(
  text: string,
  matches: ReferenceMatch[],
  replace: (match: ReferenceMatch) => string,
  literal: (text: string) => string,
): string {
  if (matches.length === 0) {
    return literal(text);
  }

  let result = "";
  let lastEnd = 0;

  for (const match of matches) {
    result += literal(text.slice(lastEnd, match.start)) + replace(match);
    lastEnd = match.end;
  }

  return result + literal(text.slice(lastEnd));
}

/** Rewrites every top-level reference in `text`. */
export function replaceReferences(
  text: string,
  surface: ReferenceSurface,
  replace: (match: ReferenceMatch) => string,
): string {
  return replaceMatches(
    text,
    scanReferences(text, surface),
    replace,
    (literal) => literal,
  );
}

/** Splits a filled template into its literal runs. */
export function splitTemplateParts(text: string): ReferencePart[] {
  return splitMatches(text, scanBraces(text, true), dropBraceEscapes);
}

/** Splits a reference body into its key, its params and its operations. */
export function splitReferenceBody(raw: string): ReferenceBodyChunk[] {
  const chunks: ReferenceBodyChunk[] = [];
  let separator = "";
  let start = 0;
  let depth = 0;
  let call = 0;

  for (let i = 0; i < raw.length; i += 1) {
    const flags = charFlagsAt(SYNTAX_CHAR_FLAGS, raw, i);
    if (!flags) {
      continue;
    }

    if (flags & SyntaxChar.BRACE_OPEN) {
      depth += 1;
    } else if (flags & SyntaxChar.BRACE_CLOSE) {
      depth -= 1;
    } else if (depth !== 0) {
      continue;
    } else if (flags & ARGUMENT_PARENS) {
      if (separator === VariableSyntax.OPERATION_SEPARATOR) {
        call =
          flags & SyntaxChar.ARGUMENT_OPEN ? call + 1 : Math.max(0, call - 1);
      }
    } else if (call === 0 && flags & SEPARATORS) {
      chunks.push({ separator, text: raw.slice(start, i) });
      separator = raw[i];
      start = i + 1;
    }
  }

  chunks.push({ separator, text: raw.slice(start) });
  return chunks;
}

export function getTokenKey(raw: string): string {
  return splitReferenceBody(raw)[0].text.trim();
}
