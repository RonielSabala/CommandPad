import './TabsBar.css';

import { useState, type DragEvent } from 'react';

import { CssClass } from '@/common/constants/css';
import { DragEffect, MouseButton } from '@/common/constants/events';
import { DEFAULT_TAB_LABEL } from '@/common/config';
import type { Tab } from '@/common/types';
import { ElementId } from '@/common/constants/dom';
import { useStore } from '@/store/store';
import { CloseIcon } from '../Icons';

/** Which tab is being dragged (shared across tab items). */
const tabDrag: { srcId: string | null } = { srcId: null };

function TabItem({ tab }: { tab: Tab }) {
  const isActive = useStore((s) => s.activeTabId === tab.id);
  const switchTab = useStore((s) => s.switchTab);
  const closeTab = useStore((s) => s.closeTab);
  const reorderTabs = useStore((s) => s.reorderTabs);

  const [dragging, setDragging] = useState(false);
  const [dropSide, setDropSide] = useState<'left' | 'right' | null>(null);

  const isLeftHalf = (e: DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientX < rect.left + rect.width / 2;
  };

  const label = tab.label || DEFAULT_TAB_LABEL;
  const className = [
    CssClass.TAB,
    isActive && CssClass.TAB_ACTIVE,
    dragging && CssClass.DRAGGING,
    dropSide === 'left' && CssClass.DRAG_OVER_LEFT,
    dropSide === 'right' && CssClass.DRAG_OVER_RIGHT,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      title={label}
      draggable
      onClick={() => switchTab(tab.id)}
      onMouseDown={(e) => {
        if (e.button === MouseButton.MIDDLE) e.preventDefault();
      }}
      onMouseUp={(e) => {
        if (e.button === MouseButton.MIDDLE) {
          e.preventDefault();
          closeTab(tab.id);
        }
      }}
      onDragStart={(e) => {
        tabDrag.srcId = tab.id;
        setDragging(true);
        e.dataTransfer.effectAllowed = DragEffect.MOVE;
      }}
      onDragEnd={() => {
        tabDrag.srcId = null;
        setDragging(false);
        setDropSide(null);
      }}
      onDragOver={(e) => {
        if (!tabDrag.srcId || tabDrag.srcId === tab.id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = DragEffect.MOVE;
        setDropSide(isLeftHalf(e) ? 'left' : 'right');
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropSide(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDropSide(null);
        const srcId = tabDrag.srcId;
        if (!srcId || srcId === tab.id) return;
        reorderTabs(srcId, tab.id, !isLeftHalf(e));
      }}
    >
      <span className="tab-label">{label}</span>
      <button
        className="tab-close"
        title="Close tab"
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.id);
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export function TabsBar() {
  const tabs = useStore((s) => s.tabs);
  const createNewTab = useStore((s) => s.createNewTab);

  return (
    <div id={ElementId.TABS_BAR}>
      {tabs.map((tab) => (
        <TabItem key={tab.id} tab={tab} />
      ))}
      <button id={ElementId.ADD_TAB_BTN} onClick={() => void createNewTab()} title="New tab">
        <svg viewBox="0 0 16 16">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </button>
    </div>
  );
}
