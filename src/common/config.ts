import { ExportFormat } from "./enums";

export const StorageKey = {
  TABS: "commandpad_tabs",
  UI_STATE: "commandpad_ui_state",
  RUNBOOK_LIBRARY: "commandpad_runbook_library",
  SIDEBAR_SECTIONS: "commandpad_sidebar_sections",
  // Persisted (localStorage) so returning to the app in a later window skips the
  // landing page; cleared only by a full workspace reset.
  VISITED_HOME: "commandpad_visited_home",
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
