import { CommandSegmentType, ReferenceSurface } from "@/common/enums";
import type { CommandSegment } from "@/common/types";

import type { ReferenceContext } from "./reference";
import { resolveReference } from "./reference";
import { previewSpans } from "./spans";
import { scanReferences, unescapeBraces } from "./token";
import type { VariableMap } from "./types";

function commandContext(variableMap: VariableMap): ReferenceContext {
  return {
    surface: ReferenceSurface.COMMAND,
    lookup: (key) =>
      Object.hasOwn(variableMap, key) && variableMap[key].text
        ? variableMap[key]
        : undefined,
  };
}

export function resolveCommandText(
  rawText: string,
  variableMap: VariableMap,
): CommandSegment[] {
  const context = commandContext(variableMap);
  const segments: CommandSegment[] = [];
  let lastEnd = 0;

  function pushLiteral(text: string): void {
    if (text) {
      segments.push({
        text: unescapeBraces(text, ReferenceSurface.COMMAND),
        type: CommandSegmentType.LITERAL,
      });
    }
  }

  for (const match of scanReferences(rawText, ReferenceSurface.COMMAND)) {
    pushLiteral(rawText.slice(lastEnd, match.start));

    const { key, text, resolved, spans } = resolveReference(
      match.token,
      match.raw,
      context,
    );

    segments.push({
      key,
      text,
      type: resolved
        ? CommandSegmentType.RESOLVED
        : CommandSegmentType.UNRESOLVED,
      ...(resolved ? { spans: previewSpans(spans) } : {}),
    });

    lastEnd = match.end;
  }

  pushLiteral(rawText.slice(lastEnd));

  return segments;
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
  return resolveCommandText(rawText, variableMap).some(
    (segment) => segment.type === CommandSegmentType.UNRESOLVED,
  );
}
