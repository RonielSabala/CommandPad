import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup, SidebarPosition } from "@/common/enums";
import type { RunbookEntry } from "@/common/types";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import {
  ContextMenuAlign,
  ContextMenuItem,
} from "@/components/common/ContextMenu";
import { DragIcon, TrashIcon } from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { memo } from "react";
import "./RunbookRow.css";

interface Props {
  runbook: RunbookEntry;
}

export const RunbookRow = memo(function RunbookRow({ runbook }: Props) {
  const t = useTranslation();
  const runbookId = runbook.id;
  const runbookLabel = displayLabel(runbook.label, t);

  const sidebarOnRight = useStore(
    (state) => state.sidebarPosition === SidebarPosition.RIGHT,
  );
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

  const rowClass = classNames(
    "runbook-row",
    "sidebar-section-list-row",
    isDragging && CssClass.DRAGGING,
  );

  const runbookBtnClass = classNames(
    "no-user-select",
    CssClass.RUNBOOK_ITEM_BTN,
    isActive && CssClass.ACTIVE,
    isFocused && "runbook-focused",
    isDragOver && CssClass.DRAG_OVER,
  );

  return (
    <div
      className={rowClass}
      {...{ [DataAttr.RUNBOOK_ID]: runbookId }}
      {...rowProps}
    >
      <div
        className="drag-handle"
        title={t.common.dragToReorder}
        {...handleProps}
      >
        <DragIcon className="icon-md" />
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

      <ActionsMenu
        className={CssClass.ROW_ACTIONS}
        title={t.runbooks.actions}
        align={sidebarOnRight ? ContextMenuAlign.END : ContextMenuAlign.START}
      >
        <ContextMenuItem
          icon={<TrashIcon className="icon-md icon-bold" />}
          onSelect={() => void removeRunbookFromLibrary(runbookId)}
          danger
        >
          {t.runbooks.removeFromLibrary}
        </ContextMenuItem>
      </ActionsMenu>
    </div>
  );
});
