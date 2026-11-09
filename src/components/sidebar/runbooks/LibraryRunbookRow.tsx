import { RunbookConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, LibraryItemKind } from "@/common/enums";
import type { LibraryRunbook } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { DeleteMenuItem } from "@/components/common/contextMenu/DeleteMenuItem";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import { InfoMenuItem } from "@/components/common/info/InfoMenuItem";
import { useInfoTooltip } from "@/components/common/info/useInfoTooltip";
import { RenameInput } from "@/components/common/RenameInput";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import {
  getTabByRunbookId,
  isRunbookOpen,
  useStore,
  useStoreApi,
} from "@/store/store";
import { libraryDropZone } from "@/utils/libraryTree";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { memo, useState } from "react";
import {
  ArrowCounterclockwise,
  CloudSlash,
  Copy,
  FileEarmark,
  Vr,
} from "react-bootstrap-icons";

import { LibraryContextMenu } from "./LibraryContextMenu";
import { libraryDepthStyle } from "./libraryDepth";
import { RunbookProperties } from "./LibraryProperties";
import "./LibraryRow.css";
import "./LibraryRunbookRow.css";
import { RunbookSecretBadge } from "./RunbookSecretBadge";
import { RunbookSyncBadge } from "./RunbookSyncBadge";
import { useLibraryRowDrag } from "./useLibraryRowDrag";
import { useLibraryRowMenu } from "./useLibraryRowMenu";

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
  const store = useStoreApi();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const runbookId = runbook.id;
  const runbookLabel = displayLabel(runbook.label, t);

  const isActive = useStore((state) => state.activeRunbookId === runbookId);
  const isFocused = useStore((state) => state.focusedRunbookId === runbookId);
  const isOpen = useStore(
    (state) => marksOpenTabs && isRunbookOpen(state, runbookId),
  );

  const setRunbookFocus = useStore((state) => state.setRunbookFocus);
  const loadLibraryRunbook = useStore((state) => state.loadLibraryRunbook);

  const [renaming, setRenaming] = useState(false);
  const renameLibraryRunbook = useStore((state) => state.renameLibraryRunbook);
  const removeLibraryRunbook = useStore((state) => state.removeLibraryRunbook);
  const resetLibraryRunbookName = useStore(
    (state) => state.resetLibraryRunbookName,
  );
  const duplicateLibraryRunbook = useStore(
    (state) => state.duplicateLibraryRunbook,
  );

  const sync = runbook.sync;
  const unlinkRunbookSync = useStore((state) => state.unlinkRunbookSync);

  const { isDragging, dropClassName, handleProps, rowProps } =
    useLibraryRowDrag(runbookId, (sourceKind, fraction) =>
      libraryDropZone(sourceKind, LibraryItemKind.RUNBOOK, false, fraction),
    );

  const info = useInfoTooltip();
  const { menuAnchor, onContextMenu, closeMenu } = useLibraryRowMenu();

  const closeRunbookTab = () => {
    const state = store.getState();
    const tab = getTabByRunbookId(state, runbookId);
    if (tab) {
      state.closeTab(tab.id);
    }
  };

  const runbookActions = (
    <>
      <ContextMenuItem
        icon={<Vr className={CssClass.ICON_MD} />}
        onSelect={() => setRenaming(true)}
      >
        {t.runbooks.rename}
      </ContextMenuItem>

      {runbook.named && (
        <ContextMenuItem
          icon={<ArrowCounterclockwise className={CssClass.ICON_MD} />}
          onSelect={() => void resetLibraryRunbookName(runbookId)}
        >
          {t.runbooks.resetName}
        </ContextMenuItem>
      )}

      <ContextMenuItem
        icon={<Copy className={CssClass.ICON_MD} />}
        onSelect={() => void duplicateLibraryRunbook(runbookId)}
      >
        {t.runbooks.duplicate}
      </ContextMenuItem>

      {sync && (
        <ContextMenuItem
          icon={<CloudSlash className={CssClass.ICON_MD} />}
          onSelect={() => unlinkRunbookSync(runbookId)}
        >
          {t.runbooks.stopSyncing}
        </ContextMenuItem>
      )}
    </>
  );

  const readActions = (
    <InfoMenuItem label={t.info.properties} onSelect={info.open} />
  );

  const endActions = (
    <DeleteMenuItem onSelect={() => void removeLibraryRunbook(runbookId)}>
      {t.runbooks.deleteRunbook}
    </DeleteMenuItem>
  );

  return (
    <div
      className={classNames(
        dropClassName,
        isActive && CssClass.ACTIVE,
        menuAnchor && CssClass.MENU_OPEN,
        isFocused && "library-runbook-focused",
        isDragging && CssClass.DRAGGING,
        CssClass.LIBRARY_ROW,
        CssClass.SIDEBAR_SECTION_LIST_ROW,
      )}
      style={libraryDepthStyle(depth)}
      {...{ [DataAttr.RUNBOOK_ID]: runbookId }}
      {...rowProps}
      onContextMenu={onContextMenu}
    >
      <DragImage icon={<FileEarmark className={CssClass.ICON_MD} />}>
        {runbookLabel}
      </DragImage>

      <DragHandle handleProps={handleProps} />

      <div className={CssClass.LIBRARY_ROW_MAIN}>
        <div className="library-runbook-row-content">
          {renaming ? (
            <RenameInput
              className={classNames(
                CssClass.LIBRARY_ROW_LABEL,
                CssClass.LIBRARY_ROW_RENAME_INPUT,
              )}
              value={runbookLabel}
              maxLength={RunbookConfig.LABEL_MAX_LENGTH}
              onCommit={(name) => {
                renameLibraryRunbook(runbookId, name);
                setRenaming(false);
              }}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <button
              className={classNames(
                CssClass.LIBRARY_ROW_BTN,
                CssClass.LIBRARY_ROW_LABEL,
                CssClass.NO_USER_SELECT,
              )}
              onClick={() => {
                setRunbookFocus(null);
                void loadLibraryRunbook(runbookId);
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
        </div>

        {runbook.secured && <RunbookSecretBadge runbookId={runbookId} />}

        {sync && <RunbookSyncBadge runbookId={runbookId} sync={sync} />}

        {isOpen && (
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
      </div>

      <ActionsMenu
        className={classNames(CssClass.ROW_ACTIONS, info.menuClassName)}
        title={t.runbooks.actions}
        triggerRef={info.triggerRef}
      >
        {!readMode && (
          <>
            {runbookActions}
            <ContextMenuSeparator />
          </>
        )}

        {readActions}

        {!readMode && (
          <>
            <ContextMenuSeparator />
            {endActions}
          </>
        )}
      </ActionsMenu>

      {menuAnchor && (
        <LibraryContextMenu
          anchor={menuAnchor}
          folderId={runbook.folderId}
          onClose={closeMenu}
          actions={runbookActions}
          readActions={readActions}
          endActions={endActions}
        />
      )}

      {info.render(() => (
        <RunbookProperties runbookId={runbookId} />
      ))}
    </div>
  );
});
