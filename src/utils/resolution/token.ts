import { ReferenceSurface } from "@/common/enums";
import { ESCAPE_CHAR } from "@/common/regex";
import { EscapedBraceOpenRegex, VariableSyntax } from "@/common/variableSyntax";

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

interface ReferenceChunk {
  separator: string;
  text: string;
}

/** Drops the backslash that escapes a reference. */
export function unescapeBraces(
  text: string,
  surface: ReferenceSurface,
): string {
  return ESCAPES_REFERENCES[surface]
    ? text.replace(EscapedBraceOpenRegex, VariableSyntax.BRACE_OPEN)
    : text;
}

export function braceToken(raw: string): string {
  return `${VariableSyntax.BRACE_OPEN}${raw}${VariableSyntax.BRACE_CLOSE}`;
}

/** Finds the references sitting at the top level of `text`. */
export function scanReferences(
  text: string,
  surface: ReferenceSurface,
): ReferenceMatch[] {
  const escapes = ESCAPES_REFERENCES[surface];
  const matches: ReferenceMatch[] = [];
  let from = 0;
  const to = text.length;

  while (from < to) {
    let start = -1;
    let depth = 0;

    for (let i = from; i < to; i += 1) {
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
          matches.push({
            token: text.slice(start, i + 1),
            raw: text.slice(start + 1, i),
            start,
            end: i + 1,
          });
        }
      }
    }

    if (depth === 0) {
      break;
    }

    from = start + 1;
  }

  return matches;
}

/** Rewrites every top-level reference in `text`. */
export function replaceReferences(
  text: string,
  surface: ReferenceSurface,
  replace: (match: ReferenceMatch) => string,
): string {
  const matches = scanReferences(text, surface);
  if (matches.length === 0) {
    return text;
  }

  let result = "";
  let lastEnd = 0;

  for (const match of matches) {
    result += text.slice(lastEnd, match.start) + replace(match);
    lastEnd = match.end;
  }

  return result + text.slice(lastEnd);
}

/** Splits a reference body into its key, its params and its operations. */
export function splitReferenceBody(raw: string): ReferenceChunk[] {
  const chunks: ReferenceChunk[] = [];
  let separator = "";
  let start = 0;
  let depth = 0;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (char === VariableSyntax.BRACE_OPEN) {
      depth += 1;
    } else if (char === VariableSyntax.BRACE_CLOSE) {
      depth -= 1;
    } else if (
      depth === 0 &&
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
