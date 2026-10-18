import { SECRET_MASK } from "@/common/config";
import { CommandSegmentType } from "@/common/enums";
import type { CommandSegment, ResolvedSpan } from "@/common/types";
import { countLines } from "@/utils/string";

import { sourceKey } from "./params";
import { hasUnresolvedSpans } from "./spans";

export function hasUnresolvedSegments(
  segments: readonly CommandSegment[],
): boolean {
  return segments.some(
    (segment) =>
      segment.type === CommandSegmentType.UNRESOLVED ||
      hasUnresolvedSpans(segment.spans),
  );
}

export function isMaskedSegment(
  segment: CommandSegment,
  secretKeys: ReadonlySet<string>,
): boolean {
  return (
    segment.type === CommandSegmentType.RESOLVED &&
    !!segment.key &&
    secretKeys.has(segment.key)
  );
}

/** Whether a span shows a secret's text. */
function isSecretSpan(
  span: ResolvedSpan,
  secretKeys: ReadonlySet<string>,
): boolean {
  return (
    !span.unresolved &&
    ((!!span.source && secretKeys.has(sourceKey(span.source))) ||
      !!span.derivedFrom?.some((key) => secretKeys.has(key)))
  );
}

/**
 * `spans` with each run that shows a secret folded into one `null`, or
 * `spans` itself when none does.
 */
export function maskSpans(
  spans: readonly ResolvedSpan[],
  secretKeys: ReadonlySet<string>,
): readonly (ResolvedSpan | null)[] {
  const first =
    secretKeys.size === 0
      ? -1
      : spans.findIndex((span) => isSecretSpan(span, secretKeys));

  if (first === -1) {
    return spans;
  }

  const shown: (ResolvedSpan | null)[] = spans.slice(0, first);
  shown.push(null);

  let maskDepth = spans[first].depth;

  for (let i = first + 1; i < spans.length; i++) {
    const span = spans[i];
    if (maskDepth !== -1 && span.depth > maskDepth) {
      continue;
    }

    if (!isSecretSpan(span, secretKeys)) {
      maskDepth = -1;
      shown.push(span);
      continue;
    }

    if (maskDepth === -1) {
      shown.push(null);
    }

    maskDepth = span.depth;
  }

  return shown;
}

/** `value`'s text with every secret in it masked. */
export function maskedText(
  { text, spans }: { text: string; spans?: readonly ResolvedSpan[] },
  secretKeys: ReadonlySet<string>,
): string {
  const shown = spans && maskSpans(spans, secretKeys);
  return !shown || shown === spans
    ? text
    : shown.map((span) => (span ? span.text : SECRET_MASK)).join("");
}

export function countCommandLines(
  segments: CommandSegment[],
  secretKeys: ReadonlySet<string>,
): number {
  return segments.reduce(
    (lines, segment) =>
      isMaskedSegment(segment, secretKeys)
        ? lines
        : lines + countLines(maskedText(segment, secretKeys)) - 1,
    1,
  );
}
