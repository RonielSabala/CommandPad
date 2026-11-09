import { CssClass } from "@/common/constants/css";
import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { AppMode } from "@/common/enums";
import { DeleteMenuItem } from "@/components/common/contextMenu/DeleteMenuItem";
import { InfoMenuItem } from "@/components/common/info/InfoMenuItem";
import { useInfoTooltip } from "@/components/common/info/useInfoTooltip";
import { SearchInput } from "@/components/common/SearchInput";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useTranslation } from "@/i18n";
import { useStore, useStoreApi } from "@/store/store";
import { scrollRowIntoView } from "@/utils/dom";
import {
  libraryRowKey,
  libraryRows,
  type LibraryRow,
} from "@/utils/libraryTree";
import { useEffect, useMemo, useRef } from "react";
import { FileEarmark, Folder } from "react-bootstrap-icons";

import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { LibraryContextMenu } from "./LibraryContextMenu";
import { LibraryDownloadItem } from "./LibraryDownloadItem";
import { LibraryImportButton } from "./LibraryImportButton";
import { FolderProperties } from "./LibraryProperties";
import { LibraryTopLevelDrop } from "./LibraryTopLevelDrop";
import { LibraryTreeRow } from "./LibraryTreeRow";
import "./RunbookSection.css";

const renderRow = (row: LibraryRow) => <LibraryTreeRow row={row} />;

export function RunbookSection() {
  const t = useTranslation();
  const store = useStoreApi();
  const folders = useStore((state) => state.libraryFolders);
  const runbooks = useStore((state) => state.libraryRunbooks);
  const isReadMode = useStore((state) => state.mode === AppMode.READ);
  const isCollapsed = useStore((state) => state.runbookSectionCollapsed);
  const activeRunbookId = useStore((state) => state.activeRunbookId);
  const focusedRunbookId = useStore((state) => state.focusedRunbookId);

  const searchQuery = useStore((state) => state.runbookSearchQuery);
  const setQuery = useStore((state) => state.setRunbookSearchQuery);

  const onToggle = useStore((state) => state.toggleRunbookSection);
  const importRunbooks = useStore((state) => state.importRunbooks);
  const createNewTab = useStore((state) => state.createNewTab);
  const createLibraryFolder = useStore((state) => state.createLibraryFolder);
  const clearRunbookLibrary = useStore((state) => state.clearRunbookLibrary);
  const fileDrop = useFileDrop(
    (files) => void importRunbooks(files),
    !isReadMode && !isCollapsed,
  );

  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu();
  const info = useInfoTooltip();

  const toolbarRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(
    () => libraryRows(folders, runbooks, searchQuery),
    [folders, runbooks, searchQuery],
  );

  const isEmpty = folders.length === 0 && runbooks.length === 0;

  useEffect(() => {
    scrollRowIntoView(
      listRef.current,
      DataAttr.RUNBOOK_ID,
      focusedRunbookId,
      ScrollIntoView.BLOCK_CENTER,
    );
  }, [focusedRunbookId]);

  // Keyboard navigation already scrolls to the row it focuses
  useEffect(() => {
    if (store.getState().focusedRunbookId !== activeRunbookId) {
      scrollRowIntoView(
        listRef.current,
        DataAttr.RUNBOOK_ID,
        activeRunbookId,
        ScrollIntoView.BLOCK_NEAREST,
      );
    }
  }, [store, activeRunbookId]);

  return (
    <SidebarSection
      id="runbook-section"
      title={t.runbooks.title}
      collapsed={isCollapsed}
      onToggle={onToggle}
      dropZone={{ ...fileDrop, hint: t.runbooks.dropToImport }}
      onContextMenu={onContextMenu}
    >
      <div className="runbook-section-toolbar" ref={toolbarRef}>
        <SearchInput
          value={searchQuery}
          placeholder={t.runbooks.searchPlaceholder}
          onChange={setQuery}
        />

        {!isReadMode && <LibraryImportButton />}
      </div>

      <SidebarSectionList
        isEmpty={isEmpty}
        visibleItems={rows}
        emptyMessage={t.runbooks.empty}
        getKey={libraryRowKey}
        renderItem={renderRow}
        listRef={listRef}
      />

      <div className="runbook-section-footer">
        <SidebarSectionFooter
          onClick={() => createLibraryFolder(null)}
          title={t.runbooks.newFolder}
          label={t.runbooks.newFolderItem}
          icon={<Folder className={CssClass.ICON_MD} />}
          secondaryAction={{
            onClick: () => void createNewTab(),
            title: t.runbooks.newRunbook,
            label: t.runbooks.newRunbookItem,
            icon: <FileEarmark className={CssClass.ICON_MD} />,
          }}
        />

        <LibraryTopLevelDrop />
      </div>

      {menuAnchor && (
        <LibraryContextMenu
          anchor={menuAnchor}
          levelActions
          onClose={closeMenu}
          readActions={
            <>
              <LibraryDownloadItem folderId={null} disabled={isEmpty} />
              <InfoMenuItem
                label={t.info.properties}
                onSelect={() => info.open(toolbarRef.current)}
              />
            </>
          }
          endActions={
            !isEmpty && (
              <DeleteMenuItem onSelect={() => void clearRunbookLibrary()}>
                {t.runbooks.clearLibraryTitle}
              </DeleteMenuItem>
            )
          }
        />
      )}

      {info.render(() => (
        <FolderProperties folderId={null} />
      ))}
    </SidebarSection>
  );
}
