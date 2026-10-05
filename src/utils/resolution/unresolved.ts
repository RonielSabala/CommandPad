import { getBlockCommandTexts } from "@/blocks";
import type { Block } from "@/common/types";

import { hasUnresolvedTokens } from "./command";
import type { VariableMap } from "./types";

const blockResults = new WeakMap<
  Block,
  { variableMap: VariableMap; unresolved: boolean }
>();

function hasUnresolvedBlockReferences(
  block: Block,
  variableMap: VariableMap,
): boolean {
  const cached = blockResults.get(block);
  if (cached?.variableMap === variableMap) {
    return cached.unresolved;
  }

  const unresolved = getBlockCommandTexts(block).some((text) =>
    hasUnresolvedTokens(text, variableMap),
  );

  blockResults.set(block, { variableMap, unresolved });
  return unresolved;
}

export function hasUnresolvedReferences(
  blocks: readonly Block[],
  variableMap: VariableMap,
): boolean {
  return blocks.some((block) =>
    hasUnresolvedBlockReferences(block, variableMap),
  );
}
