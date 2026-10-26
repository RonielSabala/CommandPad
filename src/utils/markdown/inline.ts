import { NoteSegmentType } from "@/common/enums";
import { MarkdownEscapeRegex, MarkdownToken } from "@/common/markdownSyntax";
import type { NoteSegment } from "@/common/types";

const NOTE_TOKEN_REGEX = new RegExp(
  [
    MarkdownToken.BOLD_REGEX.source,
    MarkdownToken.ITALIC_REGEX.source,
    MarkdownToken.STRIKETHROUGH_REGEX.source,
    MarkdownToken.CODE_REGEX.source,
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

  const pushText = (from: number, to: number) =>
    segments.push({
      type: NoteSegmentType.TEXT,
      text: unescape(text.slice(from, to)),
      start: offset + from,
      from: offset + from,
      to: offset + to,
    });

  NOTE_TOKEN_REGEX.lastIndex = 0;

  while ((match = NOTE_TOKEN_REGEX.exec(text)) !== null) {
    const matched = match[0];
    const matchIdx = match.index;

    if (matchIdx > lastIndex) {
      pushText(lastIndex, matchIdx);
    }

    const groups = match.groups;

    const bold = groups?.bold;
    const italic = groups?.italicAlt ?? groups?.italic;
    const strikethrough = groups?.strikethroughAlt ?? groups?.strikethrough;
    const code = groups?.code;
    const linkLabel = groups?.linkLabel;
    const linkHref = groups?.linkHref;
    const url = groups?.url;

    const from = offset + matchIdx;
    const extent = { from, to: from + matched.length };
    const startOf = (rendered: string) => from + matched.indexOf(rendered);

    if (code !== undefined) {
      segments.push({
        type: NoteSegmentType.CODE,
        text: code,
        start: startOf(code),
        ...extent,
      });
    } else if (bold !== undefined) {
      segments.push({
        type: NoteSegmentType.BOLD,
        text: unescape(bold),
        start: startOf(bold),
        ...extent,
      });
    } else if (italic !== undefined) {
      segments.push({
        type: NoteSegmentType.ITALIC,
        text: unescape(italic),
        start: startOf(italic),
        ...extent,
      });
    } else if (strikethrough !== undefined) {
      segments.push({
        type: NoteSegmentType.STRIKETHROUGH,
        text: unescape(strikethrough),
        start: startOf(strikethrough),
        ...extent,
      });
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: unescape(linkLabel),
        href: linkHref,
        start: startOf(linkLabel),
        ...extent,
      });
    } else if (url !== undefined) {
      segments.push({
        type: NoteSegmentType.LINK,
        text: url,
        start: startOf(url),
        ...extent,
      });
    }

    lastIndex = matchIdx + matched.length;
  }

  if (lastIndex < text.length) {
    pushText(lastIndex, text.length);
  }

  return segments;
}
