import { TAB_CHARACTER } from "@/common/constants/events";
import { NoteFormat, NoteFormatState } from "@/common/enums";
import { describe, expect, it } from "vitest";

import {
  indentNoteLines,
  outdentNoteLines,
  planNoteFormats,
  type NoteRange,
} from "./format";

const OPEN = "«";
const CLOSE = "»";
const { OFF, ON, DISABLED } = NoteFormatState;

type Case = [NoteFormat, string, NoteFormatState, string | null];

const CASES: Case[] = [
  [NoteFormat.BOLD, "a «b» c", OFF, "a **«b»** c"],
  [NoteFormat.BOLD, "a **«b»** c", ON, "a «b» c"],
  [NoteFormat.BOLD, "a «**b**» c", ON, "a «b» c"],
  [NoteFormat.BOLD, "a **b«c»d** e", ON, "a b«c»d e"],
  [NoteFormat.BOLD, "«a **b»** c", DISABLED, null],
  [NoteFormat.BOLD, "«a **b** c»", DISABLED, null],
  [NoteFormat.ITALIC, "a **«b»** c", DISABLED, null],
  [NoteFormat.ITALIC, "x« a »y", OFF, "x _«a»_ y"],
  [NoteFormat.ITALIC, "a «  » b", DISABLED, null],
  [NoteFormat.BOLD, "a«»b", OFF, "a**«»**b"],
  [NoteFormat.BOLD, "**a«»b**", ON, "a«»b"],
  [NoteFormat.STRIKETHROUGH, "«~~gone~~»", ON, "«gone»"],
  [NoteFormat.STRIKETHROUGH, "see «old» docs", OFF, "see ~«old»~ docs"],
  [NoteFormat.CODE, "use «ls»", OFF, "use `«ls»`"],
  [NoteFormat.STRIKETHROUGH, "«1. old step»", OFF, "1. ~«old step»~"],
  [NoteFormat.BOLD, "«* **a**»", ON, "* «a»"],
  [NoteFormat.BOLD, "«1. »a", DISABLED, null],
  [NoteFormat.CODE, "«a\nb»", OFF, "`«a`\n`b»`"],
  [NoteFormat.BOLD, "x«a\n\n  b c\nd»y", OFF, "x**«a**\n\n  **b c**\n**d»**y"],
  [NoteFormat.BOLD, "«* a\n* b»", OFF, "* **«a**\n* **b»**"],
  [NoteFormat.BOLD, "«**a**\nb»", OFF, "«**a**\n**b»**"],
  [NoteFormat.BOLD, "a«**b**\nc»", OFF, "a«**b**\n**c»**"],
  [NoteFormat.BOLD, "«a\n**b**»", OFF, "**«a**\n**b**»"],
  [NoteFormat.BOLD, "«**a**\n**b**»", ON, "«a\nb»"],
  [NoteFormat.BOLD, "**a«a**\n**b»b**", ON, "a«a\nb»b"],
  [NoteFormat.ITALIC, "«**a**\nb»", DISABLED, null],
  [NoteFormat.BOLD, "«a\n  \n»", OFF, "**«a»**\n  \n"],
  [NoteFormat.BOLD, "«\n  \n»", DISABLED, null],
  [NoteFormat.CODE, "open «https://example.com»", DISABLED, null],
  [NoteFormat.NUMBERED_LIST, "«one\ntwo»", OFF, "«1. one\n2. two»"],
  [NoteFormat.NUMBERED_LIST, "«1. one\n2. two»", ON, "«one\ntwo»"],
  [NoteFormat.BULLETED_LIST, "«1. one\n2. two»", OFF, "«* one\n* two»"],
  [NoteFormat.BULLETED_LIST, "on«e\ntw»o", OFF, "«* one\n* two»"],
  [NoteFormat.BULLETED_LIST, "«a\n»b", OFF, "«* a»\nb"],
  [NoteFormat.BULLETED_LIST, "«a\n\nb»", OFF, "«* a\n\n* b»"],
  [NoteFormat.BULLETED_LIST, "«  »", DISABLED, null],
  [
    NoteFormat.NUMBERED_LIST,
    "«a\n\tb\n\tc\nd»",
    OFF,
    "«1. a\n\t1. b\n\t2. c\n2. d»",
  ],
  [NoteFormat.NUMBERED_LIST, "x\no«»ne", OFF, "x\n1. one«»"],
  [NoteFormat.BULLETED_LIST, "«- a\n  * b»", ON, "«a\n  b»"],
  [NoteFormat.CLEAR, "«**a** _b_ c»", OFF, "«a b c»"],
  [NoteFormat.CLEAR, "x **a«b**» y", OFF, "x a«b» y"],
  [NoteFormat.CLEAR, "«1. **a**\n  * ~~b~~»", OFF, "«a\n  b»"],
  [
    NoteFormat.CLEAR,
    "«see [docs](https://x.y) `ls`»",
    OFF,
    "«see [docs](https://x.y) ls»",
  ],
  [NoteFormat.CLEAR, "«plain [docs](https://x.y)»", DISABLED, null],
  [NoteFormat.CLEAR, "«  »", DISABLED, null],
];

