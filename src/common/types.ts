import type {
  BlockType,
  CommandSegmentType,
  NoteSegmentType,
  NoteStyle,
} from "./enums";

export interface NoteBlock {
  id: string;
  type: typeof BlockType.NOTE;
  text: string;
  style?: NoteStyle;
}

export interface CommandBlock {
  id: string;
  type: typeof BlockType.COMMAND;
  text: string;
  editorCollapsed?: boolean;
}

export interface DividerBlock {
  id: string;
  type: typeof BlockType.DIVIDER;
}

export type Block = CommandBlock | NoteBlock | DividerBlock;

export interface Variable {
  id: string;
  key: string;
  value: string;
  secret?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  runbookId: string | null;
  blocks: Block[];
  variables: Variable[];
}

export interface RunbookEntry {
  id: string;
  label: string;
  filename: string;
}

export interface RunbookContent {
  blocks: Block[];
  variables: Variable[];
}

export interface CommandSegment {
  key?: string;
  text: string;
  type: CommandSegmentType;
}

export interface NoteSegment {
  text: string;
  type: NoteSegmentType;
}
