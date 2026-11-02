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

function blockReferences(block: Block, key: string): boolean {
  return getBlockCommandTexts(block).some((text) =>
    getReferencedKeys(text, ReferenceSurface.COMMAND).has(key),
  );
}

/** How many blocks and variable values reference `key` themselves. */
export function countReferencesTo(
  key: string,
  blocks: Block[],
  variables: Variable[],
): { blocks: number; variables: number } {
  return {
    blocks: blocks.filter((block) => blockReferences(block, key)).length,
    variables: variables.filter((variable) =>
      [variable.value, ...(variable.options ?? [])].some((text) =>
        getReferencedKeys(text, ReferenceSurface.VALUE).has(key),
      ),
    ).length,
  };
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
