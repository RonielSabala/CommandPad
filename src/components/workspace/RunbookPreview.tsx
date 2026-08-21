import { CssClass } from "@/common/constants/css";
import { InputSelector } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { PanelSide } from "@/common/enums";
import type { ContextMenuAnchor } from "@/components/common/contextMenu/ContextMenu";
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
import { AddBlockRow } from "../blocks/AddBlockRow";
import { BlocksList } from "../blocks/BlocksList";
import { EmptyState } from "../blocks/EmptyState";
import { Minimap } from "./Minimap";
import { WorkspaceContextMenu } from "./WorkspaceContextMenu";

function isCrossTabBlockDrag(store: AppStoreApi): boolean {
  const activeTabId = getActiveTab(store.getState())?.id ?? null;
  return (
    !!blockDrag.srcId &&
    !!blockDrag.sourceTabId &&
    !!activeTabId &&
    blockDrag.sourceTabId !== activeTabId
  );
}

export function RunbookPreview() {
  const store = useStoreApi();
  const tabsContentRef = useRef<HTMLDivElement>(null);
  const isEmpty = useStore(
    (state) => !(getActiveTab(state)?.blocks.length ?? 0),
  );

  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === PanelSide.LEFT,
  );

  const showMinimap = minimapEnabled && !isEmpty;
  const [menuAnchor, setMenuAnchor] = useState<ContextMenuAnchor | null>(null);

  useScrollPersistence(tabsContentRef);

  return (
    <div
      id="tabs-content-wrapper"
      className={classNames(
        showMinimap && CssClass.MINIMAP_ON,
        minimapOnLeft && CssClass.MINIMAP_LEFT,
      )}
      onContextMenu={(event) => {
        const target = event.target as HTMLElement;
        if (
          target.closest(InputSelector.EDITABLE) ||
          target.closest(`.${CssClass.BLOCK_ITEM}`)
        ) {
          return;
        }

        event.preventDefault();

        // Right-clicking the open menu just closes it
        if (target.closest(`.${CssClass.CONTEXT_MENU}`)) {
          setMenuAnchor(null);
          return;
        }

        setMenuAnchor({ x: event.clientX, y: event.clientY });
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
      {menuAnchor && (
        <WorkspaceContextMenu
          anchor={menuAnchor}
          onClose={() => setMenuAnchor(null)}
        />
      )}
    </div>
  );
}
