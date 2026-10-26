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
import { joinLines, splitLines, trimmedStart } from "../string";
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

function lineRange(text: string, { from, to }: NoteRange): NoteRange {
  const end = to > from && text[to - 1] === LINE_BREAK ? to - 1 : to;
  const lineEnd = text.indexOf(LINE_BREAK, end);

  return {
    from: from === 0 ? 0 : text.lastIndexOf(LINE_BREAK, from - 1) + 1,
    to: lineEnd === -1 ? text.length : lineEnd,
  };
}

// --- Inline formats ---

interface InlinePiece {
  range: NoteRange;
  /** The tokens the range overlaps. */
  touched: NoteSegment[];
}

interface InlineTarget {
  text: string;
  selection: NoteRange;
  pieces: InlinePiece[];
}

interface NoteSplice extends NoteRange {
  text: string;
}

/** Joins splices, in order, into one edit. */
function joinSplices(
  text: string,
  splices: NoteSplice[],
): NoteRange & { text: string; starts: number[] } {
  const parts: string[] = [];
  const starts: number[] = [];
  let cursor = splices[0].from;
  let delta = 0;

  for (const { text: spliceText, from, to } of splices) {
    parts.push(text.slice(cursor, from), spliceText);
    starts.push(from + delta);

    delta += spliceText.length - (to - from);
    cursor = to;
  }

  return { from: splices[0].from, to: cursor, text: parts.join(""), starts };
}

/** Where `offset` lands once every range in `removed` is cut out. */
function shiftPast(removed: NoteRange[], offset: number): number {
  return removed.reduce(
    (shifted, { from, to }) => shifted - clamp(offset - from, 0, to - from),
    offset,
  );
}

function wrapPieces(
  { text, pieces }: InlineTarget,
  bare: NoteRange[],
  mark: string,
): NoteEdit {
  const { starts, ...edit } = joinSplices(
    text,
    bare.map((range) => ({
      ...range,
      text: mark + text.slice(range.from, range.to) + mark,
    })),
  );

  // The selection spans the content of the first and last pieces
  const first = pieces[0].range;
  const last = pieces[pieces.length - 1].range;
  const lastBare = bare[bare.length - 1] === last;

  return {
    ...edit,
    selection: {
      from: bare[0] === first ? starts[0] + mark.length : first.from,
      to: lastBare
        ? starts[starts.length - 1] + mark.length + last.to - last.from
        : last.to + edit.text.length - (edit.to - edit.from),
    },
  };
}

function unwrapTokens(
  { text, selection }: InlineTarget,
  tokens: NoteSegment[],
): NoteEdit {
  const contents = tokens.map(({ start, from, to }) =>
    text.slice(start, to - (start - from)),
  );

  const { starts, ...edit } = joinSplices(
    text,
    tokens.map(({ from, to }, index) => ({ from, to, text: contents[index] })),
  );

  const keep = (offset: number, index: number) =>
    clamp(
      starts[index] + offset - tokens[index].start,
      starts[index],
      starts[index] + contents[index].length,
    );

  return {
    ...edit,
    selection: {
      from: keep(selection.from, 0),
      to: keep(selection.to, tokens.length - 1),
    },
  };
}

