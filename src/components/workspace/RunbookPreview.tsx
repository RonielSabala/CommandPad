import { CssClass } from "@/common/constants/css";
import { ElementId } from "@/common/constants/dom";
import { DragEffect } from "@/common/constants/events";
import { PanelSide, RunbookView } from "@/common/enums";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyStateIcon } from "@/components/icons";
import { blockDrag } from "@/hooks/blockDrag";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useTranslation } from "@/i18n";
import {
  getActiveTab,
  useStore,
  useStoreApi,
  type AppStoreApi,
} from "@/store/store";
import { classNames } from "@/utils/string";
import { useRef } from "react";

import { AddBlockRow } from "../blocks/AddBlockRow";
import { BlocksList } from "../blocks/BlocksList";
import { BlocksMirror } from "./minimap/BlocksMirror";
import { Minimap } from "./minimap/Minimap";
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
  const t = useTranslation();
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
  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu(
    CssClass.BLOCK_ITEM,
  );

  useScrollPersistence(tabsContentRef, RunbookView.PREVIEW);

  return (
    <div
      id="tabs-content-wrapper"
      className={classNames(
        CssClass.MINIMAP_HOST,
        showMinimap && CssClass.MINIMAP_ON,
        minimapOnLeft && CssClass.MINIMAP_LEFT,
      )}
      onContextMenu={onContextMenu}
    >
      <div
        id="tabs-content"
        className={CssClass.MINIMAP_SCROLLER}
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
        {isEmpty && (
          <EmptyState
            icon={
              <EmptyStateIcon className="empty-state-icon icon-lg icon-bold" />
            }
            title={t.blocks.emptyTitle}
            hint={t.blocks.emptyHint}
          />
        )}
        <BlocksList />
        <AddBlockRow />
      </div>

      {showMinimap && (
        <Minimap
          scrollRef={tabsContentRef}
          listId={ElementId.BLOCKS_LIST}
          mirror={BlocksMirror}
        />
      )}

      {menuAnchor && (
        <WorkspaceContextMenu anchor={menuAnchor} onClose={closeMenu} />
      )}
    </div>
  );
}
