import { MarkdownToken } from "@/common/config";
import { NoteSegmentType } from "@/common/enums";
import type { NoteSegment } from "@/common/types";

const NOTE_TOKEN_REGEX = new RegExp(
  [
    MarkdownToken.CODE_REGEX.source,
    MarkdownToken.BOLD_REGEX.source,
    MarkdownToken.ITALIC_REGEX.source,
    MarkdownToken.URL_REGEX.source,
  ].join("|"),
  "g",
);

export function parseNoteText(text: string): NoteSegment[] {
  const segments: NoteSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  NOTE_TOKEN_REGEX.lastIndex = 0;
  while ((match = NOTE_TOKEN_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: NoteSegmentType.TEXT,
        text: text.slice(lastIndex, match.index),
      });
    }

    const [, code, bold, italicStar, italicUnderscore, url] = match;

    if (code !== undefined) {
      segments.push({ type: NoteSegmentType.CODE, text: code });
    } else if (bold !== undefined) {
      segments.push({ type: NoteSegmentType.BOLD, text: bold });
    } else if (italicStar !== undefined || italicUnderscore !== undefined) {
      segments.push({
        type: NoteSegmentType.ITALIC,
        text: (italicStar ?? italicUnderscore) as string,
      });
    } else if (url !== undefined) {
      segments.push({ type: NoteSegmentType.LINK, text: url });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: NoteSegmentType.TEXT, text: text.slice(lastIndex) });
  }

  return segments;
}
