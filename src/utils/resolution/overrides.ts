import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";

import { resolveCommandToString } from "./command";
import { getTokenKey, scanReferences } from "./token";
import type { VariableMap } from "./types";
import { getVariableKey } from "./variables";

export type VariableOverrides = Readonly<Record<string, string>>;

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

/** The embedded runbook's variables with each override applied. */
export function applyOverrides(
  variables: Variable[],
  overrides: VariableOverrides | undefined,
  host: OverrideHost,
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
      value: resolveCommandToString(raw, host.variableMap),
      secret: variable.secret || referencesSecret(raw, host.secretKeys),
    };
  });
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
