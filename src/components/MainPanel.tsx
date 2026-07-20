import { CssClass } from "@/common/constants/css";
import { InputSelector } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { SidebarPosition } from "@/common/enums";
import { blockDrag } from "@/hooks/blockDrag";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import {
  getActiveTab,
  useStore,
  useStoreApi,
  type AppStoreApi,
} from "@/store/store";
import { classNames } from "@/utils/string";
import { useRef, useState } from "react";
import { AddBlockRow } from "./blocks/AddBlockRow";
import { BlocksList } from "./blocks/BlocksList";
import { EmptyState } from "./blocks/EmptyState";
import "./MainPanel.css";
import { Minimap } from "./Minimap";
import { MinimapMenu } from "./MinimapMenu";
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

  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === SidebarPosition.LEFT,
  );

  const showMinimap = minimapEnabled && !isEmpty;
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useScrollPersistence(tabsContentRef);

  return (
    <main id="main-panel">
      <TabsBar />
      <div
        id="tabs-content-wrapper"
        className={classNames(
          showMinimap && CssClass.MINIMAP_ON,
          minimapOnLeft && CssClass.MINIMAP_LEFT,
        )}
        onContextMenu={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest(InputSelector.EDITABLE)) {
            return;
          }

          event.preventDefault();

          // Right-clicking the open menu just closes it
          if (target.closest(`.${CssClass.CONTEXT_MENU}`)) {
            setMenuPosition(null);
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          setMenuPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }}
      >
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
        {showMinimap && <Minimap scrollRef={tabsContentRef} />}
        {menuPosition && (
          <MinimapMenu
            x={menuPosition.x}
            y={menuPosition.y}
            onClose={() => setMenuPosition(null)}
          />
        )}
      </div>
    </main>
  );
}