function planInline(
  target: InlineTarget,
  format: InlineFormat,
): NoteFormatPlan {
  const bare: NoteRange[] = [];
  const tokens = new Set<NoteSegment>();
  const { mark, type } = INLINE_FORMATS[format];

  for (const { range, touched } of target.pieces) {
    if (touched.length === 0) {
      bare.push(range);
      continue;
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

    tokens.add(token);
  }

  // Lines already in the style keep it while the rest join them
  if (bare.length > 0) {
    return {
      state: NoteFormatState.OFF,
      apply: () => wrapPieces(target, bare, mark),
    };
  }

  return {
    state: NoteFormatState.ON,
    apply: () => unwrapTokens(target, [...tokens]),
  };
}

/** The part of each selected line a mark may wrap, past any list marker. */
function wrappableRanges(
  text: string,
  { selection, lines, rows }: ListTarget,
): NoteRange[] {
  const collapsed = selection.from === selection.to;
  let lineStart = lines.from;

  return rows.flatMap(({ line, item }) => {
    const start = lineStart;
    lineStart += line.length + LINE_BREAK.length;

    const from = Math.max(selection.from, start + (item?.[0].length ?? 0));
    const to = Math.max(from, Math.min(selection.to, start + line.length));

    const selected = text.slice(from, to);
    const trimmedFrom = from + trimmedStart(selected);
    const trimmedTo = Math.max(trimmedFrom, from + selected.trimEnd().length);

    return trimmedFrom === trimmedTo && !collapsed
      ? []
      : [{ from: trimmedFrom, to: trimmedTo }];
  });
}

function inlineTarget(text: string, list: ListTarget): InlineTarget | null {
  const ranges = wrappableRanges(text, list);
  if (ranges.length === 0) {
    return null;
  }

  const overlaps = (token: NoteSegment, { from, to }: NoteRange) =>
    token.from < to && token.to > from;

  // Only the tokens inside the selection are matched against each line
  const span = { from: ranges[0].from, to: ranges[ranges.length - 1].to };
  const tokens = parseNoteNodes(text)
    .flatMap(nodeSegments)
    .filter(
      (token) => token.type !== NoteSegmentType.TEXT && overlaps(token, span),
    );

  const pieces = ranges.map((range) => ({
    range,
    touched: tokens.filter((token) => overlaps(token, range)),
  }));

  return { text, selection: list.selection, pieces };
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

      const indent = item?.groups?.indent ?? line.slice(0, trimmedStart(line));
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

// --- Indentation ---

/** Prefixes every non-empty line the selection spans with `indent`. */
export function indentNoteLines(
  text: string,
  selection: NoteRange,
  indent: string,
): NoteEdit | null {
  const lineBreak = text.indexOf(LINE_BREAK, selection.from);
  if (lineBreak === -1 || lineBreak >= selection.to) {
    return null;
  }

  const lines = lineRange(text, selection);
  const rows = splitLines(text.slice(lines.from, lines.to));
  const replaced = joinLines(rows.map((line) => line && indent + line));

  // A selection starting at its line keeps the new indent inside it
  const firstShift = rows[0] && selection.from > lines.from ? indent.length : 0;

  return {
    ...lines,
    text: replaced,
    selection: {
      from: selection.from + firstShift,
      to: selection.to + replaced.length - (lines.to - lines.from),
    },
  };
}

/** Drops one leading `indent` from every line the selection touches. */
export function outdentNoteLines(
  text: string,
  selection: NoteRange,
  indent: string,
): NoteEdit | null {
  const lines = lineRange(text, selection);
  const removed: NoteRange[] = [];
  let lineStart = lines.from;

  const rows = splitLines(text.slice(lines.from, lines.to)).map((line) => {
    const outdented = line.startsWith(indent)
      ? line.slice(indent.length)
      : line;

    if (outdented !== line) {
      removed.push({ from: lineStart, to: lineStart + indent.length });
    }

    lineStart += line.length + LINE_BREAK.length;
    return outdented;
  });

  if (removed.length === 0) {
    return null;
  }

  return {
    ...lines,
    text: joinLines(rows),
    selection: {
      from: shiftPast(removed, selection.from),
      to: shiftPast(removed, selection.to),
    },
  };
}

// --- Clear formatting ---

/** Drops every mark and list marker the selection touches. */
function planClear(
  text: string,
  { selection, lines, rows }: ListTarget,
  inline: InlineTarget | null,
): NoteFormatPlan {
  const removed: NoteRange[] = [];
  let lineStart = lines.from;

  for (const { line, item } of rows) {
    if (item) {
      const indent = item.groups?.indent ?? "";
      removed.push({
        from: lineStart + indent.length,
        to: lineStart + item[0].length,
      });
    }

    lineStart += line.length + LINE_BREAK.length;
  }

  const tokens = new Set(inline?.pieces.flatMap(({ touched }) => touched));

  for (const { type, start, from, to } of tokens) {
    if (type === NoteSegmentType.LINK) {
      continue;
    }

    removed.push({ from, to: start }, { from: to - (start - from), to });
  }

  if (removed.length === 0) {
    return DISABLED;
  }

  return {
    state: NoteFormatState.OFF,
    apply: () => {
      removed.sort((a, b) => a.from - b.from);
      const edit = joinSplices(
        text,
        removed.map((range) => ({ ...range, text: "" })),
      );

      return {
        from: edit.from,
        to: edit.to,
        text: edit.text,
        selection: {
          from: shiftPast(removed, selection.from),
          to: shiftPast(removed, selection.to),
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
  const list = listTarget(text, selection);
  const inline = inlineTarget(text, list);

  const planInlineFormat = (format: InlineFormat) =>
    inline ? planInline(inline, format) : DISABLED;

  return {
    [NoteFormat.BOLD]: planInlineFormat(NoteFormat.BOLD),
    [NoteFormat.ITALIC]: planInlineFormat(NoteFormat.ITALIC),
    [NoteFormat.STRIKETHROUGH]: planInlineFormat(NoteFormat.STRIKETHROUGH),
    [NoteFormat.CODE]: planInlineFormat(NoteFormat.CODE),
    [NoteFormat.NUMBERED_LIST]: planList(list, NoteFormat.NUMBERED_LIST),
    [NoteFormat.BULLETED_LIST]: planList(list, NoteFormat.BULLETED_LIST),
    [NoteFormat.CLEAR]: planClear(text, list, inline),
  };
}
