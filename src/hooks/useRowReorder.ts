import { useRef, useState, type DragEvent } from 'react';
import { DragEffect } from '@/common/constants/events';

const DRAG_TIMEOUT_MS = 50;

/** Shared "who is being dragged" state, keyed by list group (e.g. 'variable'). */
const dragGroups: Record<string, string | null> = {};

export interface RowReorder {
  isDragging: boolean;
  isDragOver: boolean;
  handleProps: {
    onMouseDown: () => void;
    onMouseUp: () => void;
  };
  rowProps: {
    draggable: boolean;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}

/**
 * Handle-based drag-to-reorder for a single row, mirroring the original
 * `makeRowReorderable`. Dragging only arms after a mousedown on the handle;
 * `onReorder(sourceId, targetId)` reads live data at drop time.
 */
export function useRowReorder(
  group: string,
  id: string,
  onReorder: (sourceId: string, targetId: string) => void,
  enabled = true,
): RowReorder {
  const [draggable, setDraggable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return {
    isDragging,
    isDragOver,
    handleProps: {
      onMouseDown: () => setDraggable(true),
      onMouseUp: () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setDraggable(false), DRAG_TIMEOUT_MS);
      },
    },
    rowProps: {
      draggable,
      onDragStart: (e) => {
        dragGroups[group] = id;
        e.dataTransfer.effectAllowed = DragEffect.MOVE;
        setIsDragging(true);
      },
      onDragEnd: () => {
        dragGroups[group] = null;
        setDraggable(false);
        setIsDragging(false);
        setIsDragOver(false);
      },
      onDragOver: (e) => {
        const source = dragGroups[group];
        if (!source || source === id) {
          return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = DragEffect.MOVE;
        setIsDragOver(true);
      },
      onDragLeave: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      },
      onDrop: (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const source = dragGroups[group];
        if (!enabled || !source || source === id) {
          return;
        }
        dragGroups[group] = null;
        onReorder(source, id);
      },
    },
  };
}
