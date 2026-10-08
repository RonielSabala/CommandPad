import { CommandSegmentType } from "@/common/enums";
import type { CommandSegment } from "@/common/types";
import { countLines } from "@/utils/string";

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

export function countCommandLines(
  segments: CommandSegment[],
  secretKeys: ReadonlySet<string>,
): number {
  return segments.reduce(
    (lines, segment) =>
      isMaskedSegment(segment, secretKeys)
        ? lines
        : lines + countLines(segment.text) - 1,
    1,
  );
}
