import type {
  BlockType,
  NoteSegmentType,
  NoteStyle,
  SegmentType,
} from "./enums";

export interface Variable {
  id: string;
  key: string;
  value: string;
  secret?: boolean;
}

export interface CommandBlock {
  id: string;
  type: typeof BlockType.COMMAND;
  text: string;
  editorCollapsed?: boolean;
}

export interface NoteBlock {
  id: string;
  type: typeof BlockType.NOTE;
  text: string;
  style?: NoteStyle;
}

export interface DividerBlock {
  id: string;
  type: typeof BlockType.DIVIDER;
}

export type Block = CommandBlock | NoteBlock | DividerBlock;

// A workspace tab
export interface Tab {
  id: string;
  label: string;
  runbookId: string | null;
  variables: Variable[];
  blocks: Block[];
}

// Lightweight runbook library metadata (kept in localStorage)
export interface RunbookEntry {
  id: string;
  label: string;
  filename: string;
}

// Heavy runbook content (kept in IndexedDB)
export interface RunbookContent {
  variables: Variable[];
  blocks: Block[];
}

// One piece of a resolved command preview
export interface Segment {
  key?: string;
  text: string;
  type: SegmentType;
}

// One piece of parsed note markdown
export interface NoteSegment {
  text: string;
  type: NoteSegmentType;
}
