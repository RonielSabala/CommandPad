import { ExportFormat } from "./enums";

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

const DEFAULT_SIDEBAR_WIDTH = 320;

export const SidebarWidth = {
  MIN: 0,
  MAX_SCREEN_FRACTION: 0.5,
  DEFAULT: DEFAULT_SIDEBAR_WIDTH,
  COLLAPSE_SNAP: Math.round(DEFAULT_SIDEBAR_WIDTH / 3),
} as const;

// Share of the variable row given to the key input
export const VariableSplit = {
  MIN: 0.15,
  MAX: 0.85,
  DEFAULT: 0.5,
} as const;

// Timeout durations
export const DRAG_TIMEOUT_MS = 50;
export const DEBOUNCE_SAVE_MS = 150;
export const COPY_FEEDBACK_TIMEOUT_MS = 1000;
export const EXPORT_SUCCESS_TIMEOUT_MS = 1400;
export const TAB_HOVER_SWITCH_MS = 300;
export const SECTION_ANIMATION_FALLBACK_MS = 250;

export const MinimapConfig = {
  SCALE: 0.12,
  OVERSCROLL_PROPERTY: "--minimap-overscroll",
} as const;

// A docs section counts as current while its top edge sits in the upper quarter of the scroll container
export const DocsScrollSpy = {
  ROOT_MARGIN: "0px 0px -75% 0px",
  THRESHOLD: 0,
} as const;

// Markdown config

export const MarkdownSyntax = {
  HEADING: "#",
  SUBHEADING: "##",
  DIVIDER: "---",
  CODE_FENCE: "```bash",
  CODE_FENCE_END: "```",
} as const;

export const MarkdownToken = {
  CODE_REGEX: /[`´](.+?)[`´]/g,
  BOLD_REGEX: /\*\*(.+?)\*\*/g,
  ITALIC_REGEX: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|_(.+?)_/g,
  LINK_REGEX: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
  URL_REGEX: /(https?:\/\/[^\s<>"{}|\\^`[\]]*[^\s<>"{}|\\^`[\].,;:!?()-])/g,
} as const;

export const MarkdownWrap = {
  BOLD: "**",
  ITALIC: "_",
  CODE: "`",
} as const;

export const WrapPairs = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
} as const;

// Variables

export const VariableTokenRegex = /\{((?:[^{}]|\{[^{}]*\})+)\}/g;
export const CommandVariableTokenRegex = /(?<!\\)\{((?:[^{}]|\{[^{}]*\})+)\}/g;
export const EscapedBraceRegex = /\\([{}])/g;
export const VariableParamPlaceholderRegex = /\{;([^};]+)\}/g;

export const VariableSyntax = {
  PARAM_SEPARATOR: ";",
  PARAM_ASSIGNMENT: "=",
  COPY_SUFFIX: "_COPY",
  COPY_SUFFIX_REGEX: /_COPY\d*$/,
} as const;

export const COMMAND_PROMPT_PREFIX = "$";

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
