export const ElementId = {
  BLOCKS_LIST: "blocks-list",
  VARIABLES_LIST: "variables-list",
} as const;

export const MonacoSelector = {
  INPUT: "textarea.inputarea",
  EDIT_CONTEXT: ".native-edit-context",
  VIEW_LINES: ".view-lines",
  CONTEXT_MENU: ".monaco-menu",
  MENU_ITEM: ".action-item:not(.disabled):not(.separator)",
} as const;

export const InputSelector = {
  EDITABLE: `textarea, input, ${MonacoSelector.EDIT_CONTEXT}`,
  CODE: `${MonacoSelector.INPUT}, ${MonacoSelector.EDIT_CONTEXT}`,
} as const;

export const EditCommand = {
  INSERT_TEXT: "insertText",
} as const;

export const HtmlTag = {
  TABLE_HEADER_CELL: "th",
  TABLE_CELL: "td",
  PARAGRAPH: "p",
  DIV: "div",
} as const;

export const DataAttr = {
  BLOCK_ID: "data-block-id",
  RUNBOOK_ID: "data-runbook-id",
  VARIABLE_ID: "data-variable-id",
  NOTE_OFFSET: "data-note-offset",
  NOTE_ALIGN: "data-note-align",
  DRAG_IMAGE: "data-drag-image",
  PANEL_SIDE: "data-panel-side",
  PANEL_COLLAPSED: "data-panel-collapsed",
  TOOLTIP: "data-tooltip",
  TOOLTIP_VARIANT: "data-tooltip-variant",
  TOOLTIP_SIDE: "data-tooltip-side",
} as const;

export const Cursor = {
  DEFAULT: "",
  POINTER: "pointer",
  COL_RESIZE: "col-resize",
} as const;

export const Anchor = {
  TARGET_BLANK: "_blank",
  REL: "noopener,noreferrer",
} as const;

export const ScrollIntoView = {
  BLOCK_START: "start",
  BLOCK_CENTER: "center",
  BEHAVIOR_SMOOTH: "smooth",
} as const;
