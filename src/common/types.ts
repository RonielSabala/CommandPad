import type {
  BlockType,
  CloudProvider,
  CodeLanguage,
  CommandSegmentType,
  EmbeddedRunbookStatus,
  InsertPosition,
  NoteNodeType,
  NoteSegmentType,
  NoteStyle,
  NoteTableAlign,
  PanelSide,
  RunbookEmbedView,
  RunbookView,
} from "./enums";

export interface PanelState {
  collapsed: boolean;
  side: PanelSide;
  width: number;
}

export interface CommandBlock {
  id: string;
  type: typeof BlockType.COMMAND;
  text: string;
  language?: CodeLanguage;
  editorCollapsed?: boolean;
}

export interface NoteBlock {
  id: string;
  type: typeof BlockType.NOTE;
  text: string;
  style?: NoteStyle;
}

export interface ImageBlock {
  id: string;
  type: typeof BlockType.IMAGE;
  src: string;
  alt?: string;
}

export interface CloudRunbookRef {
  provider: CloudProvider;
  path: string;
}

export interface RunbookBlock {
  id: string;
  type: typeof BlockType.RUNBOOK;
  label: string;
  runbookId?: string;
  cloud?: CloudRunbookRef;
  overrides?: Record<string, string>;
  collapsed?: boolean;
}

export interface DividerBlock {
  id: string;
  type: typeof BlockType.DIVIDER;
}

export type Block =
  | CommandBlock
  | NoteBlock
  | ImageBlock
  | RunbookBlock
  | DividerBlock;

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
  language?: CodeLanguage;
  options?: string[];
}

export interface VariableSection {
  id: string;
  name: string;
  /** Index of the section's first variable */
  start: number;
  collapsed?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  runbookId: string | null;
  blocks: Block[];
  variables: Variable[];
  variableSections: VariableSection[];
  view: RunbookView;
  scrollTop: Record<RunbookView, number>;
  /** What each runbook block's body shows. */
  embedViews?: Record<string, RunbookEmbedView>;
}

export interface RunbookSync {
  provider: CloudProvider;
  filename: string;
  folderId: string | null;
}

export interface VaultRecord {
  salt: string;
  verifier: string;
}

export interface RunbookEntry {
  id: string;
  label: string;
  filename: string;
  sync?: RunbookSync;
  /** Whether the runbook holds secret variables */
  secured?: boolean;
  /**  This runbook's passphrase. */
  vault?: VaultRecord;
}

export interface RunbookStats {
  bytes: number;
  blocks: number;
  variables: number;
}

export interface RunbookContent {
  blocks: Block[];
  variables: Variable[];
  variableSections: VariableSection[];
}

export interface EmbeddedRunbook {
  status: EmbeddedRunbookStatus;
  content: RunbookContent | null;
  /** Due a reload. */
  stale?: boolean;
  /** The library runbook kept in this cloud file. */
  runbookId?: string;
}

export interface ResolvedSpan {
  text: string;
  depth: number;
  source?: string;
}

export interface CommandSegment {
  key?: string;
  text: string;
  type: CommandSegmentType;
  spans?: ResolvedSpan[];
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
