export const ElementId = {
  BLOCKS_LIST: "blocks-list",
} as const;

export const InputSelector = {
  EDITABLE: "textarea, input",
} as const;

export const EditCommand = {
  INSERT_TEXT: "insertText",
} as const;

export const DataAttr = {
  BLOCK_ID: "data-block-id",
  RUNBOOK_ID: "data-runbook-id",
  VARIABLE_ID: "data-variable-id",
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
  BLOCK_CENTER: "center",
  BEHAVIOR_SMOOTH: "smooth",
} as const;
