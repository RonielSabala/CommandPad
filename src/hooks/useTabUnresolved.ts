import { BlockType } from "@/common/enums";
import type { Block, RunbookBlock, Tab, Variable } from "@/common/types";
import { useStore, type StoreState } from "@/store/store";
import {
  embeddedVariables,
  hasUnresolvedEmbeds,
  type EmbedLookup,
} from "@/utils/embeddedRunbook";
import {
  getVariableMap,
  hasUnresolvedBlockReferences,
  overrideLookupMap,
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

/** The map a block's references resolve against. */
export function getBlockLookupMap(
  block: Block,
  hostMap: VariableMap,
  lookup: EmbedLookup,
): VariableMap | null {
  if (block.type !== BlockType.RUNBOOK || !block.overrides) {
    return hostMap;
  }

  const variables = embeddedVariables(block, lookup);
  return variables && overrideLookupMap(variables, block.overrides, hostMap);
}

function isRunbookBlock(block: Block): block is RunbookBlock {
  return block.type === BlockType.RUNBOOK;
}

export function useTabUnresolved(tab: Tab): boolean {
  const variableMap = getTabVariableMap(tab.variables);
  const references = useMemo(
    () =>
      tab.blocks.some(
        (block) =>
          !isRunbookBlock(block) &&
          hasUnresolvedBlockReferences(block, variableMap),
      ),
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
        (hasUnresolvedEmbeds(
          runbookBlocks,
          state.runbookLibrary,
          state.embeddedRunbooks,
        ) ||
          runbookBlocks.some((block) => {
            const map = getBlockLookupMap(block, variableMap, state);
            return !!map && hasUnresolvedBlockReferences(block, map);
          })),
      [references, runbookBlocks, variableMap],
    ),
  );

  return references || embeds;
}
