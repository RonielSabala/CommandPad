import { getBlockCommandTexts } from "@/blocks";
import { ReferenceSurface } from "@/common/enums";
import type { Block, Variable } from "@/common/types";

import { getTokenKey, scanReferences } from "./token";
import { getVariableKey } from "./variables";

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

  function collectRefs(text: string, surface: ReferenceSurface): void {
    for (const { raw } of scanReferences(text, surface)) {
      const key = getTokenKey(raw);
      if (key) {
        pending.push(key);
      }

      collectRefs(raw, surface);
    }
  }

  for (const block of blocks) {
    for (const text of getBlockCommandTexts(block)) {
      collectRefs(text, ReferenceSurface.COMMAND);
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
      collectRefs(rawValues[key], ReferenceSurface.VALUE);
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
