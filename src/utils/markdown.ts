import { MarkdownToken } from "@/common/config";
import { NoteSegmentType } from "@/common/enums";
import type { NoteSegment } from "@/common/types";

const NOTE_TOKEN_REGEX = new RegExp(
  [
    MarkdownToken.CODE_REGEX.source,
    MarkdownToken.BOLD_REGEX.source,
    MarkdownToken.ITALIC_REGEX.source,
    MarkdownToken.LINK_REGEX.source,
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
    const matched = match[0];
    const matchIdx = match.index;

    if (matchIdx > lastIndex) {
      segments.push({
        type: NoteSegmentType.TEXT,
        text: text.slice(lastIndex, matchIdx),
        start: lastIndex,
      });
    }

    const [
      ,
      code,
      bold,
      italicStar,
      italicUnderscore,
      linkLabel,
      linkHref,
      url,
    ] = match;

    const startOf = (rendered: string) => matchIdx + matched.indexOf(rendered);

    if (code !== undefined) {
      segments.push({
        type: NoteSegmentType.CODE,
        text: code,
        start: startOf(code),
      });
    } else if (bold !== undefined) {
      segments.push({
        type: NoteSegmentType.BOLD,
        text: bold,
        start: startOf(bold),
      });
    } else if (italicStar !== undefined || italicUnderscore !== undefined) {
      const italic = italicStar ?? italicUnderscore;
      segments.push({
        type: NoteSegmentType.ITALIC,
        text: italic,
        start: startOf(italic),
      });
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: linkLabel,
        href: linkHref,
        start: startOf(linkLabel),
      });
    } else if (url !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: url,
        start: startOf(url),
      });
    }

    lastIndex = matchIdx + matched.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: NoteSegmentType.TEXT,
      text: text.slice(lastIndex),
      start: lastIndex,
    });
  }

  return segments;
}
