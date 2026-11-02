import { InfoConfig, LINE_BREAK } from "@/common/config";
import { NoteNodeType, NoteSegmentType } from "@/common/enums";
import type { Language } from "@/i18n";
import { splitLines } from "@/utils/string";

import { nodeRuns, parseNoteNodes } from "./nodes";

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
  let tables = 0;
  let listItems = 0;
  let links = 0;
  const runs: string[] = [];

  for (const node of parseNoteNodes(text)) {
    if (node.type === NoteNodeType.TABLE) {
      tables++;
    }

    for (const segments of nodeRuns(node)) {
      if (node.type === NoteNodeType.LIST) {
        listItems++;
      }

      let run = "";
      for (const segment of segments) {
        run += segment.text;

        if (segment.type === NoteSegmentType.LINK) {
          links++;
        }
      }

      runs.push(run);
    }
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
