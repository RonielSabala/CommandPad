import { DRAG_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { AppMode, BlockType, LassoMode } from "@/common/enums";
import type { Block } from "@/common/types";
import { DragIcon, DuplicateIcon, TrashIcon } from "@/components/icons";
import { blockDrag, clearBlockDrag } from "@/hooks/blockDrag";
import { lasso } from "@/hooks/lasso";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import type { VariableMap } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { memo, useRef, useState } from "react";
import "./BlockItem.css";
import { CommandBlock } from "./command/CommandBlock";
import { DividerBlock } from "./divider/DividerBlock";
import { NoteBlock } from "./note/NoteBlock";

interface Props {
  block: Block;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

export const BlockItem = memo(function BlockItem({
  block,
  variableMap,
  secretKeys,
}: Props) {
  const t = useTranslation();
  const isSelected = useStore((state) => state.selectedBlockIds.has(block.id));
  const isFlashing = useStore((state) => state.flashBlockIds.has(block.id));
  const clearFlash = useStore((state) => state.clearFlash);
  const duplicateBlock = useStore((state) => state.duplicateBlock);
  const removeBlock = useStore((state) => state.removeBlock);
  const reorderBlocks = useStore((state) => state.reorderBlocks);
  const setBlockSelected = useStore((state) => state.setBlockSelected);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const disarmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

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

        const state = useStore.getState();

        blockDrag.srcId = block.id;
        blockDrag.sourceTabId = getActiveTab(state)?.id ?? null;
        blockDrag.blockIds = state.selectedBlockIds.has(block.id)
          ? [...state.selectedBlockIds]
          : [block.id];

        setDragging(true);

        // Move within the list, copy when dropped onto another tab
        event.dataTransfer.effectAllowed = DragEffect.COPY_MOVE;
      }}
      onDragEnd={() => {
        clearBlockDrag();
        setDraggable(false);
        setDragging(false);
        setDragOver(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();

        const activeTabId = getActiveTab(useStore.getState())?.id ?? null;
        const isCrossTab =
          !!blockDrag.srcId && blockDrag.sourceTabId !== activeTabId;

        event.dataTransfer.dropEffect = isCrossTab
          ? DragEffect.COPY
          : DragEffect.MOVE;

        if (blockDrag.srcId && blockDrag.srcId !== block.id) {
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

        const state = useStore.getState();
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
        if (lasso.active && useStore.getState().mode !== AppMode.READ) {
          setBlockSelected(block.id, lasso.mode === LassoMode.SELECT);
        }
      }}
      onAnimationEnd={() => {
        if (isFlashing) {
          clearFlash(block.id);
        }
      }}
    >
      {block.type === BlockType.COMMAND ? (
        <CommandBlock
          block={block}
          variableMap={variableMap}
          secretKeys={secretKeys}
        />
      ) : block.type === BlockType.NOTE ? (
        <NoteBlock block={block} />
      ) : (
        <DividerBlock />
      )}

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

      <div
        className={CssClass.BLOCK_CONTROLS}
        onMouseDown={(event) => event.preventDefault()}
      >
        <button
          className="btn btn-icon"
          onClick={() => duplicateBlock(block.id)}
          title={t.blocks.duplicate}
        >
          <DuplicateIcon className="icon-md icon-bold" />
        </button>
        <button
          className="btn btn-icon btn-danger"
          onClick={() => removeBlock(block.id)}
          title={t.blocks.delete}
        >
          <TrashIcon className="icon-md icon-bold" />
        </button>
      </div>
    </div>
  );
});
