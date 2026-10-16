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
  hasUnresolvedOverrides,
  unresolvedBlockParts,
  unresolvedOverrideParts,
  type UnresolvedPart,
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

const NO_PARTS: UnresolvedPart[] = [];

function isRunbookBlock(block: Block): block is RunbookBlock {
  return block.type === BlockType.RUNBOOK;
}

/** The failing parts of a block's references. */
export function getBlockUnresolvedParts(
  block: Block,
  hostMap: VariableMap,
  secretKeys: ReadonlySet<string>,
  lookup: EmbedLookup,
): UnresolvedPart[] {
  if (!isRunbookBlock(block)) {
    return unresolvedBlockParts(block, hostMap, secretKeys);
  }

  const { overrides } = block;
  const variables = overrides && embeddedVariables(block, lookup);
  return overrides && variables
    ? unresolvedOverrideParts(variables, overrides, hostMap, secretKeys)
    : NO_PARTS;
}

function hasUnresolvedBlockOverrides(
  block: RunbookBlock,
  hostMap: VariableMap,
  lookup: EmbedLookup,
): boolean {
  const { overrides } = block;
  const variables = overrides && embeddedVariables(block, lookup);
  return (
    !!overrides &&
    !!variables &&
    hasUnresolvedOverrides(variables, overrides, hostMap)
  );
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
          runbookBlocks.some((block) =>
            hasUnresolvedBlockOverrides(block, variableMap, state),
          )),
      [references, runbookBlocks, variableMap],
    ),
  );

  return references || embeds;
}
