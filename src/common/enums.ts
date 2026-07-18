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

export const SidebarPosition = {
  LEFT: "left",
  RIGHT: "right",
} as const;
export type SidebarPosition =
  (typeof SidebarPosition)[keyof typeof SidebarPosition];

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
  DIVIDER: "divider",
} as const;
export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export const NoteStyle = {
  BODY: "body",
  SUBHEADING: "subheading",
  HEADING: "heading",
} as const;
export type NoteStyle = (typeof NoteStyle)[keyof typeof NoteStyle];

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

export const VariableField = {
  KEY: "key",
  VALUE: "value",
  SECRET: "secret",
} as const;
export type VariableField = (typeof VariableField)[keyof typeof VariableField];

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
