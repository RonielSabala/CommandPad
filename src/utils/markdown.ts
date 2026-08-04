import { MarkdownTable, MarkdownToken } from "@/common/config";
import { NoteNodeType, NoteSegmentType, NoteTableAlign } from "@/common/enums";
import type {
  NoteNode,
  NoteSegment,
  NoteTable,
  NoteTableCell,
} from "@/common/types";
import { splitLines } from "./string";

const NOTE_TOKEN_REGEX = new RegExp(
  [
    MarkdownToken.CODE_REGEX.source,
    MarkdownToken.BOLD_REGEX.source,
    MarkdownToken.ITALIC_REGEX.source,
    MarkdownToken.LINK_REGEX.source,
    MarkdownToken.URL_REGEX.source,
  ].join("|"),
  "g",
);

const SEPARATOR = MarkdownTable.CELL_SEPARATOR;

function parseNoteText(text: string, offset = 0): NoteSegment[] {
  const segments: NoteSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  NOTE_TOKEN_REGEX.lastIndex = 0;

  while ((match = NOTE_TOKEN_REGEX.exec(text)) !== null) {
    const matched = match[0];
    const matchIdx = match.index;

    if (matchIdx > lastIndex) {
      segments.push({
        type: NoteSegmentType.TEXT,
        text: text.slice(lastIndex, matchIdx),
        start: offset + lastIndex,
      });
    }

    const groups = match.groups;
    const code = groups?.code;
    const bold = groups?.bold;
    const italic = groups?.italicStar ?? groups?.italicUnderscore;
    const linkLabel = groups?.linkLabel;
    const linkHref = groups?.linkHref;
    const url = groups?.url;

    const startOf = (rendered: string) =>
      offset + matchIdx + matched.indexOf(rendered);

    if (code !== undefined) {
      segments.push({
        type: NoteSegmentType.CODE,
        text: code,
        start: startOf(code),
      });
    } else if (bold !== undefined) {
      segments.push({
        type: NoteSegmentType.BOLD,
        text: bold,
        start: startOf(bold),
      });
    } else if (italic !== undefined) {
      segments.push({
        type: NoteSegmentType.ITALIC,
        text: italic,
        start: startOf(italic),
      });
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: linkLabel,
        href: linkHref,
        start: startOf(linkLabel),
      });
    } else if (url !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: url,
        start: startOf(url),
      });
    }

    lastIndex = matchIdx + matched.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: NoteSegmentType.TEXT,
      text: text.slice(lastIndex),
      start: offset + lastIndex,
    });
  }

  return segments;
}

interface RawCell {
  text: string;
  start: number;
}

/** The trimmed cells of one table row, each with its index in the raw note. */
function splitRowCells(line: string, lineStart: number): RawCell[] {
  const cells: RawCell[] = [];

  let offset = lineStart;
  for (const part of line.split(SEPARATOR)) {
    const leading = part.length - part.trimStart().length;
    cells.push({ text: part.trim(), start: offset + leading });
    offset += part.length + SEPARATOR.length;
  }

  // The bars a row may be wrapped in produce an empty cell at either end
  const trimmed = line.trim();
  if (trimmed.startsWith(SEPARATOR)) {
    cells.shift();
  }
  if (trimmed.length > SEPARATOR.length && trimmed.endsWith(SEPARATOR)) {
    cells.pop();
  }

  return cells;
}

function isDelimiterRow(cells: RawCell[]): boolean {
  return (
    cells.length > 0 &&
    cells.every((cell) => MarkdownTable.DELIMITER_CELL_REGEX.test(cell.text))
  );
}

function readAlign(delimiter: string): NoteTableAlign {
  const opens = delimiter.startsWith(MarkdownTable.ALIGN_MARKER);
  const closes = delimiter.endsWith(MarkdownTable.ALIGN_MARKER);

  if (opens && closes) {
    return NoteTableAlign.CENTER;
  }

  return closes ? NoteTableAlign.RIGHT : NoteTableAlign.LEFT;
}

function toRow(cells: RawCell[], aligns: NoteTableAlign[]): NoteTableCell[] {
  return aligns.map((align, column) => {
    const cell = cells[column];

    return {
      align,
      segments: cell ? parseNoteText(cell.text, cell.start) : [],
    };
  });
}

interface TableMatch {
  table: NoteTable;
  endLine: number;
}

function readTable(
  lines: string[],
  starts: number[],
  line: number,
): TableMatch | null {
  const header = lines[line];
  const delimiter = lines[line + 1];

  if (
    delimiter === undefined ||
    !header.includes(SEPARATOR) ||
    !delimiter.includes(SEPARATOR)
  ) {
    return null;
  }

  const delimiterCells = splitRowCells(delimiter, starts[line + 1]);
  const headerCells = splitRowCells(header, starts[line]);

  if (
    !isDelimiterRow(delimiterCells) ||
    headerCells.length !== delimiterCells.length
  ) {
    return null;
  }

  const aligns = delimiterCells.map((cell) => readAlign(cell.text));
  const rows: NoteTableCell[][] = [];

  let end = line + 2;
  while (end < lines.length && lines[end].includes(SEPARATOR)) {
    rows.push(toRow(splitRowCells(lines[end], starts[end]), aligns));
    end++;
  }

  return { table: { head: toRow(headerCells, aligns), rows }, endLine: end };
}

export function parseNoteNodes(text: string): NoteNode[] {
  const lines = splitLines(text);
  const nodes: NoteNode[] = [];

  const starts: number[] = [];
  let cursor = 0;
  for (const line of lines) {
    starts.push(cursor);
    cursor += line.length + 1;
  }

  const flushText = (runStart: number, runEnd: number) => {
    if (runEnd <= runStart) {
      return;
    }

    const from = starts[runStart];
    const to = starts[runEnd - 1] + lines[runEnd - 1].length;
    if (to <= from) {
      return;
    }

    nodes.push({
      type: NoteNodeType.TEXT,
      segments: parseNoteText(text.slice(from, to), from),
    });
  };

  let runStart = 0;
  let line = 0;

  while (line < lines.length) {
    const match = readTable(lines, starts, line);
    if (!match) {
      line++;
      continue;
    }

    flushText(runStart, line);
    nodes.push({ type: NoteNodeType.TABLE, table: match.table });
    line = match.endLine;
    runStart = line;
  }

  flushText(runStart, lines.length);

  return nodes;
}

export function noteToPlainText(text: string): string {
  const cellText = (cell: NoteTableCell) =>
    cell.segments.map((segment) => segment.text).join("");

  return parseNoteNodes(text)
    .map((node) =>
      node.type === NoteNodeType.TABLE
        ? [node.table.head, ...node.table.rows]
            .flatMap((row) => row.map(cellText))
            .join(" ")
        : node.segments.map((segment) => segment.text).join(""),
    )
    .join(" ");
}
