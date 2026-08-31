export const Theme = {
  DARK: "dark",
  LIGHT: "light",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export const AppMode = {
  EDIT: "edit",
  READ: "read",
} as const;
export type AppMode = (typeof AppMode)[keyof typeof AppMode];

export const ExportFormat = {
  JSON: "json",
  MD: "md",
  TXT: "txt",
} as const;
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];

export const SectionState = {
  EXPANDED: "expanded",
  COLLAPSED: "collapsed",
} as const;
export type SectionState = (typeof SectionState)[keyof typeof SectionState];

export const TooltipVariant = {
  TEXT: "text",
  CODE: "code",
} as const;
export type TooltipVariant =
  (typeof TooltipVariant)[keyof typeof TooltipVariant];

export const TooltipSide = {
  TOP: "top",
  BOTTOM: "bottom",
} as const;
export type TooltipSide = (typeof TooltipSide)[keyof typeof TooltipSide];

export const PanelSide = {
  LEFT: "left",
  RIGHT: "right",
} as const;
export type PanelSide = (typeof PanelSide)[keyof typeof PanelSide];

export const PanelId = {
  SIDEBAR: "sidebar",
  DOCS_TOC: "docsToc",
} as const;
export type PanelId = (typeof PanelId)[keyof typeof PanelId];

export const TabDropSide = {
  LEFT: "left",
  RIGHT: "right",
} as const;
export type TabDropSide = (typeof TabDropSide)[keyof typeof TabDropSide];

export const MoveDirection = {
  UP: "up",
  DOWN: "down",
} as const;
export type MoveDirection = (typeof MoveDirection)[keyof typeof MoveDirection];

export const BlockType = {
  NOTE: "note",
  COMMAND: "command",
  IMAGE: "image",
  DIVIDER: "divider",
} as const;
export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export const InsertPosition = {
  ABOVE: "above",
  BELOW: "below",
} as const;
export type InsertPosition =
  (typeof InsertPosition)[keyof typeof InsertPosition];

export const NoteStyle = {
  BODY: "body",
  SUBHEADING: "subheading",
  HEADING: "heading",
} as const;
export type NoteStyle = (typeof NoteStyle)[keyof typeof NoteStyle];

export const ReferenceSurface = {
  COMMAND: "command",
  VALUE: "value",
} as const;
export type ReferenceSurface =
  (typeof ReferenceSurface)[keyof typeof ReferenceSurface];

export const ReferenceChunk = {
  KEY: "key",
  PARAM: "param",
  OPERATION: "operation",
} as const;
export type ReferenceChunk =
  (typeof ReferenceChunk)[keyof typeof ReferenceChunk];

export const CommandSegmentType = {
  LITERAL: "literal",
  RESOLVED: "resolved",
  UNRESOLVED: "unresolved",
  SECRET: "secret",
} as const;
export type CommandSegmentType =
  (typeof CommandSegmentType)[keyof typeof CommandSegmentType];

export const NoteSegmentType = {
  TEXT: "text",
  BOLD: "bold",
  ITALIC: "italic",
  CODE: "code",
  LINK: "link",
} as const;
export type NoteSegmentType =
  (typeof NoteSegmentType)[keyof typeof NoteSegmentType];

export const NoteNodeType = {
  TEXT: "text",
  TABLE: "table",
  LIST: "list",
} as const;
export type NoteNodeType = (typeof NoteNodeType)[keyof typeof NoteNodeType];

export const NoteTableAlign = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
} as const;
export type NoteTableAlign =
  (typeof NoteTableAlign)[keyof typeof NoteTableAlign];

export const VariableField = {
  KEY: "key",
  VALUE: "value",
  SECRET: "secret",
} as const;
export type VariableField = (typeof VariableField)[keyof typeof VariableField];

export const SelectionGroup = {
  BLOCK: "block",
  VARIABLE: "variable",
} as const;
export type SelectionGroup =
  (typeof SelectionGroup)[keyof typeof SelectionGroup];

export const LassoMode = {
  SELECT: "select",
  DESELECT: "deselect",
} as const;
export type LassoMode = (typeof LassoMode)[keyof typeof LassoMode];

