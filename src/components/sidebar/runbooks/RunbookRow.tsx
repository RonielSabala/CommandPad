import { RunbookConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup } from "@/common/enums";
import type { RunbookEntry } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import { RenameInput } from "@/components/common/RenameInput";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  DuplicateIcon,
  PencilIcon,
  RunbookIcon,
  TrashIcon,
} from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { isRunbookOpen, useStore } from "@/store/store";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { memo, useState } from "react";
import { ArrowCounterclockwise, CloudSlash } from "react-bootstrap-icons";

import "./RunbookRow.css";
import { RunbookSecretBadge } from "./RunbookSecretBadge";
import { RunbookSyncBadge } from "./RunbookSyncBadge";

interface Props {
  runbook: RunbookEntry;
  marksOpenTabs?: boolean;
}

export const RunbookRow = memo(function RunbookRow({
  runbook,
  marksOpenTabs = true,
}: Props) {
  const t = useTranslation();
  const runbookId = runbook.id;
  const runbookLabel = displayLabel(runbook.label, t);

  const isActive = useStore((state) => state.activeRunbookId === runbookId);
  const isFocused = useStore((state) => state.focusedRunbookId === runbookId);
  const isOpen = useStore(
    (state) => marksOpenTabs && isRunbookOpen(state, runbookId),
  );

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const setRunbookFocus = useStore((state) => state.setRunbookFocus);
  const reorderRunbooks = useStore((state) => state.reorderRunbooks);
  const loadRunbookFromLibrary = useStore(
    (state) => state.loadRunbookFromLibrary,
  );

  const [renaming, setRenaming] = useState(false);
  const renameRunbook = useStore((state) => state.renameRunbook);
  const resetRunbookName = useStore((state) => state.resetRunbookName);
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

  return (
    <div
      className={classNames(
        "runbook-row",
        "sidebar-section-list-row",
        isDragging && CssClass.DRAGGING,
      )}
      {...{ [DataAttr.RUNBOOK_ID]: runbookId }}
      {...rowProps}
    >
      <DragImage icon={RunbookIcon}>{runbookLabel}</DragImage>
      <DragHandle handleProps={handleProps} />

      <div className="runbook-row-main">
        {renaming ? (
          <RenameInput
            className="runbook-label runbook-rename-input"
            value={runbookLabel}
            maxLength={RunbookConfig.LABEL_MAX_LENGTH}
            onCommit={(name) => {
              renameRunbook(runbookId, name);
              setRenaming(false);
            }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <button
            className={classNames(
              "runbook-label",
              CssClass.NO_USER_SELECT,
              CssClass.RUNBOOK_ITEM_BTN,
              isActive && CssClass.ACTIVE,
              isFocused && "runbook-focused",
              isDragOver && CssClass.DRAG_OVER,
            )}
            onClick={() => {
              setRunbookFocus(null);
              void loadRunbookFromLibrary(runbookId);
            }}
            onDoubleClick={() => setRenaming(!readMode)}
            {...tooltip(runbookLabel)}
          >
            {runbookLabel}
          </button>
        )}

        {isOpen && (
          <span
            className="runbook-open-dot"
            {...tooltip(t.runbooks.openInTab)}
          />
        )}

        {runbook.secured && <RunbookSecretBadge runbookId={runbookId} />}

        {sync && <RunbookSyncBadge runbookId={runbookId} sync={sync} />}
      </div>

      <ActionsMenu className={CssClass.ROW_ACTIONS} title={t.runbooks.actions}>
        {sync && (
          <ContextMenuItem
            icon={<CloudSlash className={CssClass.ICON_MD} />}
            onSelect={() => unlinkRunbookSync(runbookId)}
          >
            {t.runbooks.stopSyncing}
          </ContextMenuItem>
        )}

        <ContextMenuItem
          icon={
            <PencilIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => setRenaming(true)}
        >
          {t.runbooks.rename}
        </ContextMenuItem>

        {runbook.named && (
          <ContextMenuItem
            icon={<ArrowCounterclockwise className={CssClass.ICON_MD} />}
            onSelect={() => void resetRunbookName(runbookId)}
          >
            {t.runbooks.resetName}
          </ContextMenuItem>
        )}

        <ContextMenuItem
          icon={
            <DuplicateIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => void duplicateRunbook(runbookId)}
        >
          {t.runbooks.duplicate}
        </ContextMenuItem>

        <ContextMenuItem
          icon={
            <TrashIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => void removeRunbookFromLibrary(runbookId)}
          danger
        >
          {t.runbooks.removeFromLibrary}
        </ContextMenuItem>
      </ActionsMenu>
    </div>
  );
});
