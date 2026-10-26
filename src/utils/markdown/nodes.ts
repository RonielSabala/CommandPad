import { NoteNodeType } from "@/common/enums";
import type { NoteNode } from "@/common/types";
import { lineStarts, splitLines } from "../string";

import { parseNoteText } from "./inline";
import { readList } from "./list";
import { readTable } from "./table";

export function parseNoteNodes(text: string): NoteNode[] {
  const nodes: NoteNode[] = [];
  const lines = splitLines(text);
  const starts = lineStarts(lines);

  const flushText = (runStart: number, runEnd: number) => {
    if (runEnd <= runStart) {
      return;
    }

    const from = starts[runStart];
    const lastLine = starts[runEnd - 1];
    const to = lastLine + lines[runEnd - 1].length;

    nodes.push({
      type: NoteNodeType.TEXT,
      segments: to > from ? parseNoteText(text.slice(from, to), from) : [],
      emptyLastLine: to === lastLine ? to : undefined,
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
