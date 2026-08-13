export const ElementId = {
  BLOCKS_LIST: "blocks-list",
} as const;

export const MonacoSelector = {
  INPUT: "textarea.inputarea",
  EDIT_CONTEXT: ".native-edit-context",
} as const;

export const InputSelector = {
  EDITABLE: `textarea, input, ${MonacoSelector.EDIT_CONTEXT}`,
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
  PANEL_SIDE: "data-panel-side",
  PANEL_COLLAPSED: "data-panel-collapsed",
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
