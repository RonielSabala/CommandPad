import { getBlockCommandTexts } from "@/blocks";
import { ReferenceSurface } from "@/common/enums";
import type { Block, Variable } from "@/common/types";

import { getTokenKey, scanReferences } from "./token";
import { cachedPerVariables, getVariableKey } from "./variables";

/** Every key `text` references. */
function* referencedKeys(
  text: string,
  surface: ReferenceSurface,
): Generator<string> {
  for (const { raw } of scanReferences(text, surface)) {
    const key = getTokenKey(raw);
    if (key) {
      yield key;
    }

    yield* referencedKeys(raw, surface);
  }
}

/** The distinct keys `text` references. */
export function getReferencedKeys(
  text: string,
  surface: ReferenceSurface,
): Set<string> {
  return new Set(referencedKeys(text, surface));
}

/** Whether `text` references any key. */
export function hasReferencedKeys(
  text: string,
  surface: ReferenceSurface,
): boolean {
  return !referencedKeys(text, surface).next().done;
}

function referencesKey(
  text: string,
  surface: ReferenceSurface,
  key: string,
): boolean {
  for (const referenced of referencedKeys(text, surface)) {
    if (referenced === key) {
      return true;
    }
  }

  return false;
}

interface References {
  blocks: Block[];
  variables: Variable[];
}

/** The blocks and variable values that reference `key` themselves. */
export function findReferencesTo(
  key: string,
  blocks: Block[],
  variables: Variable[],
): References {
  const valueReferences = (text: string) =>
    referencesKey(text, ReferenceSurface.VALUE, key);

  return {
    blocks: blocks.filter((block) =>
      getBlockCommandTexts(block).some((text) =>
        referencesKey(text, ReferenceSurface.COMMAND, key),
      ),
    ),
    variables: variables.filter(
      ({ value, options }) =>
        valueReferences(value) || options?.some(valueReferences),
    ),
  };
}

export interface DefinedKeys {
  variables: Variable[];
  missing: string[];
}

/** The variables defining `keys` and the keys none defines. */
export function lookupVariables(
  keys: ReadonlySet<string>,
  variables: Variable[],
): DefinedKeys {
  const defined = new Set<string>();
  const found = variables.filter((variable) => {
    const key = getVariableKey(variable);
    if (!keys.has(key) || defined.has(key)) {
      return false;
    }

    defined.add(key);
    return true;
  });

  return {
    variables: found,
    missing: [...keys].filter((key) => !defined.has(key)).sort(),
  };
}

const blockKeys = new WeakMap<Block, readonly string[]>();

/** The keys `block`'s own texts reference. */
function getBlockKeys(block: Block): readonly string[] {
  let keys = blockKeys.get(block);
  if (!keys) {
    keys = getBlockCommandTexts(block).flatMap((text) => [
      ...referencedKeys(text, ReferenceSurface.COMMAND),
    ]);

    blockKeys.set(block, keys);
  }

  return keys;
}

/** The keys each variable's value references. */
const getValueKeys = cachedPerVariables((variables) => {
  const values = new Map<string, string>();

  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (key) {
      values.set(key, variable.value);
    }
  }

  const read = new Map<string, readonly string[]>();

  return (key: string): readonly string[] => {
    let keys = read.get(key);
    if (!keys) {
      const value = values.get(key);
      keys = value ? [...referencedKeys(value, ReferenceSurface.VALUE)] : [];
      read.set(key, keys);
    }

    return keys;
  };
});

export function getUsedVariableKeys(
  blocks: Block[] = [],
  variables: Variable[] = [],
): Set<string> {
  const valueKeys = getValueKeys(variables);
  const pending = blocks.flatMap(getBlockKeys);

  const used = new Set<string>();
  while (pending.length > 0) {
    const key = pending.pop() as string;
    if (used.has(key)) {
      continue;
    }

    used.add(key);
    pending.push(...valueKeys(key));
  }

  return used;
}

export function isVariableUnused(
  variable: Variable,
  usedKeys: Set<string>,
): boolean {
  const key = getVariableKey(variable);
  return !!key && !usedKeys.has(key);
}
