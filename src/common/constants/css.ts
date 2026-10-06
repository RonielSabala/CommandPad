export const CssClass = {
  // Core

  THEME_LIGHT: "theme-light",
  THEME_SWITCHING: "theme-switching",

  NO_LIGATURES: "no-ligatures",
  NO_USER_SELECT: "no-user-select",

  ACTIVE: "active",
  COLLAPSED: "collapsed",
  ANIMATING: "animating",
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",
  DROP_TARGET: "drop-target",
  DUPLICATE_FLASH: "duplicate-flash",

  CLAMPED: "clamped",
  CLAMP_SURFACE: "clamp-surface",

  CONTEXT_MENU: "context-menu",
  CODE_EDITOR_PROMPT: "code-editor-prompt",

  // Icons
  ICON: "icon",
  ICON_SM: "icon-sm",
  ICON_MD: "icon-md",
  ICON_LG: "icon-lg",
  ICON_SEMIBOLD: "icon-semibold",
  ICON_BOLD: "icon-bold",

  // Action states
  IS_SCROLLING: "is-scrolling",
  ROW_DRAGGING: "row-dragging",
  PANEL_RESIZING: "panel-resizing",
  VARIABLE_SPLIT_RESIZING: "variable-split-resizing",

  // Modifier-key states
  LINK_KEY_HELD: "link-key-held",
  SELECT_KEY_HELD: "select-key-held",
  SELECT_KEY_INERT: "select-key-inert",
  SELECT_KEY_HIDDEN: "select-key-hidden",
  SELECT_KEY_INERT_CHILDREN: "select-key-inert-children",

  // Variables

  VARIABLES_LIST: "variables-list",
  VARIABLE_ITEM: "variable-item",
  VARIABLE_SURFACE: "variable-surface",
  VARIABLE_EDITOR_KEY: "variable-editor-key",
  VARIABLE_SECTION: "variable-section",
  VARIABLE_SECTION_NAME: "variable-section-name",

  IS_SECRET: "is-secret",
  IS_UNUSED: "is-unused",
  IS_CONSTANT: "is-constant",
  IS_UNRESOLVED: "is-unresolved",

  // Blocks
  BLOCKS_LIST: "blocks-list",
  BLOCK_ITEM: "block-item",
  BLOCK_SURFACE: "block-surface",
  BLOCK_CARD: "block-card",
  COMMAND_CARD: "command-card",

  NOTE_LINK: "note-link",
  NOTE_EDITOR: "note-editor",
  NOTE_CODE_NEUTRAL: "note-code-neutral",

  // Controls beside a block/variable item

  ITEM_CONTROL: "item-control",
  ITEM_ACTIONS: "item-actions",
  ITEM_DRAG_HANDLE: "item-drag-handle",
  RUNBOOK_EMBED_ACTIONS: "runbook-embed-actions",

  ROW_ACTIONS: "row-actions",
  RUNBOOK_ITEM_BTN: "runbook-item-btn",

  // Minimap
  MINIMAP_ON: "minimap-on",
  MINIMAP_LEFT: "minimap-left",
  MINIMAP_HOST: "minimap-host",
  MINIMAP_SCROLLER: "minimap-scroller",
} as const;
