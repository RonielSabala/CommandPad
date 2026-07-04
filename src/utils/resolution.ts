import { SegmentType } from "@/common/enums";
import type { Segment, Variable } from "@/common/types";

export type VariableMap = Record<string, string>;

export function getVariableMap(variables: Variable[] = []): VariableMap {
  const rawMap: VariableMap = {};
  const resolvedMap: VariableMap = {};

  for (const variable of variables) {
    const key = variable.key.trim();
    if (!key) {
      continue;
    }
    rawMap[key] = variable.value;
  }

  function resolveValue(key: string, visitedKeys = new Set<string>()): string {
    if (key in resolvedMap) {
      return resolvedMap[key];
    }
    if (visitedKeys.has(key)) {
      return `{${key}}`;
    }

    visitedKeys.add(key);
    const raw = rawMap[key] ?? "";
    const resolved = raw.replace(/\{([^}]+)\}/g, (match, refKey: string) =>
      refKey in rawMap ? resolveValue(refKey, new Set(visitedKeys)) : match,
    );

    resolvedMap[key] = resolved;
    return resolved;
  }

  for (const key of Object.keys(rawMap)) {
    resolveValue(key);
  }

  return resolvedMap;
}

export function getSecretKeys(variables: Variable[] = []): Set<string> {
  return new Set(
    variables.filter((v) => v.secret && v.key.trim()).map((v) => v.key.trim()),
  );
}

//  Split a command into literal / resolved / unresolved segments
export function resolveCommandText(
  rawText: string,
  variableMap: VariableMap,
): Segment[] {
  const segments: Segment[] = [];
  const tokenRegex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: rawText.slice(lastIndex, match.index),
        type: SegmentType.LITERAL,
      });
    }

    const key = match[1];
    if (Object.prototype.hasOwnProperty.call(variableMap, key)) {
      const value = variableMap[key];
      segments.push({
        key,
        text: value || `{${key}}`,
        type: value ? SegmentType.RESOLVED : SegmentType.UNRESOLVED,
      });
    } else {
      segments.push({ text: match[0], type: SegmentType.UNRESOLVED });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < rawText.length) {
    segments.push({
      text: rawText.slice(lastIndex),
      type: SegmentType.LITERAL,
    });
  }

  return segments;
}

// Fully resolved command string
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
    (segment) => segment.type === SegmentType.UNRESOLVED,
  );
}
