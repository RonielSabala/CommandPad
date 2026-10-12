import { getBlockCommandTexts } from "@/blocks";
import type { Block } from "@/common/types";

import { findUnresolvedOffset } from "./command";
import type { VariableMap } from "./types";

const blockResults = new WeakMap<
  Block,
  { variableMap: VariableMap; text: string | null }
>();

/** A block's raw text from its first unresolved reference on. */
export function unresolvedBlockText(
  block: Block,
  variableMap: VariableMap,
): string | null {
  const cached = blockResults.get(block);
  if (cached?.variableMap === variableMap) {
    return cached.text;
  }

  let text: string | null = null;
  for (const command of getBlockCommandTexts(block)) {
    const start = findUnresolvedOffset(command, variableMap);
    if (start !== -1) {
      text = command.slice(start);
      break;
    }
  }

  blockResults.set(block, { variableMap, text });
  return text;
}

export function hasUnresolvedBlockReferences(
  block: Block,
  variableMap: VariableMap,
): boolean {
  return unresolvedBlockText(block, variableMap) !== null;
}

export function hasUnresolvedReferences(
  blocks: readonly Block[],
  variableMap: VariableMap,
): boolean {
  return blocks.some((block) =>
    hasUnresolvedBlockReferences(block, variableMap),
  );
}
