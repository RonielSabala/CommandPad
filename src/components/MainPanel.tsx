import { useRef } from "react";

import { ElementId } from "@/common/constants/dom";
import { SidebarPosition } from "@/common/enums";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { getActiveTab, useStore } from "@/store/store";
import { AddBlockRow } from "./blocks/AddBlockRow";
import { BlocksList } from "./blocks/BlocksList";
import { EmptyState } from "./blocks/EmptyState";
import { TabsBar } from "./tabs/TabsBar";

function SidebarButtons() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const sidebarPosition = useStore((s) => s.sidebarPosition);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleSidebarPosition = useStore((s) => s.toggleSidebarPosition);

  return (
    <div id={ElementId.SIDEBAR_BTN_GROUP}>
      <button
        id={ElementId.SIDEBAR_TOGGLE_BTN}
        className="btn btn-icon"
        onClick={toggleSidebar}
        title={`${sidebarCollapsed ? "Expand" : "Collapse"} sidebar`}
      >
        <svg id={ElementId.SIDEBAR_CHEVRON} viewBox="0 0 16 16">
          <polyline points="10,4 4,8 10,12" />
        </svg>
      </button>
      <button
        id={ElementId.SIDEBAR_POSITION_BTN}
        className="btn btn-icon"
        onClick={toggleSidebarPosition}
        title={`Move sidebar to ${sidebarPosition === SidebarPosition.RIGHT ? "left" : "right"}`}
      >
        <svg viewBox="0 0 16 16">
          <rect x="1" y="2" width="14" height="12" rx="1" />
          <line x1="11" y1="2" x2="11" y2="14" />
        </svg>
      </button>
    </div>
  );
}

export function MainPanel() {
  const isEmpty = useStore((s) => (getActiveTab(s)?.blocks.length ?? 0) === 0);
  const tabsContentRef = useRef<HTMLDivElement>(null);
  useScrollPersistence(tabsContentRef);

  return (
    <main id={ElementId.MAIN_PANEL}>
      <TabsBar />
      <div id={ElementId.TABS_CONTENT} ref={tabsContentRef}>
        <SidebarButtons />
        {isEmpty && <EmptyState />}
        <BlocksList />
        <AddBlockRow />
      </div>
    </main>
  );
}
