export const CssClass = {
  THEME_LIGHT: "theme-light",
  ACTIVE: "active",
  ANIMATING: "animating",
  CLAMPED: "clamped",
  COLLAPSED: "collapsed",
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",
  DROP_TARGET: "drop-target",
  MINIMAP_ON: "minimap-on",
  MINIMAP_LEFT: "minimap-left",

  // Modifier-key states
  SELECT_KEY_HELD: "select-key-held",
  LINK_KEY_HELD: "link-key-held",
  PANEL_RESIZING: "panel-resizing",
  VARIABLE_SPLIT_RESIZING: "variable-split-resizing",

  // Specific classes
  CONTEXT_MENU: "context-menu",
  NOTE_LINK: "note-link",
  BLOCK_ITEM: "block-item",
  BLOCK_SURFACE: "block-surface",
  RUNBOOK_ITEM_BTN: "runbook-item-btn",
  BLOCK_ACTIONS: "block-actions",
  BLOCK_DRAG_HANDLE: "block-drag-handle",
  ROW_ACTIONS: "row-actions",
  CODE_EDITOR_PROMPT: "code-editor-prompt",
} as const;
