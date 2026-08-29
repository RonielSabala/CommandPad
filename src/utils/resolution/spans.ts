import { ReferenceConfig } from "@/common/config";
import type { ResolvedSpan } from "@/common/types";

export function flatSpans(text: string): ResolvedSpan[] {
  return text ? [{ text, depth: 0 }] : [];
}

export function nestSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  return spans.map(({ text, depth }) => ({ text, depth: depth + 1 }));
}

export function spansText(spans: readonly ResolvedSpan[]): string {
  return spans.map((span) => span.text).join("");
}

/** Joins the neighbors sitting at one depth and drops the empty ones. */
export function mergeSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  const merged: ResolvedSpan[] = [];

  for (const span of spans) {
    if (!span.text) {
      continue;
    }

    const last = merged[merged.length - 1];
    if (last && last.depth === span.depth) {
      last.text += span.text;
      continue;
    }

    merged.push({ ...span });
  }

  return merged;
}

export function previewSpans(spans: readonly ResolvedSpan[]): ResolvedSpan[] {
  return mergeSpans(
    spans.map(({ text, depth }) => ({
      text,
      depth: Math.min(depth + 1, ReferenceConfig.MAX_NESTING_DEPTH),
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
        text: span.text.slice(from - at, to - at),
        depth: span.depth,
      });
    }

    at = spanEnd;
    if (at >= end) {
      break;
    }
  }

  return sliced;
}

/** The depth of the character at `index` in the text `spans` describes. */
export function depthAt(spans: readonly ResolvedSpan[], index: number): number {
  let at = 0;

  for (const span of spans) {
    at += span.text.length;
    if (index < at) {
      return span.depth;
    }
  }

  return 0;
}
