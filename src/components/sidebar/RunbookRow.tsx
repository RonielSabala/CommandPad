import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode } from "@/common/enums";
import type { RunbookEntry } from "@/common/types";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore } from "@/store/store";
import { memo } from "react";
import { DragDotsIcon, TrashIcon } from "../Icons";
import "./RunbookRow.css";

interface Props {
  runbook: RunbookEntry;
}

export const RunbookRow = memo(function RunbookRow({ runbook }: Props) {
  const id = runbook.id;
  const label = runbook.label;

  const isActive = useStore((state) => state.activeRunbookId === id);
  const isFocused = useStore((state) => state.focusedRunbookId === id);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const setRunbookFocus = useStore((state) => state.setRunbookFocus);
  const reorderRunbooks = useStore((state) => state.reorderRunbooks);
  const loadRunbookFromLibrary = useStore(
    (state) => state.loadRunbookFromLibrary,
  );
  const removeRunbookFromLibrary = useStore(
    (state) => state.removeRunbookFromLibrary,
  );

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    "runbook-group",
    id,
    reorderRunbooks,
    !readMode,
  );

  const btnClass = [
    "runbook-item-btn",
    isActive && CssClass.ACTIVE,
    isFocused && CssClass.RUNBOOK_FOCUSED,
    isDragOver && CssClass.DRAG_OVER,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`sidebar-section-list-row${isDragging ? ` ${CssClass.DRAGGING}` : ""}`}
      {...{ [DataAttr.RUNBOOK_ID]: id }}
      {...rowProps}
    >
      <div className="drag-handle" title="Drag to reorder" {...handleProps}>
        <DragDotsIcon />
      </div>
      <button
        className={btnClass}
        onClick={() => {
          setRunbookFocus(null);
          void loadRunbookFromLibrary(id);
        }}
        title={label}
      >
        {label}
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={() => void removeRunbookFromLibrary(id)}
        title="Remove from library"
      >
        <TrashIcon />
      </button>
    </div>
  );
});