const INDENT_CASES: [string, string | null][] = [
  ["«a\nb»", "«\ta\n\tb»"],
  ["x\no«ne\ntw»o\ny", "x\n\to«ne\n\ttw»o\ny"],
  ["«a\n\nb»", "«\ta\n\n\tb»"],
  ["«a\n»b", "«\ta\n»b"],
  ["\n«\na»", "\n«\n\ta»"],
  ["a «b» c", null],
];

const OUTDENT_CASES: [string, string | null][] = [
  ["«\ta\n\tb»", "«a\nb»"],
  ["\t«a\n\tb»", "«a\nb»"],
  ["\t\ta«»", "\ta«»"],
  ["«\ta\nb\n\t\tc»", "«a\nb\n\tc»"],
  ["x\n\to«ne\n\ttw»o\n\ty", "x\no«ne\ntw»o\n\ty"],
  ["«\ta\n»\tb", "«a\n»\tb"],
  ["  «a\nb»", null],
];

function mark(text: string, { from, to }: NoteRange): string {
  return (
    text.slice(0, from) + OPEN + text.slice(from, to) + CLOSE + text.slice(to)
  );
}

function unmark(marked: string): { text: string; selection: NoteRange } {
  const from = marked.indexOf(OPEN);
  const to = marked.indexOf(CLOSE) - OPEN.length;

  return {
    text: marked.replace(OPEN, "").replace(CLOSE, ""),
    selection: { from, to },
  };
}

describe("planNoteFormats", () => {
  it.each(CASES)("%s on %j", (format, marked, state, expected) => {
    const { text, selection } = unmark(marked);
    const plan = planNoteFormats(text, selection)[format];
    const edit = plan.apply();

    expect(plan.state).toBe(state);
    expect(
      edit &&
        mark(
          text.slice(0, edit.from) + edit.text + text.slice(edit.to),
          edit.selection,
        ),
    ).toBe(expected);
  });
});

describe("indentNoteLines", () => {
  it.each(INDENT_CASES)("%j", (marked, expected) => {
    const { text, selection } = unmark(marked);
    const edit = indentNoteLines(text, selection, TAB_CHARACTER);

    expect(
      edit &&
        mark(
          text.slice(0, edit.from) + edit.text + text.slice(edit.to),
          edit.selection,
        ),
    ).toBe(expected);
  });
});

describe("outdentNoteLines", () => {
  it.each(OUTDENT_CASES)("%j", (marked, expected) => {
    const { text, selection } = unmark(marked);
    const edit = outdentNoteLines(text, selection, TAB_CHARACTER);

    expect(
      edit &&
        mark(
          text.slice(0, edit.from) + edit.text + text.slice(edit.to),
          edit.selection,
        ),
    ).toBe(expected);
  });
});
