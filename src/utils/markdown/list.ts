import { TAB_CHARACTER } from "@/common/constants/events";
import { MarkdownList } from "@/common/markdownSyntax";
import type { NoteList } from "@/common/types";

import { parseNoteText } from "./inline";

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

export interface ListNodeMatch {
  list: NoteList;
  endLine: number;
}

export function readList(
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
