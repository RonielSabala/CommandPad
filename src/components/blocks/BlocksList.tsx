import { CssClass } from "@/common/constants/css";
import { DataAttr, ElementId, ScrollIntoView } from "@/common/constants/dom";
import type { Block, Variable } from "@/common/types";
import { useRowReveal } from "@/hooks/useRowReveal";
import { getTabVariableMap } from "@/hooks/useTabUnresolved";
import { getActiveTab, useStore } from "@/store/store";
import { scrollRowIntoView } from "@/utils/dom";
import { getSecretKeys } from "@/utils/resolution";
import { useEffect, useMemo, useRef } from "react";

import { BlockItem } from "./BlockItem";
import "./BlocksList.css";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];

export function BlocksList() {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const pendingFocusBlockId = useStore((state) => state.pendingFocusBlockId);
  const imageViewerBlockId = useStore((state) => state.imageViewerBlockId);
  const pendingRevealBlockId = useStore((state) => state.pendingRevealBlockId);
  const finishBlockReveal = useStore((state) => state.finishBlockReveal);

  const listRef = useRef<HTMLDivElement>(null);
  const variableMap = getTabVariableMap(variables);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  useEffect(() => {
    scrollRowIntoView(
      listRef.current,
      DataAttr.BLOCK_ID,
      pendingFocusBlockId,
      ScrollIntoView.BLOCK_CENTER,
    );
  }, [pendingFocusBlockId]);

  useEffect(() => {
    scrollRowIntoView(
      listRef.current,
      DataAttr.BLOCK_ID,
      imageViewerBlockId,
      ScrollIntoView.BLOCK_START,
    );
  }, [imageViewerBlockId]);

  useRowReveal(
    listRef,
    DataAttr.BLOCK_ID,
    pendingRevealBlockId,
    finishBlockReveal,
  );

  return (
    <div
      id={ElementId.BLOCKS_LIST}
      className={CssClass.BLOCKS_LIST}
      ref={listRef}
    >
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
