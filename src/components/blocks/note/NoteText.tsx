import { Anchor } from "@/common/constants/dom";
import { NoteSegmentType } from "@/common/enums";
import { parseNoteText } from "@/utils/markdown";
import "./NoteText.css";

interface Props {
  text: string;
}

export function NoteText({ text }: Props) {
  return (
    <>
      {parseNoteText(text).map((segment, i) => {
        switch (segment.type) {
          case NoteSegmentType.BOLD:
            return (
              <span key={i} className="note-bold">
                {segment.text}
              </span>
            );
          case NoteSegmentType.ITALIC:
            return (
              <span key={i} className="note-italic">
                {segment.text}
              </span>
            );
          case NoteSegmentType.CODE:
            return (
              <span key={i} className="note-code">
                {segment.text}
              </span>
            );
          case NoteSegmentType.LINK:
            return (
              <a
                key={i}
                href={segment.text}
                className="note-link"
                target={Anchor.TARGET_BLANK}
                rel={Anchor.REL}
              >
                {segment.text}
              </a>
            );
          default:
            return segment.text;
        }
      })}
    </>
  );
}
