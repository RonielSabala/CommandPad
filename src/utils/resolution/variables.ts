import { ReferenceSurface } from "@/common/enums";
import type { ResolvedSpan, Variable } from "@/common/types";

import type { ReferenceContext } from "./reference";
import { resolveReference } from "./reference";
import { flatSpans, mergeSpans, nestSpans, spansText } from "./spans";
import { splitReferenceParts } from "./token";
import type { ResolvedValue, VariableMap } from "./types";

export function getVariableKey(variable: Variable): string {
  return variable.key.trim();
}

export function isConstantVariableKey(key: string): boolean {
  const trimmed = key.trim();
  return trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
}

export function getVariableMap(variables: Variable[] = []): VariableMap {
  const rawMap: Record<string, string> = {};
  const resolvedMap: VariableMap = {};

  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (!key) {
      continue;
    }

    rawMap[key] = variable.value;
  }

  const loopedKeys = new Set<string>();

  function resolveValue(key: string, visitedKeys: Set<string>): ResolvedValue {
    if (Object.hasOwn(resolvedMap, key)) {
      return resolvedMap[key];
    }

    let looped = false;

    function lookup(refKey: string): ResolvedValue | undefined {
      if (!Object.hasOwn(rawMap, refKey)) {
        return undefined;
      }

      if (visitedKeys.has(refKey)) {
        looped = true;
        return undefined;
      }

      const value = resolveValue(refKey, new Set(visitedKeys).add(refKey));
      if (loopedKeys.has(refKey)) {
        looped = true;
        return undefined;
      }

      return value;
    }

    const spans: ResolvedSpan[] = [];
    const context: ReferenceContext = {
      surface: ReferenceSurface.VALUE,
      lookup,
    };

    for (const part of splitReferenceParts(
      rawMap[key] ?? "",
      ReferenceSurface.VALUE,
    )) {
      if (!part.match) {
        spans.push(...flatSpans(part.text));
        continue;
      }

      const reference = resolveReference(
        part.match.token,
        part.match.raw,
        context,
      );

      spans.push(
        ...(reference.resolved
          ? nestSpans(reference.spans)
          : flatSpans(reference.text)),
      );
    }

    if (looped) {
      loopedKeys.add(key);
    }

    const merged = mergeSpans(spans);
    const resolved: ResolvedValue = { text: spansText(merged), spans: merged };

    resolvedMap[key] = resolved;
    return resolved;
  }

  for (const key of Object.keys(rawMap)) {
    resolveValue(key, new Set([key]));
  }

  return resolvedMap;
}

export function getSecretKeys(variables: Variable[] = []): Set<string> {
  return new Set(
    variables
      .filter((variable) => variable.secret && getVariableKey(variable))
      .map((variable) => getVariableKey(variable)),
  );
}
