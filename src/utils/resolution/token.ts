import { ReferenceSurface } from "@/common/enums";
import { ESCAPE_CHAR } from "@/common/regex";
import {
  CallSyntax,
  EscapedBraceOpenRegex,
  VariableSyntax,
} from "@/common/variableSyntax";

/** Whether `\{` is a literal brace rather than the start of a reference. */
const ESCAPES_REFERENCES: Record<ReferenceSurface, boolean> = {
  [ReferenceSurface.COMMAND]: true,
  [ReferenceSurface.VALUE]: false,
};

interface ReferenceMatch {
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
function dropBraceEscapes(text: string): string {
  return text.replace(EscapedBraceOpenRegex, VariableSyntax.BRACE_OPEN);
}

/** Drops the backslash that escapes a reference. */
export function unescapeBraces(
  text: string,
  surface: ReferenceSurface,
): string {
  return ESCAPES_REFERENCES[surface] ? dropBraceEscapes(text) : text;
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
  const openIndexes: number[] = [];
  const openEscaped: boolean[] = [];
  const pairs: ReferenceMatch[] = [];

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === VariableSyntax.BRACE_OPEN) {
      openIndexes.push(i);
      openEscaped.push(escapes && text[i - 1] === ESCAPE_CHAR);
    } else if (char === VariableSyntax.BRACE_CLOSE && openIndexes.length > 0) {
      const start = openIndexes.pop() as number;
      if (!openEscaped.pop()) {
        pairs.push(referenceAt(text, start, i + 1));
      }
    }
  }

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

/** Finds the references sitting at the top level of `text`. */
function scanBraces(text: string, escapes: boolean): ReferenceMatch[] {
  const matches: ReferenceMatch[] = [];
  let start = -1;
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === VariableSyntax.BRACE_OPEN) {
      if (depth > 0) {
        depth += 1;
      } else if (!escapes || text[i - 1] !== ESCAPE_CHAR) {
        depth = 1;
        start = i;
      }
    } else if (char === VariableSyntax.BRACE_CLOSE && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        matches.push(referenceAt(text, start, i + 1));
      }
    }
  }

  return depth === 0 ? matches : scanUnbalanced(text, escapes);
}

/** Finds the references sitting at the top level of `text`. */
export function scanReferences(
  text: string,
  surface: ReferenceSurface,
): ReferenceMatch[] {
  return scanBraces(text, ESCAPES_REFERENCES[surface]);
}

/** The innermost reference still open at `index`, `null` when there is none. */
export function openReferenceAt(
  text: string,
  index: number,
  surface: ReferenceSurface,
): OpenReference | null {
  const escapes = ESCAPES_REFERENCES[surface];
  const openIndexes: number[] = [];
  const openEscaped: boolean[] = [];

  for (let i = 0; i < index; i += 1) {
    const char = text[i];

    if (char === VariableSyntax.BRACE_OPEN) {
      openIndexes.push(i);
      openEscaped.push(escapes && text[i - 1] === ESCAPE_CHAR);
    } else if (char === VariableSyntax.BRACE_CLOSE && openIndexes.length > 0) {
      openIndexes.pop();
      openEscaped.pop();
    }
  }

  const start = openIndexes.pop();
  return start === undefined || openEscaped.pop()
    ? null
    : { start, raw: text.slice(start + 1, index) };
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

/** Rewrites every reference a filled template produced. */
export function replaceTemplateReferences(
  text: string,
  replace: (match: ReferenceMatch) => string,
): string {
  return replaceMatches(
    text,
    scanBraces(text, true),
    replace,
    dropBraceEscapes,
  );
}

/** Splits a reference body into its key, its params and its operations. */
export function splitReferenceBody(raw: string): ReferenceBodyChunk[] {
  const chunks: ReferenceBodyChunk[] = [];
  let separator = "";
  let start = 0;
  let depth = 0;
  let call = 0;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const inCall =
      separator === VariableSyntax.OPERATION_SEPARATOR && depth === 0;

    if (char === VariableSyntax.BRACE_OPEN) {
      depth += 1;
    } else if (char === VariableSyntax.BRACE_CLOSE) {
      depth -= 1;
    } else if (inCall && char === CallSyntax.ARGUMENT_OPEN) {
      call += 1;
    } else if (inCall && char === CallSyntax.ARGUMENT_CLOSE) {
      call = Math.max(0, call - 1);
    } else if (
      depth === 0 &&
      call === 0 &&
      (char === VariableSyntax.PARAM_SEPARATOR ||
        char === VariableSyntax.OPERATION_SEPARATOR)
    ) {
      chunks.push({ separator, text: raw.slice(start, i) });
      separator = char;
      start = i + 1;
    }
  }

  chunks.push({ separator, text: raw.slice(start) });
  return chunks;
}

export function getTokenKey(raw: string): string {
  return splitReferenceBody(raw)[0].text.trim();
}
