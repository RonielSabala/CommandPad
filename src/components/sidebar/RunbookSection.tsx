import { useEffect, useRef } from "react";

import { DataAttr, ElementId } from "@/common/constants/dom";
import { useStore } from "@/store/store";
import { openImportDialog } from "@/utils/importTrigger";
import { matchesQuery } from "@/utils/runbook";
import { RunbookRow } from "./RunbookRow";
import { SidebarSearch, SidebarSection } from "./SidebarSection";

export function RunbookSection() {
  const collapsed = useStore((s) => s.runbookSectionCollapsed);
  const toggle = useStore((s) => s.toggleRunbookSection);
  const library = useStore((s) => s.runbookLibrary);
  const query = useStore((s) => s.runbookSearchQuery);
  const setQuery = useStore((s) => s.setRunbookSearchQuery);
  const focusedRunbookId = useStore((s) => s.focusedRunbookId);
  const listRef = useRef<HTMLDivElement>(null);

  const visible = library.filter((r) =>
    matchesQuery(query, r.label, r.filename),
  );

  useEffect(() => {
    if (!focusedRunbookId) {
      return;
    }
    const row = listRef.current?.querySelector(
      `[${DataAttr.RUNBOOK_ID}="${focusedRunbookId}"]`,
    );
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusedRunbookId]);

  return (
    <SidebarSection
      id={ElementId.RUNBOOK_SECTION}
      title="RUNBOOKS"
      collapsed={collapsed}
      onToggle={toggle}
    >
      <SidebarSearch
        value={query}
        placeholder="Search runbooks…"
        onChange={setQuery}
      />
      <div id="runbook-list" className="sidebar-section-list" ref={listRef}>
        {library.length === 0 ? (
          <p className="sidebar-section-empty-msg">No runbooks imported.</p>
        ) : visible.length === 0 ? (
          <p className="sidebar-section-empty-msg">No matches.</p>
        ) : (
          visible.map((runbook) => (
            <RunbookRow key={runbook.id} runbook={runbook} />
          ))
        )}
      </div>
      <div className="sidebar-section-footer">
        <button
          className="btn"
          onClick={openImportDialog}
          title="Import runbook"
        >
          <svg viewBox="0 0 16 16">
            <path d="M8 11V3M5 6l3-3 3 3M3 11v2h10v-2" />
          </svg>
          Import
        </button>
      </div>
    </SidebarSection>
  );
}
