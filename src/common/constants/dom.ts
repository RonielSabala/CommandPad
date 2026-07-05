export const ElementId = {
  APP_SHELL: "app-shell",
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
