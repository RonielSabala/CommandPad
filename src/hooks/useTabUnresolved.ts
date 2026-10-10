import { BlockType } from "@/common/enums";
import type { Block, RunbookBlock, Tab, Variable } from "@/common/types";
import { useStore, type StoreState } from "@/store/store";
import { hasUnresolvedEmbeds } from "@/utils/embeddedRunbook";
import {
  getVariableMap,
  hasUnresolvedReferences,
  type VariableMap,
} from "@/utils/resolution";
import { useCallback, useMemo } from "react";

const NO_RUNBOOK_BLOCKS: RunbookBlock[] = [];

const tabMaps = new WeakMap<readonly Variable[], VariableMap>();

export function getTabVariableMap(variables: Variable[]): VariableMap {
  let map = tabMaps.get(variables);
  if (!map) {
    map = getVariableMap(variables);
    tabMaps.set(variables, map);
  }

  return map;
}

function isRunbookBlock(block: Block): block is RunbookBlock {
  return block.type === BlockType.RUNBOOK;
}

export function useTabUnresolved(tab: Tab): boolean {
  const variableMap = getTabVariableMap(tab.variables);
  const references = useMemo(
    () => hasUnresolvedReferences(tab.blocks, variableMap),
    [tab.blocks, variableMap],
  );
  const runbookBlocks = useMemo(() => {
    const found = tab.blocks.filter(isRunbookBlock);
    return found.length ? found : NO_RUNBOOK_BLOCKS;
  }, [tab.blocks]);

  const embeds = useStore(
    useCallback(
      (state: StoreState) =>
        !references &&
        runbookBlocks.length > 0 &&
        hasUnresolvedEmbeds(
          runbookBlocks,
          state.runbookLibrary,
          state.embeddedRunbooks,
        ),
      [references, runbookBlocks],
    ),
  );

  return references || embeds;
}
