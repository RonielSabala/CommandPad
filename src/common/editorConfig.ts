import { CodeLanguage } from "./enums";

export const COMMAND_PROMPT_PREFIX = "$";

export const ClampConfig = {
  MAX_LINES: 8,
  MAX_LINES_PROPERTY: "--clamp-max-lines",
} as const;

export const CodeToken = {
  FONT_MONO: "--font-mono",
  TAB_SIZE: "--tab-size",
  TEXT_BASE: "--text-base",
  TEXT_SM: "--text-sm",
  LINE_HEIGHT_RATIO: "--code-line-height-ratio",
  GUTTER_PAD_START: "--space-5",
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
  MINIMAP_SLIDER: "--minimap-slider",
  SCROLLBAR_THUMB_HOVER: "--scrollbar-thumb-hover",
} as const;

export const CodeMetricProperty = {
  LINE_HEIGHT_BASE: "--code-line-height-base",
  LINE_HEIGHT_SMALL: "--code-line-height-small",
  LINE_NUMBER_CHARS: "--code-line-number-chars",
  GUTTER_PAD_START: "--code-gutter-pad-start",
  GUTTER_GAP_BEFORE: "--code-gutter-gap-before",
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
  VARIABLE: "variable",
  PASTE_RUNBOOK: "runbook/paste",
  CLOUD_FILE: "runbook/cloud",
  RUNBOOK_SOURCE: "runbook/source",
} as const;

export const RUNBOOK_JSON_SCOPES: readonly string[] = [
  CodeModelScope.PASTE_RUNBOOK,
  CodeModelScope.CLOUD_FILE,
  CodeModelScope.RUNBOOK_SOURCE,
];

export const MonacoMinimap = {
  showSlider: "mouseover",
  renderCharacters: true,
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
  GUIDE_DIM_OPACITY: 0.35,
  SLIDER_OPACITY: 0.07,
  SLIDER_HOVER_OPACITY: 0.1,
  SLIDER_ACTIVE_OPACITY: 0.15,
} as const;

export const MonacoTokenScope = {
  JSON_KEY: "string.key.json",
  JSON_STRING: "string.value.json",
  JSON_NUMBER: "number.json",
  JSON_KEYWORD: "keyword.json",
  JSON_DELIMITER: "delimiter",
  JSON_COMMENT: "comment",
} as const;

export const MonacoMarker = {
  OWNER: "commandpad",
} as const;

export const XmlValidation = {
  MIME_TYPE: "application/xml",
  ERROR_TAG: "parsererror",
  CHROMIUM_LINE: "error on line ",
  CHROMIUM_COLUMN: " at column ",
  CHROMIUM_MESSAGE: ": ",
  FIREFOX_LINE: "Line Number ",
  FIREFOX_COLUMN: ", Column ",
} as const;

export const MonacoLayout = {
  FIRST_LINE: 1,
  FIRST_COLUMN: 1,
  LINE_NUMBER_MIN_CHARS: 1,
} as const;

export const DragScrollConfig = {
  EDGE_PX: 56,
  RAMP_PX: 56,
  MIN_SPEED: 4,
  MAX_SPEED: 16,
} as const;

export const VariableCompletionConfig = {
  /** The snippet parks the caret inside a call's parentheses. */
  SNIPPET_CARET: "$0",
  /** How far back a reference laid out over several lines is read. */
  MAX_REFERENCE_LINES: 20,
} as const;

export const MonacoContextMenu = {
  GROUP: "1_commandpad",
  OPEN_WAIT_FRAMES: 10,
  SHOW_ACTION: "editor.action.showContextMenu",
  TRIGGER_SOURCE: "commandpad",
} as const;

export const EditorActionId = {
  EXTRACT_VARIABLE: "commandpad.extractVariable",
} as const;

export const EditorActionOrder = {
  EXTRACT_VARIABLE: 1,
} as const;

/** The body-level nodes Monaco renders out of the editor into. */
export const MonacoLayer = {
  EDITOR_CLASS: "monaco-editor",
  OVERFLOW_ROOT_CLASS: "monaco-overflow-widgets",
  HOVER_ROOT_CLASS: "monaco-hover-layer",
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
  LANGUAGE: "language",
} as const;

export const BlockField = {
  TYPE: "type",
  TEXT: "text",
  SRC: "src",
  ALT: "alt",
  STYLE: "style",
  LANGUAGE: "language",
  EDITOR_COLLAPSED: "editorCollapsed",
} as const;

export const COMMAND_LANGUAGE_ORDER = [
  CodeLanguage.PLAIN,
  CodeLanguage.BASH,
  CodeLanguage.POWERSHELL,
  CodeLanguage.JSON,
  CodeLanguage.XML,
  CodeLanguage.YAML,
] as const;

export const CODE_LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  [CodeLanguage.PLAIN]: "Plain text",
  [CodeLanguage.BASH]: "Bash",
  [CodeLanguage.POWERSHELL]: "PowerShell",
  [CodeLanguage.JSON]: "JSON",
  [CodeLanguage.XML]: "XML",
  [CodeLanguage.YAML]: "YAML",
};

export const isCommandLanguage = (value: unknown): value is CodeLanguage =>
  COMMAND_LANGUAGE_ORDER.includes(value as CodeLanguage);

export const DEFAULT_COMMAND_LANGUAGE = CodeLanguage.BASH;

export const DEFAULT_VARIABLE_LANGUAGE = CodeLanguage.PLAIN;

export const RUNBOOK_JSON_PLACEHOLDER =
  '{\n  "variables": [],\n  "blocks": []\n}';
