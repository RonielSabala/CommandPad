import { CommandSegmentType, ReferenceSurface } from "@/common/enums";
import type { CommandSegment } from "@/common/types";

import type { ReferenceContext } from "./reference";
import { resolveReference } from "./reference";
import { hasUnresolvedSegments } from "./segments";
import { hasUnresolvedSpans, previewSpans } from "./spans";
import { scanReferences, unescapeBraces } from "./token";
import type { VariableMap } from "./types";

function commandContext(variableMap: VariableMap): ReferenceContext {
  return {
    surface: ReferenceSurface.COMMAND,
    lookup: (key) =>
      Object.hasOwn(variableMap, key) ? variableMap[key] : undefined,
  };
}

function literalSegment(text: string): CommandSegment {
  return {
    text: unescapeBraces(text, ReferenceSurface.COMMAND),
    type: CommandSegmentType.LITERAL,
  };
}

export function* resolveCommandSegments(
  rawText: string,
  variableMap: VariableMap,
): Generator<CommandSegment> {
  const context = commandContext(variableMap);
  let lastEnd = 0;

  for (const match of scanReferences(rawText, ReferenceSurface.COMMAND)) {
    if (match.start > lastEnd) {
      yield literalSegment(rawText.slice(lastEnd, match.start));
    }

    const { key, text, resolved, spans } = resolveReference(
      match.token,
      match.raw,
      context,
    );

    yield {
      key,
      text,
      type: resolved
        ? CommandSegmentType.RESOLVED
        : CommandSegmentType.UNRESOLVED,
      spans: previewSpans(spans),
    };

    lastEnd = match.end;
  }

  if (lastEnd < rawText.length) {
    yield literalSegment(rawText.slice(lastEnd));
  }
}

export function resolveCommandText(
  rawText: string,
  variableMap: VariableMap,
): CommandSegment[] {
  return Array.from(resolveCommandSegments(rawText, variableMap));
}

export function resolveCommandToString(
  rawText: string,
  variableMap: VariableMap,
): string {
  return resolveCommandText(rawText, variableMap)
    .map((segment) => segment.text)
    .join("");
}

export function hasUnresolvedTokens(
  rawText: string,
  variableMap: VariableMap,
): boolean {
  return hasUnresolvedSegments(resolveCommandText(rawText, variableMap));
}

/** Where the first reference that doesn't fully resolve starts. */
export function findUnresolvedOffset(
  rawText: string,
  variableMap: VariableMap,
): number {
  const context = commandContext(variableMap);

  for (const match of scanReferences(rawText, ReferenceSurface.COMMAND)) {
    const { resolved, spans } = resolveReference(
      match.token,
      match.raw,
      context,
    );

    if (!resolved || hasUnresolvedSpans(spans)) {
      return match.start;
    }
  }

  return -1;
}
