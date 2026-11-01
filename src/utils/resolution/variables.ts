import { ReferenceSurface } from "@/common/enums";
import type { ResolvedSpan, Variable } from "@/common/types";

import type { ReferenceContext } from "./reference";
import { resolveReference } from "./reference";
import {
  flatSpans,
  literalGroupSpans,
  mergeSpans,
  nestSpans,
  spansText,
} from "./spans";
import { splitReferenceParts } from "./token";
import type { ResolvedValue, VariableLookup, VariableMap } from "./types";

export function getVariableKey(variable: Variable): string {
  return variable.key.trim();
}

export function isConstantVariableKey(key: string): boolean {
  const trimmed = key.trim();
  return trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
}

/** Another runbook's variables, read first by the values of `keys`. */
export interface OuterScope {
  keys: ReadonlySet<string>;
  variableMap: VariableMap;
}

/** `raw` resolved as `key`'s value. */
function resolveValueText(
  raw: string,
  key: string,
  context: ReferenceContext,
): ResolvedValue {
  const spans: ResolvedSpan[] = [];

  for (const part of splitReferenceParts(raw, ReferenceSurface.VALUE)) {
    if (!part.match) {
      spans.push(...flatSpans(part.text, key));
      continue;
    }

    const reference = resolveReference(
      part.match.token,
      part.match.raw,
      context,
    );

    spans.push(
      ...(reference.isReference
        ? nestSpans(reference.spans)
        : literalGroupSpans(reference.spans, key)),
    );
  }

  const merged = mergeSpans(spans);
  return { text: spansText(merged), spans: merged };
}

export function getVariableMap(
  variables: Variable[] = [],
  outer?: OuterScope,
): VariableMap {
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
    const outerMap = outer?.keys.has(key) ? outer.variableMap : undefined;

    function lookup(refKey: string): ResolvedValue | undefined {
      if (outerMap && Object.hasOwn(outerMap, refKey)) {
        return outerMap[refKey];
      }

      if (!Object.hasOwn(rawMap, refKey)) {
        return undefined;
      }

      if (visitedKeys.has(refKey)) {
        looped = true;
        return undefined;
      }

      visitedKeys.add(refKey);
      const value = resolveValue(refKey, visitedKeys);
      visitedKeys.delete(refKey);

      if (loopedKeys.has(refKey)) {
        looped = true;
        return undefined;
      }

      return value;
    }

    const resolved = resolveValueText(rawMap[key] ?? "", key, {
      surface: ReferenceSurface.VALUE,
      lookup,
    });

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

/** What `option` resolves to once chosen as `key`'s value. */
export function resolveOptionValue(
  option: string,
  key: string,
  lookup: VariableLookup,
): ResolvedValue {
  return resolveValueText(option, key, {
    surface: ReferenceSurface.VALUE,
    lookup: (refKey) => (refKey === key ? undefined : lookup(refKey)),
  });
}

export function getSecretKeys(variables: Variable[] = []): Set<string> {
  const keys = new Set<string>();

  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (variable.secret && key) {
      keys.add(key);
    }
  }

  return keys;
}
