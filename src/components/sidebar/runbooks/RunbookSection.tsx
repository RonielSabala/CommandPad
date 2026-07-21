import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { AppMode, SyncModalMode } from "@/common/enums";
import { ClipIcon, ImportIcon, TrashIcon } from "@/components/icons";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { matchesQuery } from "@/utils/string";
import { useEffect, useRef } from "react";
import { SidebarSearch } from "../shared/SidebarSearch";
import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { RunbookRow } from "./RunbookRow";

export function RunbookSection() {
  const t = useTranslation();
  const isCollapsed = useStore((state) => state.runbookSectionCollapsed);
  const onToggle = useStore((state) => state.toggleRunbookSection);
  const library = useStore((state) => state.runbookLibrary);
  const searchQuery = useStore((state) => state.runbookSearchQuery);
  const setQuery = useStore((state) => state.setRunbookSearchQuery);
  const focusedRunbookId = useStore((state) => state.focusedRunbookId);
  const openPasteRunbookModal = useStore(
    (state) => state.openPasteRunbookModal,
  );

  const importRunbooks = useStore((state) => state.importRunbooks);
  const clearRunbookLibrary = useStore((state) => state.clearRunbookLibrary);
  const openDestinationModal = useStore((state) => state.openDestinationModal);
  const isReadMode = useStore((state) => state.mode === AppMode.READ);
  const fileDrop = useFileDrop(
    (files) => void importRunbooks(files),
    !isReadMode && !isCollapsed,
  );

  const visibleItems = library.filter((runbook) =>
    matchesQuery(searchQuery, runbook.label, runbook.filename),
  );

  const listRef = useRef<HTMLDivElement>(null);

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
      <SidebarSearch
        value={searchQuery}
        placeholder={t.runbooks.searchPlaceholder}
        onChange={setQuery}
      />

      <SidebarSectionList
        items={library}
        visibleItems={visibleItems}
        emptyMessage={t.runbooks.empty}
        getKey={(runbook) => runbook.id}
        renderItem={(runbook) => (
          <RunbookRow key={runbook.id} runbook={runbook} />
        )}
        listRef={listRef}
      />

      <SidebarSectionFooter
        onClick={() => openDestinationModal(SyncModalMode.IMPORT)}
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
          library.length > 0
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
