export const ElementId = {
  APP_SHELL: "app-shell",
  APP_HEADER: "app-header",
  APP_NAME: "app-name",
  BLOCKS_LIST: "blocks-list",
  EMPTY_STATE: "empty-state",
  EMPTY_STATE_TITLE: "empty-state-title",
  EMPTY_STATE_HINT: "empty-state-hint",
  ADD_BLOCK_ROW: "add-block-row",
  KEYBINDINGS_BTN: "keybindings-btn",
  MODE_TOGGLE_BTN: "mode-toggle-btn",
  COLLAPSE_ALL_BTN: "collapse-all-btn",
  THEME_TOGGLE_BTN: "theme-toggle-btn",
} as const;

export const Selector = {
  NOTE_LINK: "a.note-link",
  BLOCK_ITEM: ".block-item",
  BLOCK_CONTROLS: ".block-controls",
  BLOCK_DRAG_HANDLE: ".block-drag-handle",
  RUNBOOK_ITEM_BTN: ".runbook-item-btn",
} as const;

export const InputSelector = {
  EDITABLE: "textarea, input",
} as const;

export const DataAttr = {
  BLOCK_ID: "data-block-id",
  RUNBOOK_ID: "data-runbook-id",
  VARIABLE_ID: "data-variable-id",
} as const;

export const Cursor = {
  DEFAULT: "",
  POINTER: "pointer",
} as const;

export const Anchor = {
  TARGET_BLANK: "_blank",
  REL: "noopener,noreferrer",
} as const;

export const ScrollIntoView = {
  BLOCK_CENTER: "center",
  BEHAVIOR_SMOOTH: "smooth",
} as const;
