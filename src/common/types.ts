import type {
  BlockType,
  CloudProvider,
  CommandSegmentType,
  InsertPosition,
  NoteNodeType,
  NoteSegmentType,
  NoteStyle,
  NoteTableAlign,
  PanelSide,
} from "./enums";

export interface PanelState {
  collapsed: boolean;
  side: PanelSide;
  width: number;
}

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

export interface ImageBlock {
  id: string;
  type: typeof BlockType.IMAGE;
  src: string;
  alt?: string;
}

export interface DividerBlock {
  id: string;
  type: typeof BlockType.DIVIDER;
}

export type Block = CommandBlock | NoteBlock | ImageBlock | DividerBlock;

export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>;

export interface BlockInsertAnchor {
  blockId: string;
  position: InsertPosition;
}

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
  scrollTop: number;
}

export interface RunbookSync {
  provider: CloudProvider;
  filename: string;
  folderId: string | null;
}

export interface RunbookEntry {
  id: string;
  label: string;
  filename: string;
  sync?: RunbookSync;
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
  href?: string;
  start: number;
}

export interface NoteTableCell {
  align: NoteTableAlign;
  segments: NoteSegment[];
}

export interface NoteTable {
  head: NoteTableCell[];
  rows: NoteTableCell[][];
}

export interface NoteListItem {
  segments: NoteSegment[];
  lists: NoteList[];
}

export interface NoteList {
  ordered: boolean;
  start: number;
  items: NoteListItem[];
}

export type NoteNode =
  | { type: typeof NoteNodeType.TEXT; segments: NoteSegment[] }
  | { type: typeof NoteNodeType.TABLE; table: NoteTable }
  | { type: typeof NoteNodeType.LIST; list: NoteList };
