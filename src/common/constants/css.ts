import { RevealTone } from "@/common/enums";

export const CssClass = {
  // Core

  THEME_LIGHT: "theme-light",
  THEME_SWITCHING: "theme-switching",

  NO_LIGATURES: "no-ligatures",
  NO_USER_SELECT: "no-user-select",

  ACTIVE: "active",
  COLLAPSED: "collapsed",
  HAS_ERROR: "has-error",
  ANIMATING: "animating",
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",
  DRAG_IMAGE: "drag-image",
  DROP_TARGET: "drop-target",
  DUPLICATE_FLASH: "duplicate-flash",
  ROW_REVEAL: "row-reveal",

  CLAMPED: "clamped",
  CLAMP_SURFACE: "clamp-surface",

  PANEL_CARD: "panel-card",
  SECTION_TITLE: "section-title",

  TOOLTIP: "tooltip",
  MENU_OPEN: "menu-open",
  CONTEXT_MENU: "context-menu",
  CONTEXT_MENU_ITEM: "context-menu-item",
  CONTEXT_MENU_ICON: "context-menu-icon",
  SELECT_MENU: "select-menu",
  SELECT_MENU_PORTAL: "select-menu-portal",
  SELECT_OPTION: "select-option",

  CODE_EDITOR: "code-editor",
  CODE_EDITOR_HEADER: "code-editor-header",
  CODE_EDITOR_PROMPT: "code-editor-prompt",
  CODE_EDITOR_SURFACE: "code-editor-surface",
  CODE_EDITOR_BOUNDED: "code-editor-bounded",

  // Buttons

  BTN: "btn",
  BTN_LG: "btn-lg",

  BTN_ICON: "btn-icon",
  BTN_FLAT_ICON: "btn-flat-icon",
  BTN_SOFT_ICON: "btn-soft-icon",

  BTN_PRIMARY: "btn-primary",
  BTN_DANGER: "btn-danger",
  BTN_ACCENT: "btn-accent",

  // Icons
  ICON: "icon",
  ICON_SM: "icon-sm",
  ICON_MD: "icon-md",
  ICON_LG: "icon-lg",
  ICON_SEMIBOLD: "icon-semibold",
  ICON_BOLD: "icon-bold",

  // Action states
  IS_SELECTED: "is-selected",
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
  TOOLTIP_LINK: "tooltip-link",
  TOOLTIP_LINKS: "tooltip-links",
  TOOLTIP_PANEL: "tooltip-panel",
  TOOLTIP_TITLE: "tooltip-title",
  TOOLTIP_SCROLL: "tooltip-scroll",

  FRAMED_ROW: "framed-section-row",
  FRAMED_CELLS: "framed-section-cells",
  FRAMED_SECTIONS: "framed-sections",

  TEXT_MIRROR: "text-mirror",
  NOTE_EDITOR: "note-editor",

  NOTE_CODE: "note-code",
  NOTE_CODE_NEUTRAL: "note-code-neutral",
  NOTE_TABLE: "note-table",

  // Controls beside a block/variable item

  ITEM_CONTROL: "item-control",
  ITEM_ACTIONS: "item-actions",
  ITEM_DRAG_HANDLE: "item-drag-handle",
  RUNBOOK_EMBED_ACTIONS: "runbook-embed-actions",

  ROW_ACTIONS: "row-actions",

  // Sidebar rows
  SIDEBAR_SECTION_LIST_ROW: "sidebar-section-list-row",
  LIBRARY_ROW: "library-row",
  LIBRARY_ROW_MAIN: "library-row-main",
  LIBRARY_ROW_LABEL: "library-row-label",
  LIBRARY_ROW_RENAME_INPUT: "library-row-rename-input",
  LIBRARY_ROW_BTN: "library-row-btn",
  LIBRARY_ROW_ICON: "library-row-icon",
  LIBRARY_ROW_NAME: "library-row-name",

  // Minimap
  MINIMAP_ON: "minimap-on",
  MINIMAP_LEFT: "minimap-left",
  MINIMAP_HOST: "minimap-host",
  MINIMAP_SCROLLER: "minimap-scroller",

  // Modal
  MODAL_CLOUD: "modal-cloud",
  MODAL_VISIBLE: "modal-visible",
  MODAL_NO_ANIMATION: "modal-no-animation",
  MODAL_SCROLLABLE_BODY: "modal-scrollable-body",
  MODAL_BACKDROP: "modal-backdrop",
  MODAL_BACKDROP_TRANSPARENT: "modal-backdrop-transparent",
} as const;

export const REVEAL_TONE_CLASS: Record<RevealTone, string | undefined> = {
  [RevealTone.NEUTRAL]: "row-reveal-neutral",
  [RevealTone.RESOLVED]: "row-reveal-resolved",
  [RevealTone.UNRESOLVED]: undefined,
};

export const CssAnimation = {
  SURFACE_REVEAL: "surface-reveal",
} as const;
