import React from "react";
import "./SidebarSectionList.css";

interface Props<T> {
  items: T[];
  visibleItems: T[];
  emptyMessage: string;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => React.ReactNode;
  listRef?: React.Ref<HTMLDivElement>;
}

export function SidebarSectionList<T>({
  items,
  visibleItems,
  emptyMessage,
  getKey,
  renderItem,
  listRef,
}: Props<T>) {
  return (
    <div className="sidebar-section-list" ref={listRef}>
      {items.length === 0 ? (
        <p className="sidebar-section-empty-msg">{emptyMessage}</p>
      ) : visibleItems.length === 0 ? (
        <p className="sidebar-section-empty-msg">No matches.</p>
      ) : (
        visibleItems.map((item) => (
          <React.Fragment key={getKey(item)}>{renderItem(item)}</React.Fragment>
        ))
      )}
    </div>
  );
}
