import { DragEffect } from "@/common/constants/events";
import { blockDrag } from "@/hooks/blockDrag";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { getActiveTab, useStore } from "@/store/store";
import { useRef } from "react";
import { AddBlockRow } from "./blocks/AddBlockRow";
import { BlocksList } from "./blocks/BlocksList";
import { EmptyState } from "./blocks/EmptyState";
import "./MainPanel.css";
import { TabsBar } from "./tabs/TabsBar";

function isCrossTabBlockDrag(): boolean {
  const activeTabId = getActiveTab(useStore.getState())?.id ?? null;
  return (
    !!blockDrag.srcId &&
    !!blockDrag.sourceTabId &&
    !!activeTabId &&
    blockDrag.sourceTabId !== activeTabId
  );
}

export function MainPanel() {
  const tabsContentRef = useRef<HTMLDivElement>(null);
  const isEmpty = useStore(
    (state) => !(getActiveTab(state)?.blocks.length ?? 0),
  );

  useScrollPersistence(tabsContentRef);

  return (
    <main id="main-panel">
      <TabsBar />
      <div
        id="tabs-content"
        ref={tabsContentRef}
        onDragOver={(event) => {
          if (isCrossTabBlockDrag()) {
            event.preventDefault();
            event.dataTransfer.dropEffect = DragEffect.COPY;
          }
        }}
        onDrop={(event) => {
          if (!isCrossTabBlockDrag()) {
            return;
          }

          event.preventDefault();

          const state = useStore.getState();
          const activeTabId = getActiveTab(state)?.id;

          if (blockDrag.sourceTabId && activeTabId) {
            state.copyBlocksToTab(
              blockDrag.sourceTabId,
              activeTabId,
              blockDrag.blockIds,
            );
          }
        }}
      >
        {isEmpty && <EmptyState />}
        <BlocksList />
        <AddBlockRow />
      </div>
    </main>
  );
}
