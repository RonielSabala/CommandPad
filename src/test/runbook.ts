import type { CommandSegment, Variable } from "@/common/types";
import type { VariableMap } from "@/utils/resolution";
import {
  getSecretKeys,
  getVariableMap,
  hasUnresolvedTokens,
  resolveCommandText,
  resolveCommandToString,
} from "@/utils/resolution";
import { isString } from "@/utils/typeGuards";

const SECRET = Symbol("secret");

interface SecretValue {
  [SECRET]: true;
  value: string;
}

/** Marks a spec value as a secret variable. */
export function secret(value: string): SecretValue {
  return { [SECRET]: true, value };
}

function isSecret(value: string | SecretValue): value is SecretValue {
  return !isString(value);
}

/** A runbook's variables. */
export type VariableSpec = Record<string, string | SecretValue>;

export interface TestRunbook {
  variables: Variable[];
  values: Record<string, string>;
  secrets: Set<string>;
  resolve(command: string): string;
  segments(command: string): CommandSegment[];
  hasUnresolved(command: string): boolean;
}

export function buildVariables(spec: VariableSpec = {}): Variable[] {
  return Object.entries(spec).map(([key, entry], index) => ({
    id: `variable-${index + 1}`,
    key,
    value: isSecret(entry) ? entry.value : entry,
    ...(isSecret(entry) ? { secret: true } : {}),
  }));
}

export function variableValues(map: VariableMap): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, value.text]),
  );
}

export function runbook(spec: VariableSpec = {}): TestRunbook {
  const variables = buildVariables(spec);
  const map = getVariableMap(variables);
  const values = variableValues(map);
  const secrets = getSecretKeys(variables);

  return {
    variables,
    values,
    secrets,
    resolve: (command) => resolveCommandToString(command, map),
    segments: (command) => resolveCommandText(command, map),
    hasUnresolved: (command) => hasUnresolvedTokens(command, map),
  };
}
