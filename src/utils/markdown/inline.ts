import { NoteSegmentType } from "@/common/enums";
import { MarkdownEscapeRegex, MarkdownToken } from "@/common/markdownSyntax";
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

function unescape(text: string): string {
  return text.replace(MarkdownEscapeRegex, "$1");
}

/** Parses one inline run of markdown into segments. */
export function parseNoteText(text: string, offset = 0): NoteSegment[] {
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
        text: unescape(text.slice(lastIndex, matchIdx)),
        start: offset + lastIndex,
      });
    }

    const groups = match.groups;
    const code = groups?.code;
    const bold = groups?.bold;
    const italic = groups?.italicAlt ?? groups?.italic;
    const linkLabel = groups?.linkLabel;
    const linkHref = groups?.linkHref;
    const url = groups?.url;

    const startOf = (rendered: string) =>
      offset + matchIdx + matched.indexOf(rendered);

    if (code !== undefined) {
      segments.push({
        type: NoteSegmentType.CODE,
        text: code,
        start: startOf(code),
      });
    } else if (bold !== undefined) {
      segments.push({
        type: NoteSegmentType.BOLD,
        text: unescape(bold),
        start: startOf(bold),
      });
    } else if (italic !== undefined) {
      segments.push({
        type: NoteSegmentType.ITALIC,
        text: unescape(italic),
        start: startOf(italic),
      });
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: unescape(linkLabel),
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
      text: unescape(text.slice(lastIndex)),
      start: offset + lastIndex,
    });
  }

  return segments;
}
