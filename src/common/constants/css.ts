import { RevealTone } from "@/common/enums";

// Classes

export const CssClass = {
  // Theme
  THEME_LIGHT: "theme-light",
  THEME_SWITCHING: "theme-switching",

  // Text
  NO_LIGATURES: "no-ligatures",
  NO_USER_SELECT: "no-user-select",

  // States
  ACTIVE: "active",
  COLLAPSED: "collapsed",
  HAS_ERROR: "has-error",
  ANIMATING: "animating",
  IS_SELECTED: "is-selected",
  IS_SCROLLING: "is-scrolling",

  // Modifier-key states
  LINK_KEY_HELD: "link-key-held",
  SELECT_KEY_HELD: "select-key-held",
  SELECT_KEY_INERT: "select-key-inert",
  SELECT_KEY_HIDDEN: "select-key-hidden",
  SELECT_KEY_INERT_CHILDREN: "select-key-inert-children",

  // Reveals
  ROW_REVEAL: "row-reveal",
  DUPLICATE_FLASH: "duplicate-flash",

  // Dragging and resizing
  DRAGGING: "dragging",
  DRAG_OVER: "drag-over",
  DRAG_IMAGE: "drag-image",
  DROP_TARGET: "drop-target",
  REORDER_LIST: "reorder-list",
  REORDER_ROW: "reorder-row",
  ROW_DRAGGING: "row-dragging",
  PANEL_RESIZING: "panel-resizing",
  VARIABLE_SPLIT_RESIZING: "variable-split-resizing",

  // Clamping
  CLAMPED: "clamped",
  CLAMP_SURFACE: "clamp-surface",

  // Layout
  PANEL_CARD: "panel-card",
  SECTION_TITLE: "section-title",
  FRAMED_SECTIONS: "framed-sections",
  FRAMED_ROW: "framed-section-row",
  FRAMED_CELLS: "framed-section-cells",

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

  // Menus
  MENU_OPEN: "menu-open",
  CONTEXT_MENU: "context-menu",
  CONTEXT_MENU_ITEM: "context-menu-item",
  CONTEXT_MENU_ICON: "context-menu-icon",
  SELECT_MENU: "select-menu",
  SELECT_MENU_PORTAL: "select-menu-portal",
  SELECT_OPTION: "select-option",

  // Tooltips
  TOOLTIP: "tooltip",
  TOOLTIP_LINK: "tooltip-link",
  TOOLTIP_LINKS: "tooltip-links",
  TOOLTIP_PANEL: "tooltip-panel",
  TOOLTIP_TITLE: "tooltip-title",
  TOOLTIP_SCROLL: "tooltip-scroll",

  // Modals
  MODAL_BACKDROP: "modal-backdrop",
  MODAL_BACKDROP_TRANSPARENT: "modal-backdrop-transparent",
  MODAL_VISIBLE: "modal-visible",
  MODAL_NO_ANIMATION: "modal-no-animation",
  MODAL_SCROLLABLE_BODY: "modal-scrollable-body",
  MODAL_CLOUD: "modal-cloud",

  // Code editor
  CODE_EDITOR: "code-editor",
  CODE_EDITOR_HEADER: "code-editor-header",
  CODE_EDITOR_PROMPT: "code-editor-prompt",
  CODE_EDITOR_SURFACE: "code-editor-surface",
  CODE_EDITOR_BOUNDED: "code-editor-bounded",

  // Controls beside a block or variable row
  ITEM_CONTROL: "item-control",
  ITEM_ACTIONS: "item-actions",
  ITEM_DRAG_HANDLE: "item-drag-handle",
  ROW_ACTIONS: "row-actions",
  RUNBOOK_EMBED_ACTIONS: "runbook-embed-actions",

  // Blocks
  BLOCKS_LIST: "blocks-list",
  BLOCK_ITEM: "block-item",
  BLOCK_SURFACE: "block-surface",
  BLOCK_CARD: "block-card",
  COMMAND_CARD: "command-card",

  // Notes
  NOTE_EDITOR: "note-editor",
  NOTE_LINK: "note-link",
  NOTE_TABLE: "note-table",
  NOTE_CODE: "note-code",
  NOTE_CODE_NEUTRAL: "note-code-neutral",
  TEXT_MIRROR: "text-mirror",

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

  // Sidebar rows
  SIDEBAR_SECTION_LIST_ROW: "sidebar-section-list-row",
  LIBRARY_ROW: "library-row",
  LIBRARY_ROW_MAIN: "library-row-main",
  LIBRARY_ROW_LABEL: "library-row-label",
  LIBRARY_ROW_RENAME_INPUT: "library-row-rename-input",
  LIBRARY_ROW_RENAMING: "library-row-renaming",
  LIBRARY_ROW_BTN: "library-row-btn",
  LIBRARY_ROW_ICON: "library-row-icon",
  LIBRARY_ROW_NAME: "library-row-name",
  LIBRARY_RUNBOOK_BADGE: "library-runbook-badge",

  // Minimap
  MINIMAP_ON: "minimap-on",
  MINIMAP_LEFT: "minimap-left",
  MINIMAP_HOST: "minimap-host",
  MINIMAP_SCROLLER: "minimap-scroller",
} as const;

// Icon class combinations

export const HEADER_ICON_CLASS = `${CssClass.ICON} ${CssClass.ICON_BOLD}`;
export const SEMIBOLD_ICON_CLASS = `${CssClass.ICON_MD} ${CssClass.ICON_SEMIBOLD}`;
export const STANDARD_ICON_CLASS = `${CssClass.ICON_MD} ${CssClass.ICON_BOLD}`;

// Reveal tones

export const REVEAL_TONE_CLASS: Record<RevealTone, string | undefined> = {
  [RevealTone.NEUTRAL]: "row-reveal-neutral",
  [RevealTone.RESOLVED]: "row-reveal-resolved",
  [RevealTone.UNRESOLVED]: undefined,
};

// Animations

export const CssAnimation = {
  SURFACE_REVEAL: "surface-reveal",
} as const;
