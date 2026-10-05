import { BlockType } from "@/common/enums";
import type { Block, RunbookBlock, Tab } from "@/common/types";
import { useStore, type StoreState } from "@/store/store";
import { hasUnresolvedEmbeds } from "@/utils/embeddedRunbook";
import { getVariableMap, hasUnresolvedReferences } from "@/utils/resolution";
import { useCallback, useMemo } from "react";

const NO_RUNBOOK_BLOCKS: RunbookBlock[] = [];

function isRunbookBlock(block: Block): block is RunbookBlock {
  return block.type === BlockType.RUNBOOK;
}

export function useTabUnresolved(tab: Tab): boolean {
  const variableMap = useMemo(
    () => getVariableMap(tab.variables),
    [tab.variables],
  );
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
