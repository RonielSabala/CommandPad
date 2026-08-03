import { DataAttr, ElementId, ScrollIntoView } from "@/common/constants/dom";
import type { Block, Variable } from "@/common/types";
import { getActiveTab, useStore } from "@/store/store";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
import { useEffect, useMemo, useRef } from "react";
import { BlockItem } from "./BlockItem";
import "./BlocksList.css";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];

function scrollToBlock(
  list: HTMLElement | null,
  blockId: string | null,
  align: ScrollLogicalPosition,
): void {
  if (!blockId) {
    return;
  }

  list?.querySelector(`[${DataAttr.BLOCK_ID}="${blockId}"]`)?.scrollIntoView({
    block: align,
    behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
  });
}

export function BlocksList() {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const pendingFocusBlockId = useStore((state) => state.pendingFocusBlockId);
  const imageViewerBlockId = useStore((state) => state.imageViewerBlockId);

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBlock(
      listRef.current,
      pendingFocusBlockId,
      ScrollIntoView.BLOCK_CENTER,
    );
  }, [pendingFocusBlockId]);

  useEffect(() => {
    scrollToBlock(
      listRef.current,
      imageViewerBlockId,
      ScrollIntoView.BLOCK_START,
    );
  }, [imageViewerBlockId]);

  return (
    <div id={ElementId.BLOCKS_LIST} ref={listRef}>
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          variableMap={variableMap}
          secretKeys={secretKeys}
        />
      ))}
    </div>
  );
}
