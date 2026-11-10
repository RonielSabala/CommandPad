import { CssClass } from "@/common/constants/css";
import { DragGroup, LibraryDropZone, LibraryItemKind } from "@/common/enums";
import { draggedRowId, useRowReorder } from "@/hooks/useRowReorder";
import { useStoreApi } from "@/store/store";
import { folderSubtree } from "@/utils/libraryTree";
import { useState, type DragEvent } from "react";

const TOP_LEVEL_ROW_ID = "";

const DROP_ZONE_CLASS: Record<LibraryDropZone, string> = {
  [LibraryDropZone.BEFORE]: "library-row-drop-before",
  [LibraryDropZone.AFTER]: "library-row-drop-after",
  [LibraryDropZone.INTO]: CssClass.DRAG_OVER,
};

/** A library row as a drag source and drop target. */
export function useLibraryRowDrag(
  targetId: string | null,
  zoneAt: (
    sourceKind: LibraryItemKind,
    fraction: number,
  ) => LibraryDropZone | null,
) {
  const store = useStoreApi();
  const [zone, setZone] = useState<LibraryDropZone>(LibraryDropZone.INTO);

  const isFolder = (id: string) =>
    store.getState().libraryFolders.some((folder) => folder.id === id);

  const reorder = useRowReorder(
    DragGroup.LIBRARY,
    targetId ?? TOP_LEVEL_ROW_ID,
    (sourceId) => {
      const state = store.getState();
      const move = isFolder(sourceId)
        ? state.moveLibraryFolder
        : state.moveLibraryRunbook;

      move(sourceId, targetId, zone);
    },
  );

  const onDragOver = (event: DragEvent) => {
    const sourceId = draggedRowId(DragGroup.LIBRARY);
    if (!sourceId || sourceId === targetId) {
      return;
    }

    const sourceIsFolder = isFolder(sourceId);
    const rect = event.currentTarget.getBoundingClientRect();
    const nextZone = zoneAt(
      sourceIsFolder ? LibraryItemKind.FOLDER : LibraryItemKind.RUNBOOK,
      (event.clientY - rect.top) / rect.height,
    );

    if (
      !nextZone ||
      (sourceIsFolder &&
        targetId &&
        folderSubtree(store.getState().libraryFolders, sourceId).has(targetId))
    ) {
      return;
    }

    setZone(nextZone);
    reorder.rowProps.onDragOver(event);
  };

  const dropZone = reorder.isDragOver ? zone : null;

  return {
    isDragging: reorder.isDragging,
    dropZone,
    dropClassName: dropZone && DROP_ZONE_CLASS[dropZone],
    handleProps: reorder.handleProps,
    rowProps: {
      ...reorder.rowProps,
      onDragEnter: onDragOver,
      onDragOver,
    },
  };
}
