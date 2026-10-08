import { ReferenceConfig } from "@/common/config";
import type { ResolvedSpan } from "@/common/types";

export function flatSpans(text: string, source?: string): ResolvedSpan[] {
  return text ? [{ text, depth: 0, source }] : [];
}

export function unresolvedSpans(
  text: string,
  depth = 0,
  source?: string,
): ResolvedSpan[] {
  return text ? [{ text, depth, source, unresolved: true }] : [];
}

export function hasUnresolvedSpans(
  spans: readonly ResolvedSpan[] = [],
): boolean {
  return spans.some((span) => span.unresolved);
}

/** Whether an unresolved span falls outside `[start, end)` of the text `spans` describes. */
export function hasUnresolvedOutside(
  spans: readonly ResolvedSpan[],
  start: number,
  end: number,
): boolean {
  let at = 0;

  for (const span of spans) {
    const spanEnd = at + span.text.length;
    if (span.unresolved && (at < start || spanEnd > end)) {
      return true;
    }

    at = spanEnd;
  }

  return false;
}

export function nestSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  return spans.map((span) => ({ ...span, depth: span.depth + 1 }));
}

export function spansText(spans: readonly ResolvedSpan[]): string {
  return spans.map((span) => span.text).join("");
}

/** Joins the neighbors sitting at one depth under one source and drops the empty ones. */
export function mergeSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  const merged: ResolvedSpan[] = [];

  for (const span of spans) {
    if (!span.text) {
      continue;
    }

    const last = merged[merged.length - 1];
    if (
      last &&
      last.depth === span.depth &&
      last.source === span.source &&
      last.unresolved === span.unresolved
    ) {
      last.text += span.text;
      continue;
    }

    merged.push({ ...span });
  }

  return merged;
}

export function previewSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  return mergeSpans(
    spans.map((span) => ({
      ...span,
      depth: Math.min(span.depth + 1, ReferenceConfig.MAX_NESTING_DEPTH),
    })),
  );
}

/** The spans covering `[start, end)` of the text `spans` describes. */
export function sliceSpans(
  spans: readonly ResolvedSpan[],
  start: number,
  end: number,
): ResolvedSpan[] {
  const sliced: ResolvedSpan[] = [];
  let at = 0;

  for (const span of spans) {
    const spanEnd = at + span.text.length;
    const from = Math.max(start, at);
    const to = Math.min(end, spanEnd);

    if (to > from) {
      sliced.push({
        ...span,
        text: span.text.slice(from - at, to - at),
      });
    }

    at = spanEnd;
    if (at >= end) {
      break;
    }
  }

  return sliced;
}

/** The span covering the character at `index` in the text `spans` describes. */
export function spanAt(
  spans: readonly ResolvedSpan[],
  index: number,
): ResolvedSpan | undefined {
  let at = 0;

  for (const span of spans) {
    at += span.text.length;
    if (index < at) {
      return span;
    }
  }

  return undefined;
}

/** The spans of the trimmed text `spans` describes. */
export function trimSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  const text = spansText(spans);
  const start = text.length - text.trimStart().length;
  const end = text.trimEnd().length;

  return end > start ? sliceSpans(spans, start, end) : [];
}
