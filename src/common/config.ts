import { ExportFormat } from "./enums";

export const StorageKey = {
  TABS: "commandpad_tabs",
  UI_STATE: "commandpad_ui_state",
  RUNBOOK_LIBRARY: "commandpad_runbook_library",
  SIDEBAR_SECTIONS: "commandpad_sidebar_sections",
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

export const SidebarWidth = {
  MIN: 0,
  MAX_SCREEN_FRACTION: 0.5,
  DEFAULT: 320,
  COLLAPSE_SNAP: 70,
} as const;

// Timeout durations
export const DRAG_TIMEOUT_MS = 50;
export const DEBOUNCE_SAVE_MS = 150;
export const COPY_FEEDBACK_TIMEOUT_MS = 1000;
export const TAB_HOVER_SWITCH_MS = 300;
export const SECTION_ANIMATION_FALLBACK_MS = 250;

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

export const BracketPairs = {
  "(": ")",
  "[": "]",
  "{": "}",
} as const;

// Variables

export const VariableTokenRegex = /\{((?:[^{}]|\{[^{}]*\})+)\}/g;
export const CommandVariableTokenRegex = /(?<!\\)\{((?:[^{}]|\{[^{}]*\})+)\}/g;
export const EscapedBraceRegex = /\\([{}])/g;
export const VariableParamPlaceholderRegex = /\{;([^};]+)\}/g;

export const VariableSyntax = {
  PARAM_SEPARATOR: ";",
  PARAM_ASSIGNMENT: "=",
} as const;

// Supported file types

interface FilePickerType {
  description: string;
  accept: Record<string, string[]>;
}

interface FilePickerFormat {
  defaultName: string;
  mimeType: string;
  types: FilePickerType[];
}

interface FilePickerInfo {
  mimeType: string;
  description: string;
}

const FILE_PICKER_INFO: Record<ExportFormat, FilePickerInfo> = {
  [ExportFormat.JSON]: {
    mimeType: "application/json",
    description: "CommandPad JSON",
  },
  [ExportFormat.MD]: { mimeType: "text/markdown", description: "Markdown" },
  [ExportFormat.TXT]: { mimeType: "text/plain", description: "Plain Text" },
};

export const FilePickerConfig: Record<ExportFormat, FilePickerFormat> =
  Object.fromEntries(
    Object.entries(FILE_PICKER_INFO).map(
      ([format, { mimeType, description }]) => [
        format,
        {
          defaultName: `runbook.commandpad_export.${format}`,
          mimeType,
          types: [{ description, accept: { [mimeType]: [`.${format}`] } }],
        },
      ],
    ),
  ) as Record<ExportFormat, FilePickerFormat>;
