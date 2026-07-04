import { DragEffect } from "@/common/constants/events";
import { useRef, useState, type DragEvent } from "react";

const DRAG_TIMEOUT_MS = 50;

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
    onDragStart: (event: DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (event: DragEvent) => void;
    onDragLeave: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
  };
}

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
      onDragStart: (event) => {
        dragGroups[group] = id;
        event.dataTransfer.effectAllowed = DragEffect.MOVE;
        setIsDragging(true);
      },
      onDragEnd: () => {
        dragGroups[group] = null;
        setDraggable(false);
        setIsDragging(false);
        setIsDragOver(false);
      },
      onDragOver: (event) => {
        const source = dragGroups[group];
        if (!source || source === id) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = DragEffect.MOVE;
        setIsDragOver(true);
      },
      onDragLeave: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      },
      onDrop: (event) => {
        event.preventDefault();
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
