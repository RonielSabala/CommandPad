export const StorageKey = {
  STATE: "commandpad_state",
  TABS: "commandpad_tabs",
} as const;

export const RunbookConfig = {
  DB_NAME: "commandpad_runbooks_db",
  DB_VERSION: 1,
  STORE_NAME: "runbooks",
  LIBRARY_STORAGE_KEY: "commandpad_runbook_library",
  SECTIONS_STORAGE_KEY: "commandpad_sidebar_sections",
  DEFAULT_LABEL: "Untitled runbook",
  LABEL_MAX_LENGTH: 60,
} as const;

export const IndexedDbTransactionMode = {
  READ_WRITE: "readwrite",
  READ_ONLY: "readonly",
} as const;

export const DEFAULT_TAB_LABEL = "Untitled";

export const UI = {
  SECRET_MASK: "******",
} as const;

// Debounce / timeout durations
export const DEFER_MS = 0;
export const COPY_FEEDBACK_TIMEOUT_MS = 1000;
export const DEBOUNCE_SAVE_MS = 150;
export const DUPLICATE_FLASH_MS = 500;
export const DRAG_TIMEOUT_MS = 50;

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

export interface FilePickerType {
  description: string;
  accept: Record<string, string[]>;
}

export interface FilePickerFormat {
  suggestedName: string;
  mimeType: string;
  types: FilePickerType[];
}

export const FilePickerConfig: Record<"json" | "md" | "txt", FilePickerFormat> =
  {
    json: {
      suggestedName: "commandpad-export.json",
      mimeType: "application/json",
      types: [
        {
          description: "CommandPad JSON",
          accept: { "application/json": [".json"] },
        },
      ],
    },
    md: {
      suggestedName: "commandpad-export.md",
      mimeType: "text/markdown",
      types: [
        { description: "Markdown", accept: { "text/markdown": [".md"] } },
      ],
    },
    txt: {
      suggestedName: "commandpad-export.txt",
      mimeType: "text/plain",
      types: [
        { description: "Plain Text", accept: { "text/plain": [".txt"] } },
      ],
    },
  };
