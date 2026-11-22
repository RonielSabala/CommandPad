import { CssClass } from "@/common/constants/css";
import { DataAttr, ElementId, ScrollIntoView } from "@/common/constants/dom";
import { useScopedTab } from "@/components/tabs/tabScope";
import { useCompletionSource } from "@/hooks/useCompletionSource";
import { useRowReveal } from "@/hooks/useRowReveal";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import {
  EMPTY_BLOCKS,
  EMPTY_VARIABLES,
  useStore,
  useStoreActions,
} from "@/store/store";
import { scrollRowIntoView } from "@/utils/dom";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef } from "react";

import { BlockItems } from "./BlockItem";
import "./BlocksList.css";
import { CompletionsContext } from "./listContext";

/** The blocks of the tab in scope. */
export const BlocksList = memo(function BlocksList({
  shown = true,
}: {
  shown?: boolean;
}) {
  const tab = useScopedTab();
  const blocks = tab?.blocks ?? EMPTY_BLOCKS;
  const variables = tab?.variables ?? EMPTY_VARIABLES;

  const pendingFocusBlockId = useStore((state) => state.pendingFocusBlockId);
  const imageViewerBlockId = useStore((state) => state.imageViewerBlockId);
  const pendingRevealBlockId = useStore((state) => state.pendingRevealBlockId);
  const { finishBlockReveal } = useStoreActions();

  const listRef = useRef<HTMLDivElement>(null);
  const usedKeys = useUsedVariableKeys(blocks, variables);
  const completions = useCompletionSource(variables, usedKeys);

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
    shown ? pendingRevealBlockId : null,
    finishBlockReveal,
  );

  return (
    <CompletionsContext.Provider value={completions}>
      <div
        id={shown ? ElementId.BLOCKS_LIST : undefined}
        className={classNames(CssClass.BLOCKS_LIST, CssClass.REORDER_LIST)}
        ref={listRef}
      >
        <BlockItems blocks={blocks} variables={variables} />
      </div>
    </CompletionsContext.Provider>
  );
});
