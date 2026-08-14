import { DRAG_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { AppMode, LassoMode } from "@/common/enums";
import { DragIcon } from "@/components/icons";
import { blockDrag, clearBlockDrag } from "@/hooks/blockDrag";
import { lasso } from "@/hooks/lasso";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore, useStoreApi } from "@/store/store";
import { clamp } from "@/utils/number";
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
  const t = useTranslation();
  const store = useStoreApi();
  const isSelected = useStore((state) => state.selectedBlockIds.has(block.id));
  const isFlashing = useStore((state) => state.flashBlockIds.has(block.id));
  const clearFlash = useStore((state) => state.clearFlash);
  const reorderBlocks = useStore((state) => state.reorderBlocks);
  const setBlockSelected = useStore((state) => state.setBlockSelected);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const disarmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const BlockView = getBlockComponent(block.type);
  const blockClass = classNames(
    CssClass.BLOCK_ITEM,
    isSelected && "block-selected",
    isFlashing && "duplicate-flash",
    dragging && CssClass.DRAGGING,
    dragOver && CssClass.DRAG_OVER,
  );

  return (
    <div
      className={blockClass}
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

        const dragImage = event.currentTarget.querySelector<HTMLElement>(
          `[${DataAttr.DRAG_IMAGE}]`,
        );

        if (dragImage) {
          const rect = dragImage.getBoundingClientRect();
          event.dataTransfer.setDragImage(
            dragImage,
            clamp(event.clientX - rect.left, 0, rect.width),
            clamp(event.clientY - rect.top, 0, rect.height),
          );
        }
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
        if (lasso.active && store.getState().mode !== AppMode.READ) {
          setBlockSelected(block.id, lasso.mode === LassoMode.SELECT);
        }
      }}
      onAnimationEnd={() => {
        if (isFlashing) {
          clearFlash(block.id);
        }
      }}
    >
      <BlockView
        block={block}
        variableMap={variableMap}
        secretKeys={secretKeys}
      />

      <div className={CssClass.BLOCK_DRAG_HANDLE}>
        <div
          className="drag-handle"
          title={t.common.dragToReorder}
          onMouseDown={() => setDraggable(true)}
          onMouseUp={() => {
            clearTimeout(disarmTimer.current);
            disarmTimer.current = setTimeout(
              () => setDraggable(false),
              DRAG_TIMEOUT_MS,
            );
          }}
        >
          <DragIcon className="icon-md" />
        </div>
      </div>

      <BlockActionsMenu blockId={block.id} />
    </div>
  );
});
