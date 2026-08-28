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
