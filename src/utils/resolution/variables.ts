import { VariableTokenRegex } from "@/common/config";
import type { Variable } from "@/common/types";

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

  function resolveValue(key: string, visitedKeys = new Set<string>()): string {
    if (key in resolvedMap) {
      return resolvedMap[key];
    }

    if (visitedKeys.has(key)) {
      return `{${key}}`;
    }

    visitedKeys.add(key);
    const raw = rawMap[key] ?? "";
    const resolved = raw.replace(
      VariableTokenRegex,
      (match, rawRef: string) => {
        const refKey = rawRef.trim();
        return refKey in rawMap
          ? resolveValue(refKey, new Set(visitedKeys))
          : match;
      },
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
    variables
      .filter((variable) => variable.secret && getVariableKey(variable))
      .map((variable) => getVariableKey(variable)),
  );
}
