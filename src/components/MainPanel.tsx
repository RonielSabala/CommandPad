import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { getActiveTab, useStore } from "@/store/store";
import { useRef } from "react";
import { AddBlockRow } from "./blocks/AddBlockRow";
import { BlocksList } from "./blocks/BlocksList";
import { EmptyState } from "./blocks/EmptyState";
import "./MainPanel.css";
import { SidebarActions } from "./sidebar/SidebarActions";
import { TabsBar } from "./tabs/TabsBar";

export function MainPanel() {
  const tabsContentRef = useRef<HTMLDivElement>(null);
  const isEmpty = useStore(
    (state) => (getActiveTab(state)?.blocks.length ?? 0) === 0,
  );

  useScrollPersistence(tabsContentRef);

  return (
    <main id="main-panel">
      <TabsBar />
      <div id="tabs-content" ref={tabsContentRef}>
        <SidebarActions />
        {isEmpty && <EmptyState />}
        <BlocksList />
        <AddBlockRow />
      </div>
    </main>
  );
}
