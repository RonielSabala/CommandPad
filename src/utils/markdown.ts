import { TAB_CHARACTER } from "@/common/constants/events";
import { NoteNodeType, NoteSegmentType, NoteTableAlign } from "@/common/enums";
import {
  MarkdownDelimiter,
  MarkdownEscapeRegex,
  MarkdownList,
  MarkdownTable,
  MarkdownToken,
} from "@/common/markdownSyntax";
import type {
  NoteList,
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

const SEPARATOR = MarkdownDelimiter.TABLE_SEPARATOR;

function unescape(text: string): string {
  return text.replace(MarkdownEscapeRegex, "$1");
}

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
        text: unescape(text.slice(lastIndex, matchIdx)),
        start: offset + lastIndex,
      });
    }

    const groups = match.groups;
    const code = groups?.code;
    const bold = groups?.bold;
    const italic = groups?.italicAlt ?? groups?.italic;
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
        text: unescape(bold),
        start: startOf(bold),
      });
    } else if (italic !== undefined) {
      segments.push({
        type: NoteSegmentType.ITALIC,
        text: unescape(italic),
        start: startOf(italic),
      });
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: unescape(linkLabel),
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
      text: unescape(text.slice(lastIndex)),
      start: offset + lastIndex,
    });
  }

  return segments;
}

interface RawCell {
  text: string;
  start: number;
}

function hasSeparator(line: string): boolean {
  return MarkdownTable.SEPARATOR_REGEX.test(line);
}

/** The trimmed cells of one table row, each with its index in the raw note. */
function splitRowCells(line: string, lineStart: number): RawCell[] {
  const cells: RawCell[] = [];

  let offset = lineStart;
  for (const part of line.split(MarkdownTable.SEPARATOR_REGEX)) {
    const leading = part.length - part.trimStart().length;
    const text = part
      .trim()
      .replace(MarkdownTable.ESCAPED_SEPARATOR_REGEX, SEPARATOR);

    cells.push({ text, start: offset + leading });
    offset += part.length + SEPARATOR.length;
  }

  // The bars a row may be wrapped in produce an empty cell at either end
  const trimmed = line.trim();
  if (trimmed.startsWith(SEPARATOR)) {
    cells.shift();
  }
  if (
    trimmed.length > SEPARATOR.length &&
    MarkdownTable.TRAILING_SEPARATOR_REGEX.test(trimmed)
  ) {
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
  const opens = delimiter.startsWith(MarkdownDelimiter.TABLE_ALIGN);
  const closes = delimiter.endsWith(MarkdownDelimiter.TABLE_ALIGN);

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
    !hasSeparator(header) ||
    !hasSeparator(delimiter)
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
  while (end < lines.length && hasSeparator(lines[end])) {
    rows.push(toRow(splitRowCells(lines[end], starts[end]), aligns));
    end++;
  }

  return { table: { head: toRow(headerCells, aligns), rows }, endLine: end };
}

interface RawListItem {
  indent: number;
  ordered: boolean;
  start: number;
  text: string;
  textStart: number;
}

function measureIndent(indent: string): number {
  let width = 0;
  for (const char of indent) {
    width += char === TAB_CHARACTER ? MarkdownList.TAB_WIDTH : 1;
  }

  return width;
}

function readListItem(line: string, lineStart: number): RawListItem | null {
  const match = MarkdownList.ITEM_REGEX.exec(line);
  const groups = match?.groups;

  if (!match || !groups) {
    return null;
  }

  const { indent = "", ordinal } = groups;
  const marker = match[0].length;

  return {
    indent: measureIndent(indent),
    ordered: ordinal !== undefined,
    start: ordinal === undefined ? MarkdownList.FIRST_ORDINAL : Number(ordinal),
    text: line.slice(marker),
    textStart: lineStart + marker,
  };
}

interface ListMatch {
  list: NoteList;
  /** How many of `items` the list took, i.e. where the next one starts. */
  next: number;
}

function buildList(items: RawListItem[], index: number): ListMatch {
  const first = items[index];
  const list: NoteList = {
    ordered: first.ordered,
    start: first.start,
    items: [],
  };

  let i = index;
  while (i < items.length) {
    const item = items[i];

    if (item.indent > first.indent) {
      const nested = buildList(items, i);
      list.items[list.items.length - 1].lists.push(nested.list);
      i = nested.next;
      continue;
    }

    if (item.indent < first.indent || item.ordered !== first.ordered) {
      break;
    }

    list.items.push({
      segments: parseNoteText(item.text, item.textStart),
      lists: [],
    });
    i++;
  }

  return { list, next: i };
}

interface ListNodeMatch {
  list: NoteList;
  endLine: number;
}

function readList(
  lines: string[],
  starts: number[],
  line: number,
): ListNodeMatch | null {
  const items: RawListItem[] = [];

  let end = line;
  while (end < lines.length) {
    const item = readListItem(lines[end], starts[end]);
    if (!item) {
      break;
    }

    items.push(item);
    end++;
  }

  if (items.length === 0) {
    return null;
  }

  const { list, next } = buildList(items, 0);
  return { list, endLine: line + next };
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
    const table = readTable(lines, starts, line);
    if (table) {
      flushText(runStart, line);
      nodes.push({ type: NoteNodeType.TABLE, table: table.table });
      line = table.endLine;
      runStart = line;
      continue;
    }

    const list = readList(lines, starts, line);
    if (list) {
      flushText(runStart, line);
      nodes.push({ type: NoteNodeType.LIST, list: list.list });
      line = list.endLine;
      runStart = line;
      continue;
    }

    line++;
  }

  flushText(runStart, lines.length);

  return nodes;
}

export function noteToPlainText(text: string): string {
  const segmentsText = (segments: NoteSegment[]) =>
    segments.map((segment) => segment.text).join("");

  const cellText = (cell: NoteTableCell) => segmentsText(cell.segments);

  const listText = (list: NoteList): string =>
    list.items
      .map((item) =>
        [segmentsText(item.segments), ...item.lists.map(listText)]
          .filter(Boolean)
          .join(" "),
      )
      .join(" ");

  return parseNoteNodes(text)
    .map((node) => {
      if (node.type === NoteNodeType.TABLE) {
        return [node.table.head, ...node.table.rows]
          .flatMap((row) => row.map(cellText))
          .join(" ");
      }

      return node.type === NoteNodeType.LIST
        ? listText(node.list)
        : segmentsText(node.segments);
    })
    .join(" ");
}
