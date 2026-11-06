import { LibraryFolderConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { AppMode, LibraryItemKind } from "@/common/enums";
import { SearchInput } from "@/components/common/SearchInput";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { ClipIcon, ImportIcon, TrashIcon } from "@/components/icons";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { libraryRows, type LibraryRow } from "@/utils/libraryTree";
import { classNames } from "@/utils/string";
import { useEffect, useMemo, useRef } from "react";
import { FileEarmarkPlus, FolderPlus } from "react-bootstrap-icons";

import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { LibraryFolderRow } from "./LibraryFolderRow";
import { RunbookRow } from "./RunbookRow";
import "./RunbookSection.css";

const getRowKey = (row: LibraryRow) =>
  row.kind === LibraryItemKind.FOLDER ? row.folder.id : row.runbook.id;

const renderRow = (row: LibraryRow) =>
  row.kind === LibraryItemKind.FOLDER ? (
    <LibraryFolderRow folder={row.folder} depth={row.depth} />
  ) : (
    <RunbookRow
      runbook={row.runbook}
      depth={row.depth}
      path={row.path.join(LibraryFolderConfig.PATH_SEPARATOR) || undefined}
    />
  );

export function RunbookSection() {
  const t = useTranslation();
  const isReadMode = useStore((state) => state.mode === AppMode.READ);
  const isCollapsed = useStore((state) => state.runbookSectionCollapsed);
  const onToggle = useStore((state) => state.toggleRunbookSection);
  const runbooks = useStore((state) => state.runbookLibrary);
  const folders = useStore((state) => state.libraryFolders);
  const searchQuery = useStore((state) => state.runbookSearchQuery);
  const setQuery = useStore((state) => state.setRunbookSearchQuery);
  const focusedRunbookId = useStore((state) => state.focusedRunbookId);
  const openPasteRunbookModal = useStore(
    (state) => state.openPasteRunbookModal,
  );

  const createNewTab = useStore((state) => state.createNewTab);
  const beginImport = useStore((state) => state.beginImport);
  const importRunbooks = useStore((state) => state.importRunbooks);
  const createLibraryFolder = useStore((state) => state.createLibraryFolder);
  const clearRunbookLibrary = useStore((state) => state.clearRunbookLibrary);
  const fileDrop = useFileDrop(
    (files) => void importRunbooks(files),
    !isReadMode && !isCollapsed,
  );

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
    >
      <div className="runbook-section-toolbar">
        <SearchInput
          value={searchQuery}
          placeholder={t.runbooks.searchPlaceholder}
          onChange={setQuery}
        />

        {!isReadMode && (
          <>
            <button
              className={classNames(CssClass.BTN, CssClass.BTN_SOFT_ICON)}
              onClick={() => void createNewTab()}
              aria-label={t.runbooks.newRunbook}
              {...tooltip(t.runbooks.newRunbook)}
            >
              <FileEarmarkPlus className={CssClass.ICON_MD} />
            </button>

            <button
              className={classNames(CssClass.BTN, CssClass.BTN_SOFT_ICON)}
              onClick={() => createLibraryFolder(null)}
              aria-label={t.runbooks.newFolder}
              {...tooltip(t.runbooks.newFolder)}
            >
              <FolderPlus className={CssClass.ICON_MD} />
            </button>
          </>
        )}
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
        onClick={beginImport}
        title={t.runbooks.importTitle}
        label={t.runbooks.import}
        icon={ImportIcon}
        secondaryAction={{
          onClick: openPasteRunbookModal,
          title: t.runbooks.pasteTitle,
          label: t.runbooks.paste,
          icon: ClipIcon,
        }}
        tertiaryAction={
          !isEmpty
            ? {
                onClick: () => void clearRunbookLibrary(),
                title: t.runbooks.clearLibraryTitle,
                label: t.runbooks.clearLibrary,
                icon: TrashIcon,
                danger: true,
              }
            : undefined
        }
      />
    </SidebarSection>
  );
}
