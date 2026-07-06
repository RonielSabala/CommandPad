import { DRAG_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { AppMode, BlockType, LassoMode } from "@/common/enums";
import type { Block } from "@/common/types";
import { lasso } from "@/hooks/lasso";
import { useStore } from "@/store/store";
import type { VariableMap } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { memo, useRef, useState } from "react";
import { DragDotsIcon } from "../Icons";
import "./BlockItem.css";
import { CommandBlock } from "./command/CommandBlock";
import { DividerBlock } from "./divider/DividerBlock";
import { NoteBlock } from "./note/NoteBlock";

const blockDrag: { srcId: string | null } = { srcId: null };

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
    "block-item",
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

        blockDrag.srcId = block.id;
        setDragging(true);

        event.dataTransfer.effectAllowed = DragEffect.MOVE;
      }}
      onDragEnd={() => {
        blockDrag.srcId = null;
        setDraggable(false);
        setDragging(false);
        setDragOver(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
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
        setDragOver(false);

        const srcId = blockDrag.srcId;
        if (srcId && srcId !== block.id) {
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

      <div className="block-drag-handle">
        <div
          className="drag-handle"
          title="Drag to reorder"
          onMouseDown={() => setDraggable(true)}
          onMouseUp={() => {
            clearTimeout(disarmTimer.current);
            disarmTimer.current = setTimeout(
              () => setDraggable(false),
              DRAG_TIMEOUT_MS,
            );
          }}
        >
          <DragDotsIcon />
        </div>
      </div>

      <div className="block-controls">
        <button
          className="btn btn-icon"
          onClick={() => duplicateBlock(block.id)}
          title="Duplicate block"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="9" height="9" rx="1" />
            <path d="M12 10v4M10 12h4" />
          </svg>
        </button>
        <button
          className="btn btn-icon btn-danger"
          onClick={() => removeBlock(block.id)}
          title="Delete block"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
          </svg>
        </button>
      </div>
    </div>
  );
});
