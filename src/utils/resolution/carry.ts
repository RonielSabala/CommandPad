import { VariableSyntax } from "@/common/config";
import type { Block, Variable } from "@/common/types";
import { generateId } from "@/utils/id";

import { renameAllVariableTokens } from "./rename";
import { getUsedVariableKeys } from "./usage";
import { getVariableKey } from "./variables";

export function uniqueCopyKey(
  key: string,
  takenKeys: ReadonlySet<string>,
): string {
  const stem = key.replace(VariableSyntax.COPY_SUFFIX_REGEX, "");
  const base = `${stem}${VariableSyntax.COPY_SUFFIX}`;
  let candidate = base;
  let counter = 1; // Copy numbering start

  while (takenKeys.has(candidate)) {
    candidate = `${base}${counter}`;
    counter += 1;
  }

  return candidate;
}

export interface CarriedVariables {
  variables: Variable[];
  renames: Map<string, string>;
}

export function carryVariables(
  blocks: Block[],
  sourceVariables: Variable[],
  targetVariables: Variable[],
): CarriedVariables {
  const usedKeys = getUsedVariableKeys(blocks, sourceVariables);

  const targetByKey = new Map<string, Variable>();
  for (const variable of targetVariables) {
    const key = getVariableKey(variable);
    if (key && !targetByKey.has(key)) {
      targetByKey.set(key, variable);
    }
  }

  // A rename's output can never collide with another carried or renamed key
  const takenKeys = new Set<string>(targetByKey.keys());
  for (const variable of sourceVariables) {
    const key = getVariableKey(variable);
    if (key) {
      takenKeys.add(key);
    }
  }

  const variables: Variable[] = [];
  const renames = new Map<string, string>();

  for (const variable of sourceVariables) {
    const key = getVariableKey(variable);
    if (!key || !usedKeys.has(key)) {
      continue;
    }

    const existing = targetByKey.get(key);
    if (!existing) {
      variables.push({ ...variable, id: generateId() });
      continue;
    }

    const sameDefinition =
      existing.value === variable.value &&
      !!existing.secret === !!variable.secret;

    if (sameDefinition || renames.has(key)) {
      continue;
    }

    const newKey = uniqueCopyKey(key, takenKeys);
    takenKeys.add(newKey);
    renames.set(key, newKey);

    variables.push({ ...variable, id: generateId(), key: newKey });
  }

  if (renames.size === 0) {
    return { variables, renames };
  }

  // Carried values may themselves reference renamed keys
  return {
    variables: variables.map((variable) => {
      const value = renameAllVariableTokens(variable.value, renames);
      return value === variable.value ? variable : { ...variable, value };
    }),
    renames,
  };
}
