import { ExportFormat, PanelId, PanelSide } from "./enums";
import type { PanelState } from "./types";

export const StorageKey = {
  TABS: "commandpad_tabs",
  UI_STATE: "commandpad_ui_state",
  RUNBOOK_LIBRARY: "commandpad_runbook_library",
  SIDEBAR_SECTIONS: "commandpad_sidebar_sections",
  VISITED_HOME: "commandpad_visited_home",
  GOOGLE_SESSION: "commandpad_google_session",
} as const;

export const RunbookConfig = {
  LABEL_MAX_LENGTH: 60,
  DEFAULT_LABEL: "Untitled runbook",
} as const;

export const RunbookDbConfig = {
  DB_VERSION: 1,
  DB_NAME: "commandpad_runbooks_db",
  STORE_NAME: "runbooks",
} as const;

export const IndexedDbTransactionMode = {
  READ_WRITE: "readwrite",
  READ_ONLY: "readonly",
} as const;

export const DEFAULT_TAB_LABEL = "Untitled";
export const DEFAULT_CONFIRM_LABEL = "Confirm";

export interface PanelDefinition {
  defaultWidth: number;
  defaultSide: PanelSide;
  maxScreenFraction: number;
  collapseSnap: number;
}

const COLLAPSE_SNAP_RATIO = 1 / 3;

function panelDefinition(
  defaultWidth: number,
  defaultSide: PanelSide,
): PanelDefinition {
  return {
    defaultWidth,
    defaultSide,
    maxScreenFraction: 0.5,
    collapseSnap: Math.round(defaultWidth * COLLAPSE_SNAP_RATIO),
  };
}

export const PANEL_DEFINITIONS: Record<PanelId, PanelDefinition> = {
  [PanelId.SIDEBAR]: panelDefinition(320, PanelSide.LEFT),
  [PanelId.DOCS_TOC]: panelDefinition(320, PanelSide.LEFT),
};

export function createDefaultPanels(): Record<PanelId, PanelState> {
  const panels = {} as Record<PanelId, PanelState>;

  for (const panelId of Object.keys(PANEL_DEFINITIONS) as PanelId[]) {
    const definition = PANEL_DEFINITIONS[panelId];
    panels[panelId] = {
      collapsed: false,
      side: definition.defaultSide,
      width: definition.defaultWidth,
    };
  }

  return panels;
}

export const VariableSplit = {
  MIN: 0.15,
  MAX: 0.85,
  DEFAULT: 0.5,
} as const;

// Timeout durations
export const DRAG_TIMEOUT_MS = 50;
export const DEBOUNCE_SAVE_MS = 150;
export const DEBOUNCE_CLOUD_SYNC_MS = 1000;
export const COPY_FEEDBACK_TIMEOUT_MS = 1000;
export const EXPORT_SUCCESS_TIMEOUT_MS = 1000;
export const TAB_HOVER_SWITCH_MS = 300;
export const SECTION_ANIMATION_FALLBACK_MS = 250;

export const MinimapConfig = {
  SCALE: 0.12,
  OVERSCROLL_PROPERTY: "--minimap-overscroll",
} as const;

// A docs section becomes current once its top edge crosses this far down the scroll container
export const DocsScrollSpy = {
  TRIGGER_RATIO: 0.05,
} as const;

export const WrapPairs = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
} as const;

export const SecretMaskConfig = {
  MASK_LENGTH: 8,
  MASK_CHAR: "•",
} as const;

export const StringCaseConfig = {
  SNAKE_SEPARATOR: "_",
  KEBAB_SEPARATOR: "-",
  // Kept inside a word so `don't` titles as `Don't` rather than `Don'T`
  APOSTROPHE: "'",
} as const;

export const COMMAND_PROMPT_PREFIX = "$";

export const CommandClampConfig = {
  MAX_LINES: 8,
  MAX_LINES_PROPERTY: "--command-clamp-max-lines",
} as const;

// --- Code editor ---

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

export const ImageBlockConfig = {
  ACCEPT: "image/*",
  MIME_PREFIX: "image/",
  MAX_BYTES: 5 * 1024 * 1024,
  DATA_IMAGE_PREFIX: "data:image/",
  HTTP_PROTOCOLS: ["http:", "https:"],
} as const;

