import { LINE_BREAK } from "@/common/config";
import {
  NoteFormat,
  NoteFormatState,
  NoteNodeType,
  NoteSegmentType,
} from "@/common/enums";
import { MarkdownDelimiter, MarkdownList } from "@/common/markdownSyntax";
import type { NoteList, NoteNode, NoteSegment } from "@/common/types";

import { clamp } from "../number";
import { joinLines, splitLines } from "../string";
import { parseNoteNodes } from "./nodes";

export interface NoteRange {
  from: number;
  to: number;
}

export interface NoteEdit extends NoteRange {
  text: string;
  selection: NoteRange;
}

export interface NoteFormatPlan {
  state: NoteFormatState;
  apply: () => NoteEdit | null;
}

const DISABLED: NoteFormatPlan = {
  state: NoteFormatState.DISABLED,
  apply: () => null,
};

// --- Formats ---

const INLINE_FORMATS = {
  [NoteFormat.BOLD]: {
    mark: MarkdownDelimiter.BOLD,
    type: NoteSegmentType.BOLD,
  },
  [NoteFormat.ITALIC]: {
    mark: MarkdownDelimiter.ITALIC,
    type: NoteSegmentType.ITALIC,
  },
  [NoteFormat.STRIKETHROUGH]: {
    mark: MarkdownDelimiter.STRIKETHROUGH,
    type: NoteSegmentType.STRIKETHROUGH,
  },
  [NoteFormat.CODE]: {
    mark: MarkdownDelimiter.CODE,
    type: NoteSegmentType.CODE,
  },
} as const;
type InlineFormat = keyof typeof INLINE_FORMATS;

const LIST_FORMATS = {
  [NoteFormat.NUMBERED_LIST]: { ordered: true },
  [NoteFormat.BULLETED_LIST]: { ordered: false },
} as const;
type ListFormat = keyof typeof LIST_FORMATS;

// --- Helpers ---

function listSegments(list: NoteList): NoteSegment[] {
  return list.items.flatMap((item) => [
    ...item.segments,
    ...item.lists.flatMap(listSegments),
  ]);
}

function nodeSegments(node: NoteNode): NoteSegment[] {
  switch (node.type) {
    case NoteNodeType.TEXT:
      return node.segments;
    case NoteNodeType.TABLE:
      return [...node.table.head, ...node.table.rows.flat()].flatMap(
        (cell) => cell.segments,
      );
    case NoteNodeType.LIST:
      return listSegments(node.list);
  }
}

const leadingWhitespace = (line: string) =>
  line.slice(0, line.length - line.trimStart().length);

function lineRange(text: string, { from, to }: NoteRange): NoteRange {
  const end = to > from && text[to - 1] === LINE_BREAK ? to - 1 : to;
  const lineEnd = text.indexOf(LINE_BREAK, end);

  return {
    from: from === 0 ? 0 : text.lastIndexOf(LINE_BREAK, from - 1) + 1,
    to: lineEnd === -1 ? text.length : lineEnd,
  };
}

// --- Inline formats ---

interface InlineTarget {
  text: string;
  selection: NoteRange;
  range: NoteRange;
  selected: string;
  /** The tokens the range overlaps. */
  touched: NoteSegment[];
}

function planInline(
  { text, selection, range, selected, touched }: InlineTarget,
  format: InlineFormat,
): NoteFormatPlan {
  const { mark, type } = INLINE_FORMATS[format];

  if (touched.length === 0) {
    return {
      state: NoteFormatState.OFF,
      apply: () => ({
        ...range,
        text: mark + selected + mark,
        selection: {
          from: range.from + mark.length,
          to: range.to + mark.length,
        },
      }),
    };
  }

  const [token] = touched;
  if (
    touched.length > 1 ||
    token.type !== type ||
    range.from < token.from ||
    range.to > token.to
  ) {
    return DISABLED;
  }

  return {
    state: NoteFormatState.ON,
    apply: () => {
      const tokenStart = token.start;
      const tokenFrom = token.from;
      const tokenTo = token.to;

      const content = text.slice(tokenStart, tokenFrom + tokenTo - tokenStart);
      const keep = (offset: number) =>
        clamp(
          tokenFrom + offset - tokenStart,
          tokenFrom,
          tokenFrom + content.length,
        );

      return {
        from: tokenFrom,
        to: tokenTo,
        text: content,
        selection: { from: keep(selection.from), to: keep(selection.to) },
      };
    },
  };
}

