import { memo, useRef, useState } from 'react';

import { CssClass } from '@/common/constants/css';
import { DataAttr } from '@/common/constants/dom';
import { DragEffect } from '@/common/constants/events';
import { AppMode, BlockType, LassoMode } from '@/common/enums';
import type { Block } from '@/common/types';
import { useStore } from '@/store/store';
import { lasso } from '@/hooks/lasso';
import { DragDotsIcon } from '../Icons';
import type { VariableMap } from '@/utils/resolution';
import { CommandBlock } from './CommandBlock';
import { NoteBlock } from './NoteBlock';
import { DividerBlock } from './DividerBlock';

/** Which block is being dragged (shared across block items). */
const blockDrag: { srcId: string | null } = { srcId: null };

interface Props {
  block: Block;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

export const BlockItem = memo(function BlockItem({ block, variableMap, secretKeys }: Props) {
  const selected = useStore((s) => s.selectedBlockIds.has(block.id));
  const flashing = useStore((s) => s.flashBlockIds.has(block.id));
  const clearFlash = useStore((s) => s.clearFlash);
  const duplicateBlock = useStore((s) => s.duplicateBlock);
  const removeBlock = useStore((s) => s.removeBlock);
  const reorderBlocks = useStore((s) => s.reorderBlocks);
  const setBlockSelected = useStore((s) => s.setBlockSelected);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const className = [
    CssClass.BLOCK_ITEM,
    selected && CssClass.BLOCK_SELECTED,
    dragging && CssClass.DRAGGING,
    dragOver && CssClass.DRAG_OVER,
    flashing && CssClass.DUPLICATE_FLASH,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      {...{ [DataAttr.BLOCK_ID]: block.id }}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) {
          e.preventDefault();
          return;
        }
        blockDrag.srcId = block.id;
        setDragging(true);
        e.dataTransfer.effectAllowed = DragEffect.MOVE;
      }}
      onDragEnd={() => {
        blockDrag.srcId = null;
        setDraggable(false);
        setDragging(false);
        setDragOver(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (blockDrag.srcId && blockDrag.srcId !== block.id) {
          setDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
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
        if (flashing) clearFlash(block.id);
      }}
    >
      {block.type === BlockType.COMMAND ? (
        <CommandBlock block={block} variableMap={variableMap} secretKeys={secretKeys} />
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
            disarmTimer.current = setTimeout(() => setDraggable(false), 50);
          }}
        >
          <DragDotsIcon size={14} />
        </div>
      </div>

      <div className="block-controls">
        <button className="btn btn-icon" onClick={() => duplicateBlock(block.id)} title="Duplicate block">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="9" height="9" rx="1" />
            <path d="M12 10v4M10 12h4" />
          </svg>
        </button>
        <button className="btn btn-icon btn-danger" onClick={() => removeBlock(block.id)} title="Delete block">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
          </svg>
        </button>
      </div>
    </div>
  );
});
