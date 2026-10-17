import type { Block, Variable } from "@/common/types";
import { getUsedVariableKeys } from "@/utils/resolution";
import { useState } from "react";

interface CachedKeys {
  variables: readonly Variable[];
  keys: Set<string>;
}

const usedKeysCache = new WeakMap<readonly Block[], CachedKeys>();

function cachedUsedKeys(blocks: Block[], variables: Variable[]): Set<string> {
  const cached = usedKeysCache.get(blocks);
  if (cached?.variables === variables) {
    return cached.keys;
  }

  const keys = getUsedVariableKeys(blocks, variables);
  usedKeysCache.set(blocks, { variables, keys });
  return keys;
}

function sameKeys(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }

  for (const key of a) {
    if (!b.has(key)) {
      return false;
    }
  }

  return true;
}

/** The keys a runbook references. */
export function useUsedVariableKeys(
  blocks: Block[],
  variables: Variable[],
): Set<string> {
  const next = cachedUsedKeys(blocks, variables);
  const [kept, setKept] = useState(next);

  if (next !== kept && !sameKeys(next, kept)) {
    setKept(next);
    return next;
  }

  return kept;
}
