import { LibraryFolderConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { AppMode, LibraryItemKind } from "@/common/enums";
import { SearchInput } from "@/components/common/SearchInput";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { libraryRows, type LibraryRow } from "@/utils/libraryTree";
import { useEffect, useMemo, useRef } from "react";
import { FileEarmark, Folder } from "react-bootstrap-icons";

import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { LibraryContextMenu } from "./LibraryContextMenu";
import { LibraryFolderRow } from "./LibraryFolderRow";
import { LibraryImportButton } from "./LibraryImportButton";
import { LibraryRunbookRow } from "./LibraryRunbookRow";
import "./RunbookSection.css";

const getRowKey = (row: LibraryRow) =>
  row.kind === LibraryItemKind.FOLDER ? row.folder.id : row.runbook.id;

const renderRow = (row: LibraryRow) =>
  row.kind === LibraryItemKind.FOLDER ? (
    <LibraryFolderRow folder={row.folder} depth={row.depth} />
  ) : (
    <LibraryRunbookRow
      runbook={row.runbook}
      depth={row.depth}
      path={
        row.path &&
        LibraryFolderConfig.ROOT_PATH +
          row.path.join(LibraryFolderConfig.PATH_SEPARATOR)
      }
    />
  );

export function RunbookSection() {
  const t = useTranslation();
  const isReadMode = useStore((state) => state.mode === AppMode.READ);
  const isCollapsed = useStore((state) => state.runbookSectionCollapsed);
  const focusedRunbookId = useStore((state) => state.focusedRunbookId);

  const folders = useStore((state) => state.libraryFolders);
  const runbooks = useStore((state) => state.libraryRunbooks);

  const searchQuery = useStore((state) => state.runbookSearchQuery);
  const setQuery = useStore((state) => state.setRunbookSearchQuery);

  const onToggle = useStore((state) => state.toggleRunbookSection);
  const importRunbooks = useStore((state) => state.importRunbooks);
  const createNewTab = useStore((state) => state.createNewTab);
  const createLibraryFolder = useStore((state) => state.createLibraryFolder);
  const fileDrop = useFileDrop(
    (files) => void importRunbooks(files),
    !isReadMode && !isCollapsed,
  );

  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu();

  const listRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(
    () => libraryRows(folders, runbooks, searchQuery),
    [folders, runbooks, searchQuery],
  );

  const isEmpty = folders.length === 0 && runbooks.length === 0;

  useEffect(() => {
    if (!focusedRunbookId) {
      return;
    }

    const row = listRef.current?.querySelector(
      `[${DataAttr.RUNBOOK_ID}="${focusedRunbookId}"]`,
    );

    row?.scrollIntoView({
      block: ScrollIntoView.BLOCK_CENTER,
      behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
    });
  }, [focusedRunbookId]);

  return (
    <SidebarSection
      id="runbook-section"
      title={t.runbooks.title}
      collapsed={isCollapsed}
      onToggle={onToggle}
      dropZone={{ ...fileDrop, hint: t.runbooks.dropToImport }}
      onContextMenu={isReadMode ? undefined : onContextMenu}
    >
      <div className="runbook-section-toolbar">
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
        getKey={getRowKey}
        renderItem={renderRow}
        listRef={listRef}
      />

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

      {menuAnchor && !isReadMode && (
        <LibraryContextMenu anchor={menuAnchor} onClose={closeMenu} />
      )}
    </SidebarSection>
  );
}
