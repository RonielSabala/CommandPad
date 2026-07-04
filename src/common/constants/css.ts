export const CssClass = {
  // Body flags
  APP_READY: "app-ready",
  READ_MODE: "read-mode",
  CTRL_HELD: "ctrl-held",
  ALT_HELD: "alt-held",
  THEME_LIGHT: "theme-light",
  SELECTING: "selecting",

  // Sidebar flags
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
  SIDEBAR_RIGHT: "sidebar-right",
  COLLAPSED: "collapsed",

  // Drag & drop
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",

  // Blocks
  BLOCK_ITEM: "block-item",
  BLOCK_CONTROLS: "block-controls",
  BLOCK_DRAG_HANDLE: "block-drag-handle",
  BLOCK_SELECTED: "block-selected",
  DUPLICATE_FLASH: "duplicate-flash",
  IS_FOCUSED: "is-focused",
  EDITOR_COLLAPSED: "editor-collapsed",
  HAS_UNRESOLVED: "has-unresolved",

  // Rows / lists
  ACTIVE: "active",
  RUNBOOK_FOCUSED: "runbook-focused",
  VAR_SECRET: "is-secret",

  // Misc
  BTN_DISABLED: "btn-disabled",
} as const;