export const RUNBOOK_JSON_PLACEHOLDER =
  '{\n  "variables": [],\n  "blocks": []\n}';

// Supported file types

export const JSON_EXTENSION = `.${ExportFormat.JSON}`;

export const MimeType = {
  JSON: "application/json",
  MARKDOWN: "text/markdown",
  PLAIN_TEXT: "text/plain",
  ZIP: "application/zip",
} as const;
export type MimeType = (typeof MimeType)[keyof typeof MimeType];

export const CONTENT_TYPE_HEADER = "Content-Type";

export function contentTypeHeaders(mimeType: string): Record<string, string> {
  return { [CONTENT_TYPE_HEADER]: mimeType };
}

interface FilePickerType {
  description: string;
  accept: Record<string, string[]>;
}

interface FilePickerFormat {
  mimeType: string;
  types: FilePickerType[];
}

interface FilePickerInfo {
  mimeType: string;
  description: string;
}

const FILE_PICKER_INFO: Record<ExportFormat, FilePickerInfo> = {
  [ExportFormat.JSON]: {
    mimeType: MimeType.JSON,
    description: "CommandPad JSON",
  },
  [ExportFormat.MD]: { mimeType: MimeType.MARKDOWN, description: "Markdown" },
  [ExportFormat.TXT]: {
    mimeType: MimeType.PLAIN_TEXT,
    description: "Plain Text",
  },
};

export const FilePickerConfig: Record<ExportFormat, FilePickerFormat> =
  Object.fromEntries(
    Object.entries(FILE_PICKER_INFO).map(
      ([format, { mimeType, description }]) => [
        format,
        {
          mimeType,
          types: [{ description, accept: { [mimeType]: [`.${format}`] } }],
        },
      ],
    ),
  ) as Record<ExportFormat, FilePickerFormat>;

// Cloud sync

export const CloudSyncConfig = {
  APP_FOLDER_NAME: "CommandPad",
  PATH_SEPARATOR: "/",
  MAX_SEARCH_DEPTH: 10,
  NO_SIZE_PLACEHOLDER: "—",
} as const;

export const MessageListConfig = {
  MAX_ITEMS: 8,
  OVERFLOW: "...",
} as const;

// Copies made by a "Duplicate" action

export const DuplicateNameConfig = {
  SUFFIX: (index: number) => ` (${index})`,
  SUFFIX_REGEX: / \(\d+\)$/,
  FIRST_INDEX: 1,
} as const;

// Zip archives

export const ZIP_EXTENSION = ".zip";

export const ZipConfig = {
  LOCAL_HEADER_SIGNATURE: 0x04034b50,
  CENTRAL_HEADER_SIGNATURE: 0x02014b50,
  END_RECORD_SIGNATURE: 0x06054b50,
  LOCAL_HEADER_SIZE: 30,
  CENTRAL_HEADER_SIZE: 46,
  END_RECORD_SIZE: 22,
  VERSION: 20,
  UTF8_FLAG: 0x0800,
  STORED_METHOD: 0,
  CRC_POLYNOMIAL: 0xedb88320,
  CRC_SEED: 0xffffffff,
  CRC_TABLE_SIZE: 256,
  DOS_EPOCH_YEAR: 1980,
} as const;

export const FileSizeConfig = {
  BASE: 1024,
  UNITS: ["B", "KB", "MB", "GB"],
  DECIMALS: 1,
} as const;

export const FileTimeFormat: Intl.DateTimeFormatOptions = {
  timeStyle: "short",
};

export const FileDateFormat: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
};

export const AuthResponseParam = {
  STATE: "state",
  CODE: "code",
  ERROR: "error",
} as const;

export const SharePointConfig = {
  CLIENT_ID: import.meta.env.VITE_MSAL_CLIENT_ID ?? "",
  AUTHORITY: "https://login.microsoftonline.com/common",
  REDIRECT_URI: window.location.origin,
  SCOPES: ["User.Read", "Files.ReadWrite.AppFolder"],
  GRAPH_BASE_URL: "https://graph.microsoft.com/v1.0",
} as const;

export const GoogleDriveConfig = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
  SCOPES: "https://www.googleapis.com/auth/drive.file",
  API_BASE_URL: "https://www.googleapis.com/drive/v3",
  UPLOAD_BASE_URL: "https://www.googleapis.com/upload/drive/v3",
} as const;
