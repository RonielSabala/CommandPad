/**
 * Domain value enums. Modeled as frozen `as const` objects (not TS `enum`,
 * which is disallowed by `erasableSyntaxOnly`). Each pairs a runtime object
 * with a derived union type of the same name.
 */

export const AppMode = {
  EDIT: 'edit',
  READ: 'read',
} as const;
export type AppMode = (typeof AppMode)[keyof typeof AppMode];

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export const SidebarPosition = {
  LEFT: 'left',
  RIGHT: 'right',
} as const;
export type SidebarPosition = (typeof SidebarPosition)[keyof typeof SidebarPosition];

export const SectionState = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
} as const;
export type SectionState = (typeof SectionState)[keyof typeof SectionState];

export const BlockType = {
  NOTE: 'note',
  COMMAND: 'command',
  DIVIDER: 'divider',
} as const;
export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export const NoteStyle = {
  BODY: 'body',
  SUBHEADING: 'subheading',
  HEADING: 'heading',
} as const;
export type NoteStyle = (typeof NoteStyle)[keyof typeof NoteStyle];

export const SegmentType = {
  LITERAL: 'literal',
  RESOLVED: 'resolved',
  UNRESOLVED: 'unresolved',
  SECRET: 'secret',
} as const;
export type SegmentType = (typeof SegmentType)[keyof typeof SegmentType];

export const LassoMode = {
  SELECT: 'select',
  DESELECT: 'deselect',
} as const;
export type LassoMode = (typeof LassoMode)[keyof typeof LassoMode];

export const MoveDirection = {
  UP: 'up',
  DOWN: 'down',
} as const;
export type MoveDirection = (typeof MoveDirection)[keyof typeof MoveDirection];

export const VariableField = {
  KEY: 'key',
  VALUE: 'value',
  SECRET: 'secret',
} as const;
export type VariableField = (typeof VariableField)[keyof typeof VariableField];

export const ExportFormat = {
  JSON: 'json',
  MD: 'md',
  TXT: 'txt',
} as const;
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];
