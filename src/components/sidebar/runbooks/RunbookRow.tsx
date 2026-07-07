import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup } from "@/common/enums";
import type { RunbookEntry } from "@/common/types";
import { DragIcon, XIcon } from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo } from "react";
import "./RunbookRow.css";

interface Props {
  runbook: RunbookEntry;
}

export const RunbookRow = memo(function RunbookRow({ runbook }: Props) {
  const runbookId = runbook.id;
  const runbookLabel = runbook.label;

  const isActive = useStore((state) => state.activeRunbookId === runbookId);
  const isFocused = useStore((state) => state.focusedRunbookId === runbookId);
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
    DragGroup.RUNBOOK,
    runbookId,
    reorderRunbooks,
    !readMode,
  );

  const runbookBtnClass = classNames(
    CssClass.RUNBOOK_ITEM_BTN,
    isActive && CssClass.ACTIVE,
    isFocused && "runbook-focused",
    isDragOver && CssClass.DRAG_OVER,
  );

  return (
    <div
      className={`sidebar-section-list-row${isDragging ? ` ${CssClass.DRAGGING}` : ""}`}
      {...{ [DataAttr.RUNBOOK_ID]: runbookId }}
      {...rowProps}
    >
      <div className="drag-handle" title="Drag to reorder" {...handleProps}>
        <DragIcon />
      </div>
      <button
        className={runbookBtnClass}
        onClick={() => {
          setRunbookFocus(null);
          void loadRunbookFromLibrary(runbookId);
        }}
        title={runbookLabel}
      >
        {runbookLabel}
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={() => void removeRunbookFromLibrary(runbookId)}
        title="Remove from library"
      >
        <XIcon />
      </button>
    </div>
  );
});
