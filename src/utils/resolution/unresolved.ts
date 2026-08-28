import { getBlockCommandTexts } from "@/blocks";
import type { Block, Variable } from "@/common/types";

import { hasUnresolvedTokens } from "./command";
import { getVariableMap } from "./variables";

export function hasUnresolvedReferences(
  blocks: Block[] = [],
  variables: Variable[] = [],
): boolean {
  const variableMap = getVariableMap(variables);

  return blocks.some((block) =>
    getBlockCommandTexts(block).some((text) =>
      hasUnresolvedTokens(text, variableMap),
    ),
  );
}
