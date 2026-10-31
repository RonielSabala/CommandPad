import { DRAG_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { AppMode, LassoMode, SelectionGroup } from "@/common/enums";
import { DragHandle } from "@/components/common/DragHandle";
import { blockDrag, clearBlockDrag } from "@/hooks/blockDrag";
import { lasso } from "@/hooks/lasso";
import { getActiveTab, useStore, useStoreApi } from "@/store/store";
import { applyDragImage } from "@/utils/dom";
import { classNames } from "@/utils/string";
import { memo, useRef, useState } from "react";

import { BlockActionsMenu } from "./BlockActionsMenu";
import "./BlockItem.css";
import { getBlockComponent, type BlockViewProps } from "./blockViews";

type Props = BlockViewProps;

export const BlockItem = memo(function BlockItem({
  block,
  variableMap,
  secretKeys,
}: Props) {
  const store = useStoreApi();
  const isSelected = useStore((state) => state.selectedBlockIds.has(block.id));
  const isFlashing = useStore((state) => state.flashBlockIds.has(block.id));
  const clearFlash = useStore((state) => state.clearFlash);
  const isRevealed = useStore((state) => state.revealedBlockId === block.id);
  const clearBlockReveal = useStore((state) => state.clearBlockReveal);
  const reorderBlocks = useStore((state) => state.reorderBlocks);
  const setBlockSelected = useStore((state) => state.setBlockSelected);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const BlockView = getBlockComponent(block.type);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  return (
    <div
      className={classNames(
        CssClass.BLOCK_ITEM,
        dragging && CssClass.DRAGGING,
        dragOver && CssClass.DRAG_OVER,
        isFlashing && CssClass.DUPLICATE_FLASH,
        isRevealed && CssClass.ROW_REVEAL,
        isSelected && "block-selected",
      )}
      {...{ [DataAttr.BLOCK_ID]: block.id }}
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) {
          event.preventDefault();
          return;
        }

        const state = store.getState();

        blockDrag.srcId = block.id;
        blockDrag.sourceTabId = getActiveTab(state)?.id ?? null;
        blockDrag.blockIds = state.selectedBlockIds.has(block.id)
          ? [...state.selectedBlockIds]
          : [block.id];

        setDragging(true);

        // Move within the list, copy when dropped onto another tab
        event.dataTransfer.effectAllowed = DragEffect.COPY_MOVE;

        applyDragImage(event);
      }}
      onDragEnd={() => {
        clearBlockDrag();
        setDraggable(false);
        setDragging(false);
        setDragOver(false);
      }}
      onDragOver={(event) => {
        if (!blockDrag.srcId) {
          return;
        }

        event.preventDefault();

        const activeTabId = getActiveTab(store.getState())?.id ?? null;
        const isCrossTab = blockDrag.sourceTabId !== activeTabId;

        event.dataTransfer.dropEffect = isCrossTab
          ? DragEffect.COPY
          : DragEffect.MOVE;

        if (blockDrag.srcId !== block.id) {
          setDragOver(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);

        const { srcId, sourceTabId, blockIds } = blockDrag;
        if (!srcId) {
          return;
        }

        const state = store.getState();
        const activeTabId = getActiveTab(state)?.id ?? null;

        // Blocks arriving from another tab
        if (sourceTabId && activeTabId && sourceTabId !== activeTabId) {
          state.copyBlocksToTab(sourceTabId, activeTabId, blockIds, block.id);
          return;
        }

        if (srcId !== block.id) {
          reorderBlocks(srcId, block.id);
        }
      }}
      onMouseEnter={() => {
        const drag = lasso[SelectionGroup.BLOCK];
        if (drag.active && store.getState().mode !== AppMode.READ) {
          setBlockSelected(block.id, drag.mode === LassoMode.SELECT);
        }
      }}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (isFlashing) {
          clearFlash(block.id);
        }

        if (isRevealed) {
          clearBlockReveal();
        }
      }}
    >
      <BlockView
        block={block}
        variableMap={variableMap}
        secretKeys={secretKeys}
      />

      <div
        className={classNames(CssClass.ITEM_CONTROL, CssClass.ITEM_DRAG_HANDLE)}
      >
        <DragHandle
          handleProps={{
            onMouseDown: () => setDraggable(true),
            onMouseUp: () => {
              clearTimeout(disarmTimer.current);
              disarmTimer.current = setTimeout(
                () => setDraggable(false),
                DRAG_TIMEOUT_MS,
              );
            },
          }}
        />
      </div>

      <BlockActionsMenu blockId={block.id} />
    </div>
  );
});
