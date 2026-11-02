import { getBlockCommandTexts } from "@/blocks";
import { ReferenceSurface } from "@/common/enums";
import type { Block, Variable } from "@/common/types";

import { getTokenKey, scanReferences } from "./token";
import { getVariableKey } from "./variables";

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

/** How many blocks and variable values reference `key` themselves. */
export function countReferencesTo(
  key: string,
  blocks: Block[],
  variables: Variable[],
): { blocks: number; variables: number } {
  const valueReferences = (text: string) =>
    referencesKey(text, ReferenceSurface.VALUE, key);

  const counts = { blocks: 0, variables: 0 };

  for (const block of blocks) {
    if (
      getBlockCommandTexts(block).some((text) =>
        referencesKey(text, ReferenceSurface.COMMAND, key),
      )
    ) {
      counts.blocks++;
    }
  }

  for (const { value, options } of variables) {
    if (valueReferences(value) || options?.some(valueReferences)) {
      counts.variables++;
    }
  }

  return counts;
}

export function getUsedVariableKeys(
  blocks: Block[] = [],
  variables: Variable[] = [],
): Set<string> {
  const rawValues: Record<string, string> = {};
  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (key) {
      rawValues[key] = variable.value;
    }
  }

  const pending: string[] = [];

  for (const block of blocks) {
    for (const text of getBlockCommandTexts(block)) {
      pending.push(...referencedKeys(text, ReferenceSurface.COMMAND));
    }
  }

  const used = new Set<string>();
  while (pending.length > 0) {
    const key = pending.pop() as string;
    if (used.has(key)) {
      continue;
    }

    used.add(key);
    if (key in rawValues) {
      pending.push(...referencedKeys(rawValues[key], ReferenceSurface.VALUE));
    }
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
