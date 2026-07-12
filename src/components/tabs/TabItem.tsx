import { TAB_HOVER_SWITCH_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DragEffect, MouseButton } from "@/common/constants/events";
import { TabDropSide } from "@/common/enums";
import type { Tab } from "@/common/types";
import { CloseIcon } from "@/components/icons";
import { blockDrag } from "@/hooks/blockDrag";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState, type DragEvent } from "react";
import "./TabItem.css";

const tabDrag: { srcId: string | null } = { srcId: null };

interface Props {
  tab: Tab;
}

export function TabItem({ tab }: Props) {
  const t = useTranslation();
  const tabId = tab.id;
  const tabLabel = displayLabel(tab.label || t.common.untitledTab, t);

  const isActive = useStore((state) => state.activeTabId === tabId);
  const switchTab = useStore((state) => state.switchTab);
  const closeTab = useStore((state) => state.closeTab);
  const reorderTabs = useStore((state) => state.reorderTabs);
  const copyBlocksToTab = useStore((state) => state.copyBlocksToTab);

  const [dragging, setDragging] = useState(false);
  const [dropSide, setDropSide] = useState<TabDropSide | null>(null);
  const [blockDropTarget, setBlockDropTarget] = useState(false);

  const hoverSwitchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const cancelHoverSwitch = () => {
    clearTimeout(hoverSwitchTimer.current);
    hoverSwitchTimer.current = undefined;
  };

  useEffect(() => cancelHoverSwitch, []);

  const isLeftHalf = (event: DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2;
  };

  const tabClass = classNames(
    "tab",
    isActive && "tab-active",
    dragging && CssClass.DRAGGING,
    dropSide === TabDropSide.LEFT && "drag-over-left",
    dropSide === TabDropSide.RIGHT && "drag-over-right",
    blockDropTarget && "block-drop-target",
  );

  return (
    <div
      className={tabClass}
      title={tabLabel}
      draggable
      onClick={() => switchTab(tabId)}
      onMouseDown={(event) => {
        if (event.button === MouseButton.MIDDLE) {
          event.preventDefault();
        }
      }}
      onMouseUp={(event) => {
        if (event.button === MouseButton.MIDDLE) {
          event.preventDefault();
          closeTab(tabId);
        }
      }}
      onDragStart={(event) => {
        tabDrag.srcId = tabId;
        setDragging(true);
        event.dataTransfer.effectAllowed = DragEffect.MOVE;
      }}
      onDragEnd={() => {
        tabDrag.srcId = null;
        setDragging(false);
        setDropSide(null);
      }}
      onDragOver={(event) => {
        // A block drag
        if (blockDrag.srcId) {
          if (isActive) {
            return;
          }

          event.preventDefault();
          event.dataTransfer.dropEffect = DragEffect.COPY;
          setBlockDropTarget(true);

          // Keep hovering to open the tab and drop at a specific spot
          if (!hoverSwitchTimer.current) {
            hoverSwitchTimer.current = setTimeout(() => {
              hoverSwitchTimer.current = undefined;

              if (blockDrag.srcId) {
                setBlockDropTarget(false);
                switchTab(tabId);
              }
            }, TAB_HOVER_SWITCH_MS);
          }

          return;
        }

        if (!tabDrag.srcId || tabDrag.srcId === tabId) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = DragEffect.MOVE;
        setDropSide(isLeftHalf(event) ? TabDropSide.LEFT : TabDropSide.RIGHT);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDropSide(null);
          setBlockDropTarget(false);
          cancelHoverSwitch();
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDropSide(null);
        setBlockDropTarget(false);
        cancelHoverSwitch();

        // Copy into this tab at the end
        if (blockDrag.srcId) {
          if (blockDrag.sourceTabId) {
            copyBlocksToTab(blockDrag.sourceTabId, tabId, blockDrag.blockIds);
          }

          return;
        }

        const srcId = tabDrag.srcId;
        if (!srcId || srcId === tabId) {
          return;
        }

        reorderTabs(srcId, tabId, !isLeftHalf(event));
      }}
    >
      <span className="tab-label">{tabLabel}</span>
      <button
        className="tab-close"
        title={t.tabs.closeTab}
        onClick={(event) => {
          event.stopPropagation();
          closeTab(tabId);
        }}
      >
        <CloseIcon className="tab-close-icon icon-sm icon-bold" />
      </button>
    </div>
  );
}
