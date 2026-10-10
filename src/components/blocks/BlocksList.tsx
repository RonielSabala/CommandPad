import { CssClass } from "@/common/constants/css";
import { DataAttr, ElementId, ScrollIntoView } from "@/common/constants/dom";
import type { Block, Variable } from "@/common/types";
import { getActiveTab, useStore } from "@/store/store";
import { scrollRowIntoView, whenElementSettles } from "@/utils/dom";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
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

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  const listRef = useRef<HTMLDivElement>(null);

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

  // Scroll to the block, then flash it once it stops moving
  useEffect(() => {
    if (!pendingRevealBlockId) {
      return;
    }

    let cancelSettle = () => {};
    let frame = 0;

    // A tab switch restores its saved scroll position in one
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const row = listRef.current?.querySelector<HTMLElement>(
          `[${DataAttr.BLOCK_ID}="${pendingRevealBlockId}"]`,
        );

        if (!row) {
          finishBlockReveal();
          return;
        }

        row.scrollIntoView({
          block: ScrollIntoView.BLOCK_CENTER,
          behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
        });

        cancelSettle = whenElementSettles(row, finishBlockReveal);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelSettle();
    };
  }, [pendingRevealBlockId, finishBlockReveal]);

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
