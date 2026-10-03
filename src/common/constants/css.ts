export const CssClass = {
  THEME_LIGHT: "theme-light",
  THEME_SWITCHING: "theme-switching",

  ACTIVE: "active",
  COLLAPSED: "collapsed",
  ANIMATING: "animating",
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",
  DROP_TARGET: "drop-target",
  DUPLICATE_FLASH: "duplicate-flash",

  CLAMPED: "clamped",
  CLAMP_SURFACE: "clamp-surface",

  // Minimap
  MINIMAP_ON: "minimap-on",
  MINIMAP_LEFT: "minimap-left",
  MINIMAP_HOST: "minimap-host",
  MINIMAP_SCROLLER: "minimap-scroller",

  // Variables

  IS_SECRET: "is-secret",
  IS_UNUSED: "is-unused",
  IS_CONSTANT: "is-constant",

  VARIABLES_LIST: "variables-list",
  VARIABLE_ITEM: "variable-item",
  VARIABLE_SURFACE: "variable-surface",
  VARIABLE_EDITOR_KEY: "variable-editor-key",
  VARIABLE_SECTION: "variable-section",
  VARIABLE_SECTION_NAME: "variable-section-name",

  // Blocks
  BLOCK_ITEM: "block-item",
  BLOCK_SURFACE: "block-surface",

  // Controls beside a block or variable item
  ITEM_ACTIONS: "item-actions",
  ITEM_DRAG_HANDLE: "item-drag-handle",

  // Modifier-key states
  SELECT_KEY_HELD: "select-key-held",
  SELECT_KEY_INERT: "select-key-inert",
  SELECT_KEY_HIDDEN: "select-key-hidden",
  SELECT_KEY_INERT_CHILDREN: "select-key-inert-children",
  LINK_KEY_HELD: "link-key-held",
  ROW_DRAGGING: "row-dragging",
  PANEL_RESIZING: "panel-resizing",
  VARIABLE_SPLIT_RESIZING: "variable-split-resizing",

  // Miscellanea
  NOTE_LINK: "note-link",
  NOTE_EDITOR: "note-editor",
  ROW_ACTIONS: "row-actions",
  RUNBOOK_EMBED_ACTIONS: "runbook-embed-actions",
  CONTEXT_MENU: "context-menu",
  RUNBOOK_ITEM_BTN: "runbook-item-btn",
  CODE_EDITOR_PROMPT: "code-editor-prompt",
} as const;
