export const CssClass = {
  ACTIVE: "active",
  ANIMATING: "animating",
  COLLAPSED: "collapsed",
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",
  DROP_TARGET: "drop-target",
  MINIMAP_ON: "minimap-on",
  MINIMAP_LEFT: "minimap-left",

  // Modifier-key states
  SELECT_KEY_HELD: "select-key-held",
  LINK_KEY_HELD: "link-key-held",
  SIDEBAR_RESIZING: "sidebar-resizing",

  // Specific classes
  CONTEXT_MENU: "context-menu",
  NOTE_LINK: "note-link",
  BLOCK_ITEM: "block-item",
  RUNBOOK_ITEM_BTN: "runbook-item-btn",
  BLOCK_CONTROLS: "block-controls",
  BLOCK_DRAG_HANDLE: "block-drag-handle",
} as const;
