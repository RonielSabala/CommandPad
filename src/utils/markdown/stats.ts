import { InfoConfig, LINE_BREAK } from "@/common/config";
import { NoteNodeType, NoteSegmentType } from "@/common/enums";
import type { NoteList, NoteNode, NoteSegment } from "@/common/types";
import type { Language } from "@/i18n";
import { countLines, splitLines } from "@/utils/string";

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

function countParagraphs(text: string): number {
  let paragraphs = 0;
  let inParagraph = false;

  for (const line of splitLines(text)) {
    const blank = !line.trim();
    if (!blank && !inParagraph) {
      paragraphs++;
    }

    inParagraph = !blank;
  }

  return paragraphs;
}

export function noteStats(text: string, language: Language): NoteStats {
  const nodes = parseNoteNodes(text);

  let links = 0;
  const runs: string[] = [];

  for (const segments of nodeSegments(nodes)) {
    runs.push(segments.map((segment) => segment.text).join(""));

    links += segments.filter(
      (segment) => segment.type === NoteSegmentType.LINK,
    ).length;
  }

  const rendered = runs.join(LINE_BREAK);
  const characters = Array.from(rendered);

  let words = 0;
  const segmenter = new Intl.Segmenter(language, { granularity: "word" });

  for (const { isWordLike } of segmenter.segment(rendered)) {
    if (isWordLike) {
      words++;
    }
  }

  return {
    lines: text ? countLines(text) : 0,
    paragraphs: countParagraphs(text),
    words,
    characters: characters.filter((char) => char !== LINE_BREAK).length,
    nonSpaceCharacters: characters.filter((char) => char.trim()).length,
    links,
    tables: nodes.filter((node) => node.type === NoteNodeType.TABLE).length,
    listItems: nodes.reduce(
      (count, node) =>
        node.type === NoteNodeType.LIST
          ? count + countListItems(node.list)
          : count,
      0,
    ),
    readingMinutes: Math.ceil(words / InfoConfig.WORDS_PER_MINUTE),
  };
}