export const DragGroup = {
  RUNBOOK: "runbook",
  VARIABLE: "variable",
  DOCS_DEMO: "docs-demo",
} as const;
export type DragGroup = (typeof DragGroup)[keyof typeof DragGroup];

export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;
export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export const HttpStatus = {
  NOT_FOUND: 404,
} as const;
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];

export const CloudProvider = {
  ONEDRIVE: "onedrive",
  GOOGLE_DRIVE: "google-drive",
} as const;
export type CloudProvider = (typeof CloudProvider)[keyof typeof CloudProvider];

export const SyncDestination = {
  LOCAL: "local",
  ONEDRIVE: CloudProvider.ONEDRIVE,
  GOOGLE_DRIVE: CloudProvider.GOOGLE_DRIVE,
} as const;
export type SyncDestination =
  (typeof SyncDestination)[keyof typeof SyncDestination];

export const CloudSortColumn = {
  NAME: "name",
  MODIFIED: "modified",
  SIZE: "size",
} as const;
export type CloudSortColumn =
  (typeof CloudSortColumn)[keyof typeof CloudSortColumn];

export const SortDirection = {
  ASC: "asc",
  DESC: "desc",
} as const;
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export const HistoryDirection = {
  BACK: "back",
  FORWARD: "forward",
} as const;
export type HistoryDirection =
  (typeof HistoryDirection)[keyof typeof HistoryDirection];

export const CloudExportStatus = {
  IDLE: "idle",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
} as const;
export type CloudExportStatus =
  (typeof CloudExportStatus)[keyof typeof CloudExportStatus];

export const RunbookSyncStatus = {
  SYNCED: "synced",
  SYNCING: "syncing",
  SIGNED_OUT: "signed-out",
  ERROR: "error",
} as const;
export type RunbookSyncStatus =
  (typeof RunbookSyncStatus)[keyof typeof RunbookSyncStatus];

export const RunbookView = {
  SOURCE: "source",
  PREVIEW: "preview",
  VARIABLES: "variables",
} as const;
export type RunbookView = (typeof RunbookView)[keyof typeof RunbookView];

export const CommandSurface = {
  PREVIEW: "preview",
  EDITOR: "editor",
} as const;
export type CommandSurface =
  (typeof CommandSurface)[keyof typeof CommandSurface];

export const CodeLanguage = {
  PLAIN: "plaintext",
  BASH: "shell",
  POWERSHELL: "powershell",
  JSON: "json",
  XML: "xml",
  YAML: "yaml",
} as const;
export type CodeLanguage = (typeof CodeLanguage)[keyof typeof CodeLanguage];

export const CodeRendering = {
  LIVE: "live",
  STATIC: "static",
} as const;
export type CodeRendering = (typeof CodeRendering)[keyof typeof CodeRendering];

export const VaultStatus = {
  ABSENT: "absent",
  LOCKED: "locked",
  UNLOCKED: "unlocked",
  UNSUPPORTED: "unsupported",
} as const;
export type VaultStatus = (typeof VaultStatus)[keyof typeof VaultStatus];

export const VaultPrompt = {
  CREATE: "create",
  UNLOCK: "unlock",
  CHANGE: "change",
} as const;
export type VaultPrompt = (typeof VaultPrompt)[keyof typeof VaultPrompt];

export const VaultField = {
  CURRENT: "current",
  NEXT: "next",
  CONFIRM: "confirm",
} as const;
export type VaultField = (typeof VaultField)[keyof typeof VaultField];

export const VaultError = {
  TOO_SHORT: "too-short",
  MISMATCH: "mismatch",
  UNCHANGED: "unchanged",
  WRONG_PASSPHRASE: "wrong-passphrase",
} as const;
export type VaultError = (typeof VaultError)[keyof typeof VaultError];

export const DialogTone = {
  DANGER: "danger",
  WARNING: "warning",
  INFO: "info",
} as const;
export type DialogTone = (typeof DialogTone)[keyof typeof DialogTone];
