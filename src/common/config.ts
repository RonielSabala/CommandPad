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

// Timeout durations
export const DRAG_TIMEOUT_MS = 50;
export const DEBOUNCE_SAVE_MS = 150;
export const COPY_FEEDBACK_TIMEOUT_MS = 1000;

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
  URL_REGEX: /(https?:\/\/[^\s<>"{}|\\^`[\]]*[^\s<>"{}|\\^`[\].,;:!?()-])/g,
} as const;

export const MarkdownWrap = {
  BOLD: "**",
  ITALIC: "_",
  CODE: "`",
} as const;

// Variables

export const VariableTokenRegex = /\{((?:[^{}]|\{[^{}]*\})+)\}/g;
export const VariableParamPlaceholderRegex = /\{:([^};]+)\}/g;

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
  suggestedName: string;
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
          suggestedName: `commandpad-export.${format}`,
          mimeType,
          types: [{ description, accept: { [mimeType]: [`.${format}`] } }],
        },
      ],
    ),
  ) as Record<ExportFormat, FilePickerFormat>;
