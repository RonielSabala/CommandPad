import { BlockType } from "@/common/enums";
import type { Block, Variable } from "@/common/types";

import type { VariableScope } from "./types";
import { getUsedVariableKeys } from "./usage";
import { getTabScope, sameResolvedValue } from "./variables";

interface KeptScope {
  /** The scope the block renders with. */
  scope: VariableScope;
  /** The tab scope it was last checked against. */
  checked: VariableScope;
}

const blockScopes = new WeakMap<Block, KeptScope>();

function readsSame(
  kept: VariableScope,
  scope: VariableScope,
  keys: Iterable<string>,
): boolean {
  for (const key of keys) {
    if (
      kept.secretKeys.has(key) !== scope.secretKeys.has(key) ||
      !sameResolvedValue(kept.variableMap, scope.variableMap, key)
    ) {
      return false;
    }
  }

  return true;
}

/** The scope `block` renders with. */
export function getBlockScope(
  block: Block,
  variables: Variable[],
): VariableScope {
  const scope = getTabScope(variables);

  // An embed's overrides and options may read any host key
  if (block.type === BlockType.RUNBOOK) {
    return scope;
  }

  const kept = blockScopes.get(block);
  if (kept?.checked === scope) {
    return kept.scope;
  }

  const same =
    kept &&
    readsSame(kept.scope, scope, getUsedVariableKeys([block], variables));

  const next = same ? kept.scope : scope;
  blockScopes.set(block, { scope: next, checked: scope });

  return next;
}
