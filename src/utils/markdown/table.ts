import { NoteTableAlign } from "@/common/enums";
import { MarkdownDelimiter, MarkdownTable } from "@/common/markdownSyntax";
import type { NoteTable, NoteTableCell } from "@/common/types";

import { parseNoteText } from "./inline";

const SEPARATOR = MarkdownDelimiter.TABLE_SEPARATOR;

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

export interface TableMatch {
  table: NoteTable;
  endLine: number;
}

export function readTable(
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
