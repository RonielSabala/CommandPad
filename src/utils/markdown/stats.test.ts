import { Language } from "@/i18n/types";
import { describe, expect, it } from "vitest";

import { noteStats } from "./stats";

const stats = (text: string) => noteStats(text, Language.EN);

describe("noteStats", () => {
  it("is all zeros for an empty note", () => {
    expect(stats("")).toEqual({
      lines: 0,
      paragraphs: 0,
      words: 0,
      characters: 0,
      nonSpaceCharacters: 0,
      links: 0,
      tables: 0,
      listItems: 0,
      readingMinutes: 0,
    });
  });

  it("counts lines and paragraphs from the raw text", () => {
    expect(stats("one\ntwo\n\n\nthree\n")).toMatchObject({
      lines: 6,
      paragraphs: 2,
    });
  });

  it("counts words and characters as rendered, marks dropped", () => {
    expect(stats("**deploy** the `app`\nnow")).toMatchObject({
      words: 4,
      characters: 17,
      nonSpaceCharacters: 15,
      readingMinutes: 1,
    });
  });

  it("counts links", () => {
    expect(stats("[docs](https://a.b) and https://c.d").links).toBe(2);
  });

  it("counts tables and reads their cells", () => {
    expect(stats("| a | b |\n| - | - |\n| c | d |")).toMatchObject({
      tables: 1,
      words: 4,
    });
  });

  it("counts list items at every depth", () => {
    expect(stats("* a\n\t* b\n\t* c\n* d").listItems).toBe(4);
  });
});
