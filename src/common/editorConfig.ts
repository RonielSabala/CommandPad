export const COMMAND_PROMPT_PREFIX = "$";

export const CommandClampConfig = {
  MAX_LINES: 8,
  MAX_LINES_PROPERTY: "--command-clamp-max-lines",
} as const;

export const CodeToken = {
  FONT_MONO: "--font-mono",
  TAB_SIZE: "--tab-size",
  TEXT_BASE: "--text-base",
  TEXT_SM: "--text-sm",
  LINE_HEIGHT_RATIO: "--code-line-height-ratio",
  GUTTER_GAP_BEFORE: "--space-5",
  GUTTER_GAP_AFTER: "--space-6",
} as const;

export const ColorToken = {
  TEXT_PRIMARY: "--color-text-primary",
  TEXT_SECONDARY: "--color-text-secondary",
  TEXT_MUTED: "--color-text-muted",
  SUCCESS: "--success",
  DANGER: "--danger",
  WARNING: "--warning",
  ACCENT: "--accent",
  ACCENT_DIM: "--accent-dim",
  ACCENT_TEXT: "--accent-text",
  CONSTANT_TEXT: "--constant-text",
  SURFACE: "--color-surface",
  SURFACE_ALT: "--color-surface-alt",
  BORDER: "--color-border",
  BORDER_FOCUS: "--color-border-focus",
  SELECTION: "--selection-color",
  SCROLLBAR_THUMB: "--scrollbar-thumb",
  SCROLLBAR_THUMB_HOVER: "--scrollbar-thumb-hover",
} as const;

export const CodeMetricProperty = {
  LINE_HEIGHT_BASE: "--code-line-height-base",
  LINE_HEIGHT_SMALL: "--code-line-height-small",
  LINE_NUMBER_CHARS: "--code-line-number-chars",
} as const;

export const CodeEditorProperty = {
  GUTTER_WIDTH: "--code-editor-gutter-width",
} as const;

export const CodeModelConfig = {
  SCHEME: "commandpad",
  RUNBOOK_SUFFIX: ".runbook.json",
  PLAIN_SUFFIX: ".txt",
} as const;

export const CodeModelScope = {
  COMMAND: "command",
  PASTE_RUNBOOK: "runbook/paste",
  CLOUD_FILE: "runbook/cloud",
} as const;

export const MonacoWorkerLabel = {
  JSON: "json",
} as const;

export const MonacoTheme = {
  DARK: "commandpad-dark",
  LIGHT: "commandpad-light",
  BASE_DARK: "vs-dark",
  BASE_LIGHT: "vs",
  ITALIC: "italic",
  TRANSPARENT: "#00000000",
} as const;

export const MonacoTokenScope = {
  JSON_KEY: "string.key.json",
  JSON_STRING: "string.value.json",
  JSON_NUMBER: "number.json",
  JSON_KEYWORD: "keyword.json",
  JSON_DELIMITER: "delimiter",
  JSON_COMMENT: "comment",
} as const;

export const MonacoLayout = {
  FIRST_LINE: 1,
  FIRST_COLUMN: 1,
  LINE_NUMBER_MIN_CHARS: 3,
} as const;

// --- Runbook JSON schema ---

export const RunbookSchemaConfig = {
  SCHEMA_URI: "commandpad://schemas/runbook.json",
  FILE_MATCH: `*${CodeModelConfig.RUNBOOK_SUFFIX}`,
} as const;

export const JsonSchemaType = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  BOOLEAN: "boolean",
} as const;

export const RunbookField = {
  VARIABLES: "variables",
  BLOCKS: "blocks",
} as const;

export const VariableField = {
  KEY: "key",
  VALUE: "value",
  SECRET: "secret",
} as const;

export const BlockField = {
  TYPE: "type",
  TEXT: "text",
  SRC: "src",
  ALT: "alt",
  STYLE: "style",
  EDITOR_COLLAPSED: "editorCollapsed",
} as const;

export const RUNBOOK_JSON_PLACEHOLDER =
  '{\n  "variables": [],\n  "blocks": []\n}';
