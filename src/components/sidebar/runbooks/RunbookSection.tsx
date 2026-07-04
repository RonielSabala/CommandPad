import { DataAttr, ScrollIntoView } from "@/common/constants/dom";
import { useStore } from "@/store/store";
import { openImportDialog } from "@/utils/importTrigger";
import { matchesQuery } from "@/utils/runbook";
import { useEffect, useRef } from "react";
import { SidebarSearch } from "../shared/SidebarSearch";
import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { RunbookRow } from "./RunbookRow";

export function RunbookSection() {
  const isCollapsed = useStore((state) => state.runbookSectionCollapsed);
  const onToggle = useStore((state) => state.toggleRunbookSection);
  const library = useStore((state) => state.runbookLibrary);
  const searchQuery = useStore((state) => state.runbookSearchQuery);
  const setQuery = useStore((state) => state.setRunbookSearchQuery);
  const focusedRunbookId = useStore((state) => state.focusedRunbookId);
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
      title="RUNBOOKS"
      collapsed={isCollapsed}
      onToggle={onToggle}
    >
      <SidebarSearch
        value={searchQuery}
        placeholder="Search runbooks..."
        onChange={setQuery}
      />

      <SidebarSectionList
        items={library}
        visibleItems={visibleItems}
        emptyMessage="No runbooks imported."
        getKey={(runbook) => runbook.id}
        renderItem={(runbook) => (
          <RunbookRow key={runbook.id} runbook={runbook} />
        )}
        listRef={listRef}
      />

      <SidebarSectionFooter
        onClick={openImportDialog}
        title="Import runbook"
        label="Import"
        icon={<path d="M8 11V3M5 6l3-3 3 3M3 11v2h10v-2" />}
      />
    </SidebarSection>
  );
}
