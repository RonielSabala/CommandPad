import { RunbookConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup } from "@/common/enums";
import type { LibraryRunbook } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import { RenameInput } from "@/components/common/RenameInput";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { DuplicateIcon, TrashIcon } from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import {
  getTabByRunbookId,
  isRunbookOpen,
  useStore,
  useStoreApi,
} from "@/store/store";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { memo, useState } from "react";
import {
  ArrowCounterclockwise,
  CloudSlash,
  FileEarmark,
  Vr,
} from "react-bootstrap-icons";

import { libraryDepthStyle } from "./libraryDepth";
import "./LibraryRow.css";
import "./LibraryRunbookRow.css";
import { RunbookSecretBadge } from "./RunbookSecretBadge";
import { RunbookSyncBadge } from "./RunbookSyncBadge";

interface Props {
  runbook: LibraryRunbook;
  marksOpenTabs?: boolean;
  depth?: number;
  path?: string;
}

export const LibraryRunbookRow = memo(function LibraryRunbookRow({
  runbook,
  marksOpenTabs = true,
  depth = 0,
  path,
}: Props) {
  const t = useTranslation();
  const runbookId = runbook.id;
  const runbookLabel = displayLabel(runbook.label, t);

  const isActive = useStore((state) => state.activeRunbookId === runbookId);
  const isFocused = useStore((state) => state.focusedRunbookId === runbookId);
  const isOpen = useStore(
    (state) => marksOpenTabs && isRunbookOpen(state, runbookId),
  );

  const store = useStoreApi();
  const closeRunbookTab = () => {
    const state = store.getState();
    const tab = getTabByRunbookId(state, runbookId);
    if (tab) {
      state.closeTab(tab.id);
    }
  };

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
        isDragging && CssClass.DRAGGING,
        CssClass.LIBRARY_ROW,
        CssClass.SIDEBAR_SECTION_LIST_ROW,
      )}
      style={libraryDepthStyle(depth)}
      {...{ [DataAttr.RUNBOOK_ID]: runbookId }}
      {...rowProps}
    >
      <DragImage icon={<FileEarmark className={CssClass.ICON_MD} />}>
        {runbookLabel}
      </DragImage>

      <DragHandle handleProps={handleProps} />

      <div className={CssClass.LIBRARY_ROW_MAIN}>
        {renaming ? (
          <RenameInput
            className={classNames(
              CssClass.LIBRARY_ROW_LABEL,
              CssClass.LIBRARY_ROW_RENAME_INPUT,
            )}
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
              isActive && CssClass.ACTIVE,
              isFocused && "library-runbook-focused",
              isDragOver && CssClass.DRAG_OVER,
              CssClass.LIBRARY_ROW_BTN,
              CssClass.LIBRARY_ROW_LABEL,
              CssClass.NO_USER_SELECT,
            )}
            onClick={() => {
              setRunbookFocus(null);
              void loadRunbookFromLibrary(runbookId);
            }}
            onDoubleClick={() => setRenaming(!readMode)}
            {...tooltip(runbookLabel)}
          >
            <FileEarmark
              className={classNames(
                CssClass.ICON_MD,
                CssClass.LIBRARY_ROW_ICON,
              )}
            />

            <span className={CssClass.LIBRARY_ROW_NAME}>{runbookLabel}</span>
          </button>
        )}

        {path && <span className="library-runbook-row-path">{path}</span>}

        {isOpen && !isActive && (
          <button
            className={classNames(
              "library-runbook-open-dot",
              CssClass.LIBRARY_RUNBOOK_BADGE,
            )}
            aria-label={t.tabs.closeTab}
            {...tooltip(t.tabs.closeTab)}
            onClick={closeRunbookTab}
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
          icon={<Vr className={CssClass.ICON_MD} />}
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
