import { CommandSegmentType, ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";

import { sourceKey } from "./params";
import { hasUnresolvedSpans } from "./spans";
import { getTokenKey, scanReferences } from "./token";
import type { ResolvedValue, VariableMap } from "./types";
import { unresolvedSegmentParts, type UnresolvedPart } from "./unresolved";
import {
  getSecretKeys,
  getVariableKey,
  getVariableMap,
  type OuterScope,
} from "./variables";

export type VariableOverrides = Readonly<Record<string, string>>;

const NO_SECRETS: Set<string> = new Set();
const NO_PARTS: UnresolvedPart[] = [];

export interface OverrideHost {
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

function referencesSecret(text: string, secretKeys: Set<string>): boolean {
  return scanReferences(text, ReferenceSurface.COMMAND).some(
    ({ raw }) =>
      secretKeys.has(getTokenKey(raw)) || referencesSecret(raw, secretKeys),
  );
}

/** The embedded runbook's variables with each override's own text as its value. */
export function applyOverrides(
  variables: Variable[],
  overrides: VariableOverrides | undefined,
  hostSecretKeys: Set<string> = NO_SECRETS,
): Variable[] {
  if (!overrides || Object.keys(overrides).length === 0) {
    return variables;
  }

  return variables.map((variable) => {
    const key = getVariableKey(variable);
    if (!Object.hasOwn(overrides, key)) {
      return variable;
    }

    const raw = overrides[key];
    return {
      ...variable,
      value: raw,
      secret:
        variable.secret ||
        (hostSecretKeys.size > 0 && referencesSecret(raw, hostSecretKeys)),
    };
  });
}

/**
 * The embedded runbook's secret keys, plus each host secret an override
 * carried into `embedded`.
 */
export function overriddenSecretKeys(
  variables: Variable[],
  overrides: VariableOverrides | undefined,
  embedded: VariableMap,
  hostSecretKeys: Set<string>,
): Set<string> {
  const keys = getSecretKeys(variables);
  if (!overrides || hostSecretKeys.size === 0) {
    return keys;
  }

  const reach = (from: string) => {
    if (hostSecretKeys.has(from)) {
      keys.add(from);
    }
  };

  for (const key of Object.keys(overrides)) {
    for (const { source, derivedFrom } of embedded[key]?.spans ?? []) {
      if (source) {
        reach(sourceKey(source));
      }

      derivedFrom?.forEach(reach);
    }
  }

  return keys;
}

/** The host scope the overridden keys among `variables` resolve against. */
export function overrideScope(
  variables: Variable[],
  overrides: VariableOverrides | undefined,
  hostMap: VariableMap,
): OuterScope | undefined {
  if (!overrides) {
    return undefined;
  }

  const keys = new Set<string>();

  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (Object.hasOwn(overrides, key)) {
      keys.add(key);
    }
  }

  return keys.size > 0 ? { keys, variableMap: hostMap } : undefined;
}

interface OverriddenMaps {
  variables: Variable[];
  hostMap: VariableMap;
  embedded: VariableMap;
  lookup?: VariableMap;
  failing?: ResolvedValue[];
}

const overriddenMaps = new WeakMap<VariableOverrides, OverriddenMaps>();

function getOverriddenMaps(
  variables: Variable[],
  overrides: VariableOverrides,
  hostMap: VariableMap,
): OverriddenMaps {
  const cached = overriddenMaps.get(overrides);
  if (cached?.variables === variables && cached.hostMap === hostMap) {
    return cached;
  }

  const overridden = applyOverrides(variables, overrides);
  const maps: OverriddenMaps = {
    variables,
    hostMap,
    embedded: getVariableMap(
      overridden,
      overrideScope(overridden, overrides, hostMap),
    ),
  };

  overriddenMaps.set(overrides, maps);
  return maps;
}

/** The embedded runbook's map once `overrides` are applied from `hostMap`. */
export function getOverriddenVariableMap(
  variables: Variable[],
  overrides: VariableOverrides,
  hostMap: VariableMap,
): VariableMap {
  return getOverriddenMaps(variables, overrides, hostMap).embedded;
}

/** The host's variables, then the embedded runbook's own (overrides applied). */
export function overrideLookupMap(
  variables: Variable[],
  overrides: VariableOverrides,
  hostMap: VariableMap,
): VariableMap {
  const maps = getOverriddenMaps(variables, overrides, hostMap);
  maps.lookup ??= { ...maps.embedded, ...hostMap };
  return maps.lookup;
}

/** The overrides that fail as the value they give their key */
function failingOverrides(
  variables: Variable[],
  overrides: VariableOverrides,
  hostMap: VariableMap,
): ResolvedValue[] {
  const maps = getOverriddenMaps(variables, overrides, hostMap);
  maps.failing ??= Object.keys(overrides).flatMap((key) =>
    Object.hasOwn(maps.embedded, key) &&
    hasUnresolvedSpans(maps.embedded[key].spans)
      ? [maps.embedded[key]]
      : [],
  );

  return maps.failing;
}

export function hasUnresolvedOverrides(
  variables: Variable[],
  overrides: VariableOverrides,
  hostMap: VariableMap,
): boolean {
  return failingOverrides(variables, overrides, hostMap).length > 0;
}

/** The failing parts of each override. */
export function unresolvedOverrideParts(
  variables: Variable[],
  overrides: VariableOverrides,
  hostMap: VariableMap,
  hostSecretKeys: ReadonlySet<string>,
): UnresolvedPart[] {
  const failing = failingOverrides(variables, overrides, hostMap);
  if (failing.length === 0) {
    return NO_PARTS;
  }

  const secretKeys = getSecretKeys(variables);
  hostSecretKeys.forEach((key) => secretKeys.add(key));

  return unresolvedSegmentParts(
    failing.map(({ text, spans }) => ({
      text,
      spans,
      type: CommandSegmentType.RESOLVED,
    })),
    overrideLookupMap(variables, overrides, hostMap),
    secretKeys,
  );
}

/**
 * `overrides` with `key` set to `value`, or dropped when `value` is what the
 * embedded runbook already holds.
 */
export function withOverride(
  overrides: VariableOverrides | undefined,
  key: string,
  value: string,
  original: string,
): Record<string, string> | undefined {
  const next = { ...overrides };
  if (value === original) {
    delete next[key];
  } else {
    next[key] = value;
  }

  return Object.keys(next).length > 0 ? next : undefined;
}
