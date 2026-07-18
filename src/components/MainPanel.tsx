import { DragEffect } from "@/common/constants/events";
import { blockDrag } from "@/hooks/blockDrag";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import {
  getActiveTab,
  useStore,
  useStoreApi,
  type AppStoreApi,
} from "@/store/store";
import { useRef } from "react";
import { AddBlockRow } from "./blocks/AddBlockRow";
import { BlocksList } from "./blocks/BlocksList";
import { EmptyState } from "./blocks/EmptyState";
import "./MainPanel.css";
import { TabsBar } from "./tabs/TabsBar";

function isCrossTabBlockDrag(store: AppStoreApi): boolean {
  const activeTabId = getActiveTab(store.getState())?.id ?? null;
  return (
    !!blockDrag.srcId &&
    !!blockDrag.sourceTabId &&
    !!activeTabId &&
    blockDrag.sourceTabId !== activeTabId
  );
}

export function MainPanel() {
  const store = useStoreApi();
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
          if (isCrossTabBlockDrag(store)) {
            event.preventDefault();
            event.dataTransfer.dropEffect = DragEffect.COPY;
          }
        }}
        onDrop={(event) => {
          if (!isCrossTabBlockDrag(store)) {
            return;
          }

          event.preventDefault();

          const state = store.getState();
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
