import { DEFAULT_TAB_LABEL } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DragEffect, MouseButton } from "@/common/constants/events";
import { TabDropSide } from "@/common/enums";
import type { Tab } from "@/common/types";
import { useStore } from "@/store/store";
import { useState, type DragEvent } from "react";
import { CloseIcon } from "../Icons";
import "./TabItem.css";

const tabDrag: { srcId: string | null } = { srcId: null };

interface Props {
  tab: Tab;
}

export function TabItem({ tab }: Props) {
  const tabId = tab.id;
  const tabLabel = tab.label || DEFAULT_TAB_LABEL;

  const isActive = useStore((state) => state.activeTabId === tabId);
  const switchTab = useStore((state) => state.switchTab);
  const closeTab = useStore((state) => state.closeTab);
  const reorderTabs = useStore((state) => state.reorderTabs);

  const [dragging, setDragging] = useState(false);
  const [dropSide, setDropSide] = useState<TabDropSide | null>(null);

  const isLeftHalf = (event: DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2;
  };

  const className = [
    "tab",
    isActive && "tab-active",
    dragging && CssClass.DRAGGING,
    dropSide === TabDropSide.LEFT && "drag-over-left",
    dropSide === TabDropSide.RIGHT && "drag-over-right",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
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
        if (!tabDrag.srcId || tabDrag.srcId === tabId) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = DragEffect.MOVE;
        setDropSide(isLeftHalf(event) ? TabDropSide.LEFT : TabDropSide.RIGHT);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDropSide(null);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDropSide(null);

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
        title="Close tab"
        onClick={(event) => {
          event.stopPropagation();
          closeTab(tabId);
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
