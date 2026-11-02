import { InfoConfig, LINE_BREAK } from "@/common/config";
import { NoteNodeType, NoteSegmentType } from "@/common/enums";
import type { NoteList, NoteNode, NoteSegment } from "@/common/types";
import type { Language } from "@/i18n";
import { splitLines } from "@/utils/string";

import { parseNoteNodes } from "./nodes";

export interface NoteStats {
  lines: number;
  paragraphs: number;
  words: number;
  characters: number;
  nonSpaceCharacters: number;
  links: number;
  tables: number;
  listItems: number;
  readingMinutes: number;
}

function* listSegments(list: NoteList): Generator<NoteSegment[]> {
  for (const item of list.items) {
    yield item.segments;

    for (const nested of item.lists) {
      yield* listSegments(nested);
    }
  }
}

function* nodeSegments(nodes: NoteNode[]): Generator<NoteSegment[]> {
  for (const node of nodes) {
    if (node.type === NoteNodeType.TABLE) {
      for (const row of [node.table.head, ...node.table.rows]) {
        yield* row.map((cell) => cell.segments);
      }
    } else if (node.type === NoteNodeType.LIST) {
      yield* listSegments(node.list);
    } else {
      yield node.segments;
    }
  }
}

function countListItems(list: NoteList): number {
  let count = list.items.length;
  for (const item of list.items) {
    for (const nested of item.lists) {
      count += countListItems(nested);
    }
  }

  return count;
}

function countLinesAndParagraphs(text: string) {
  if (!text) {
    return { lines: 0, paragraphs: 0 };
  }

  const lines = splitLines(text);
  let paragraphs = 0;
  let inParagraph = false;

  for (const line of lines) {
    const blank = !line.trim();
    if (!blank && !inParagraph) {
      paragraphs++;
    }

    inParagraph = !blank;
  }

  return { lines: lines.length, paragraphs };
}

export function noteStats(text: string, language: Language): NoteStats {
  const nodes = parseNoteNodes(text);

  let tables = 0;
  let listItems = 0;

  for (const node of nodes) {
    if (node.type === NoteNodeType.TABLE) {
      tables++;
    } else if (node.type === NoteNodeType.LIST) {
      listItems += countListItems(node.list);
    }
  }

  let links = 0;
  const runs: string[] = [];

  for (const segments of nodeSegments(nodes)) {
    let run = "";
    for (const segment of segments) {
      run += segment.text;

      if (segment.type === NoteSegmentType.LINK) {
        links++;
      }
    }

    runs.push(run);
  }

  const rendered = runs.join(LINE_BREAK);

  let characters = 0;
  let nonSpaceCharacters = 0;

  for (const char of rendered) {
    if (char !== LINE_BREAK) {
      characters++;
    }

    if (char.trim()) {
      nonSpaceCharacters++;
    }
  }

  let words = 0;
  const segmenter = new Intl.Segmenter(language, { granularity: "word" });

  for (const { isWordLike } of segmenter.segment(rendered)) {
    if (isWordLike) {
      words++;
    }
  }

  return {
    ...countLinesAndParagraphs(text),
    words,
    characters,
    nonSpaceCharacters,
    links,
    tables,
    listItems,
    readingMinutes: Math.ceil(words / InfoConfig.WORDS_PER_MINUTE),
  };
}
