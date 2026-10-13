import { getBlockCommandTexts } from "@/blocks";
import { SECRET_MASK } from "@/common/config";
import { CommandSegmentType, UnresolvedCause } from "@/common/enums";
import type { Block, ResolvedSpan } from "@/common/types";

import { findUnresolvedOffset, resolveCommandSegments } from "./command";
import { sourceKey } from "./params";
import { hasUnresolvedSpans } from "./spans";
import type { VariableMap } from "./types";

const blockResults = new WeakMap<
  Block,
  { variableMap: VariableMap; text: string | null }
>();

/** A block's raw text from its first unresolved reference on. */
export function unresolvedBlockText(
  block: Block,
  variableMap: VariableMap,
): string | null {
  const cached = blockResults.get(block);
  if (cached?.variableMap === variableMap) {
    return cached.text;
  }

  let text: string | null = null;
  for (const command of getBlockCommandTexts(block)) {
    const start = findUnresolvedOffset(command, variableMap);
    if (start !== -1) {
      text = command.slice(start);
      break;
    }
  }

  blockResults.set(block, { variableMap, text });
  return text;
}

export function hasUnresolvedBlockReferences(
  block: Block,
  variableMap: VariableMap,
): boolean {
  return unresolvedBlockText(block, variableMap) !== null;
}

export function hasUnresolvedReferences(
  blocks: readonly Block[],
  variableMap: VariableMap,
): boolean {
  return blocks.some((block) =>
    hasUnresolvedBlockReferences(block, variableMap),
  );
}

export interface UnresolvedPart {
  cause: Exclude<UnresolvedCause, typeof UnresolvedCause.MISSING_RUNBOOK>;
  source: string;
  text: string;
}

interface Failure {
  source?: string;
  text: string;
}

function classify(
  source: string,
  variableMap: VariableMap,
): UnresolvedPart["cause"] {
  if (!source) {
    return UnresolvedCause.FAILED;
  }

  if (sourceKey(source) !== source) {
    return UnresolvedCause.BLANK;
  }

  if (!Object.hasOwn(variableMap, source)) {
    return UnresolvedCause.UNDEFINED;
  }

  return variableMap[source].text
    ? UnresolvedCause.FAILED
    : UnresolvedCause.EMPTY;
}

/** The failing references in a segment's spans. */
function* spanFailures(
  spans: readonly ResolvedSpan[],
  secretKeys: ReadonlySet<string>,
): Generator<Failure> {
  const shown = (span: ResolvedSpan) =>
    !span.unresolved && span.source && secretKeys.has(sourceKey(span.source))
      ? SECRET_MASK
      : span.text;

  const pieces = new Set<number>();

  for (const [start, span] of spans.entries()) {
    if (!span.unresolved || pieces.has(start)) {
      continue;
    }

    let text = span.text;
    let end = start;
    let wraps = false;

    for (
      let next = start + 1;
      next < spans.length && spans[next].depth >= span.depth;
      next++
    ) {
      const candidate = spans[next];
      if (candidate.depth > span.depth || !candidate.unresolved) {
        continue;
      }

      if (candidate.source !== span.source) {
        break;
      }

      const inner = spans.slice(end + 1, next);
      wraps ||= hasUnresolvedSpans(inner);
      text += inner.map(shown).join("") + candidate.text;
      pieces.add(next);
      end = next;
    }

    if (!wraps) {
      yield { source: span.source, text };
    }
  }
}

export function unresolvedParts(
  rawText: string,
  variableMap: VariableMap,
  secretKeys: ReadonlySet<string>,
): UnresolvedPart[] {
  const parts: UnresolvedPart[] = [];

  for (const segment of resolveCommandSegments(rawText, variableMap)) {
    const failures = hasUnresolvedSpans(segment.spans)
      ? spanFailures(segment.spans ?? [], secretKeys)
      : segment.type === CommandSegmentType.UNRESOLVED
        ? [{ source: segment.key, text: segment.text }]
        : [];

    for (const { source = "", text } of failures) {
      parts.push({ cause: classify(source, variableMap), source, text });
    }
  }

  return parts;
}

export function unresolvedBlockParts(
  block: Block,
  variableMap: VariableMap,
  secretKeys: ReadonlySet<string>,
): UnresolvedPart[] {
  return getBlockCommandTexts(block).flatMap((command) =>
    unresolvedParts(command, variableMap, secretKeys),
  );
}
