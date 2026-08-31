import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup } from "@/common/enums";
import type { RunbookEntry } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { DragIcon, DuplicateIcon, TrashIcon } from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { memo } from "react";
import { CloudSlash } from "react-bootstrap-icons";

import "./RunbookRow.css";
import { RunbookSecretBadge } from "./RunbookSecretBadge";
import { RunbookSyncBadge } from "./RunbookSyncBadge";

interface Props {
  runbook: RunbookEntry;
}

export const RunbookRow = memo(function RunbookRow({ runbook }: Props) {
  const t = useTranslation();
  const runbookId = runbook.id;
  const runbookLabel = displayLabel(runbook.label, t);

  const isActive = useStore((state) => state.activeRunbookId === runbookId);
  const isFocused = useStore((state) => state.focusedRunbookId === runbookId);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const setRunbookFocus = useStore((state) => state.setRunbookFocus);
  const reorderRunbooks = useStore((state) => state.reorderRunbooks);
  const loadRunbookFromLibrary = useStore(
    (state) => state.loadRunbookFromLibrary,
  );

  const duplicateRunbook = useStore((state) => state.duplicateRunbook);
  const removeRunbookFromLibrary = useStore(
    (state) => state.removeRunbookFromLibrary,
  );

  const sync = runbook.sync;
  const unlinkRunbookSync = useStore((state) => state.unlinkRunbookSync);

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
        {...tooltip(t.common.dragToReorder)}
        {...handleProps}
      >
        <DragIcon className="icon-md" />
      </div>

      <div className="runbook-row-main">
        <button
          className={runbookBtnClass}
          onClick={() => {
            setRunbookFocus(null);
            void loadRunbookFromLibrary(runbookId);
          }}
          {...tooltip(runbookLabel)}
        >
          {runbookLabel}
        </button>

        {runbook.secured && <RunbookSecretBadge runbookId={runbookId} />}

        {sync && <RunbookSyncBadge runbookId={runbookId} sync={sync} />}
      </div>

      <ActionsMenu className={CssClass.ROW_ACTIONS} title={t.runbooks.actions}>
        {sync && (
          <ContextMenuItem
            icon={<CloudSlash className="icon-md" />}
            onSelect={() => unlinkRunbookSync(runbookId)}
          >
            {t.runbooks.stopSyncing}
          </ContextMenuItem>
        )}

        <ContextMenuItem
          icon={<DuplicateIcon className="icon-md icon-bold" />}
          onSelect={() => void duplicateRunbook(runbookId)}
        >
          {t.runbooks.duplicate}
        </ContextMenuItem>

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
