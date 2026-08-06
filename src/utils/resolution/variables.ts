import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";

import type { ReferenceContext } from "./reference";
import { resolveReference } from "./reference";
import { replaceReferences } from "./token";
import type { VariableMap } from "./types";

export function getVariableKey(variable: Variable): string {
  return variable.key.trim();
}

export function isConstantVariableKey(key: string): boolean {
  const trimmed = key.trim();
  return trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
}

export function getVariableMap(variables: Variable[] = []): VariableMap {
  const rawMap: VariableMap = {};
  const resolvedMap: VariableMap = {};

  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (!key) {
      continue;
    }

    rawMap[key] = variable.value;
  }

  const loopedKeys = new Set<string>();

  function resolveValue(key: string, visitedKeys: Set<string>): string {
    if (Object.hasOwn(resolvedMap, key)) {
      return resolvedMap[key];
    }

    let looped = false;

    function lookup(refKey: string): string | undefined {
      if (!Object.hasOwn(rawMap, refKey)) {
        return undefined;
      }

      if (visitedKeys.has(refKey)) {
        looped = true;
        return undefined;
      }

      const text = resolveValue(refKey, new Set(visitedKeys).add(refKey));
      if (loopedKeys.has(refKey)) {
        looped = true;
        return undefined;
      }

      return text;
    }

    const context: ReferenceContext = {
      surface: ReferenceSurface.VALUE,
      lookup,
    };
    const resolved = replaceReferences(
      rawMap[key] ?? "",
      ReferenceSurface.VALUE,
      (match) => resolveReference(match.token, match.raw, context).text,
    );

    if (looped) {
      loopedKeys.add(key);
    }

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
