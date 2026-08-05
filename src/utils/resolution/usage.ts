import { getBlockCommandTexts } from "@/blocks";
import type { Block, Variable } from "@/common/types";
import {
  CommandVariableTokenRegex,
  VariableTokenRegex,
} from "@/common/variableSyntax";

import { getTokenKey } from "./token";
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

  function collectRefs(text: string, tokenRegex: RegExp): void {
    for (const match of text.matchAll(tokenRegex)) {
      const raw = match[1];
      const key = getTokenKey(raw);
      if (key) {
        pending.push(key);
      }

      // Nested refs inside param values
      for (const inner of raw.matchAll(VariableTokenRegex)) {
        const innerKey = getTokenKey(inner[1]);
        if (innerKey) {
          pending.push(innerKey);
        }
      }
    }
  }

  for (const block of blocks) {
    for (const text of getBlockCommandTexts(block)) {
      collectRefs(text, CommandVariableTokenRegex);
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
      collectRefs(rawValues[key], VariableTokenRegex);
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