/** The part of the selection a mark may wrap. */
function wrappableRange(text: string, selection: NoteRange): NoteRange {
  const selectionFrom = selection.from;
  const line = lineRange(text, { from: selectionFrom, to: selectionFrom });
  const item = MarkdownList.ITEM_REGEX.exec(text.slice(line.from, line.to));

  const from = Math.max(selectionFrom, line.from + (item?.[0].length ?? 0));
  const to = Math.max(from, selection.to);

  const selected = text.slice(from, to);
  const start = from + selected.length - selected.trimStart().length;

  return { from: start, to: Math.max(start, from + selected.trimEnd().length) };
}

function inlineTarget(text: string, selection: NoteRange): InlineTarget | null {
  const { from, to } = wrappableRange(text, selection);
  const selected = text.slice(from, to);

  if (
    selected.includes(LINE_BREAK) ||
    (from === to && selection.from !== selection.to)
  ) {
    return null;
  }

  const touched = parseNoteNodes(text)
    .flatMap(nodeSegments)
    .filter(
      (segment) =>
        segment.type !== NoteSegmentType.TEXT &&
        segment.from < to &&
        segment.to > from,
    );

  return { text, selection, range: { from, to }, selected, touched };
}

// --- List formats ---

interface ListRow {
  line: string;
  item: RegExpExecArray | null;
}

interface ListTarget {
  selection: NoteRange;
  lines: NoteRange;
  rows: ListRow[];
  /** The rows that aren't blank. */
  filled: ListRow[];
}

function listTarget(text: string, selection: NoteRange): ListTarget {
  const lines = lineRange(text, selection);
  const rows = splitLines(text.slice(lines.from, lines.to)).map((line) => ({
    line,
    item: MarkdownList.ITEM_REGEX.exec(line),
  }));

  return {
    selection,
    lines,
    rows,
    filled: rows.filter(({ line }) => line.trim()),
  };
}

function planList(
  { selection, lines, rows, filled }: ListTarget,
  format: ListFormat,
): NoteFormatPlan {
  if (filled.length === 0) {
    return DISABLED;
  }

  const { ordered } = LIST_FORMATS[format];
  const on = filled.every(
    ({ item }) => item && (item.groups?.ordinal !== undefined) === ordered,
  );

  const rewrite = () => {
    const ordinals = new Map<number, number>();

    return rows.map(({ line, item }) => {
      if (!line.trim()) {
        return line;
      }

      const indent = item?.groups?.indent ?? leadingWhitespace(line);
      const indentLength = indent.length;

      const body = line.slice(item ? item[0].length : indentLength);
      if (on) {
        return indent + body;
      }

      for (const depth of ordinals.keys()) {
        if (depth > indentLength) {
          ordinals.delete(depth);
        }
      }

      const ordinal = (ordinals.get(indentLength) ?? 0) + 1;
      ordinals.set(indentLength, ordinal);

      const marker = ordered
        ? `${ordinal}${MarkdownDelimiter.LIST_ORDINAL}`
        : MarkdownDelimiter.LIST_BULLET;

      return `${indent}${marker} ${body}`;
    });
  };

  return {
    state: on ? NoteFormatState.ON : NoteFormatState.OFF,
    apply: () => {
      const replaced = joinLines(rewrite());
      const end = lines.from + replaced.length;

      return {
        ...lines,
        text: replaced,
        selection: {
          from: selection.from === selection.to ? end : lines.from,
          to: end,
        },
      };
    },
  };
}

// --- Plan formats ---

/** What every format would do to the `selection` of a raw note. */
export function planNoteFormats(
  text: string,
  selection: NoteRange,
): Record<NoteFormat, NoteFormatPlan> {
  const inline = inlineTarget(text, selection);
  const list = listTarget(text, selection);

  const planInlineFormat = (format: InlineFormat) =>
    inline ? planInline(inline, format) : DISABLED;

  return {
    [NoteFormat.BOLD]: planInlineFormat(NoteFormat.BOLD),
    [NoteFormat.ITALIC]: planInlineFormat(NoteFormat.ITALIC),
    [NoteFormat.STRIKETHROUGH]: planInlineFormat(NoteFormat.STRIKETHROUGH),
    [NoteFormat.CODE]: planInlineFormat(NoteFormat.CODE),
    [NoteFormat.NUMBERED_LIST]: planList(list, NoteFormat.NUMBERED_LIST),
    [NoteFormat.BULLETED_LIST]: planList(list, NoteFormat.BULLETED_LIST),
  };
}
