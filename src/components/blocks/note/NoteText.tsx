import { CssClass } from "@/common/constants/css";
import { Anchor } from "@/common/constants/dom";
import { NoteSegmentType } from "@/common/enums";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import { useTranslation } from "@/i18n";
import { parseNoteText } from "@/utils/markdown";
import "./NoteText.css";

interface Props {
  text: string;
}

export function NoteText({ text }: Props) {
  const t = useTranslation();
  const followLinkTooltip = t.note.followLinkTooltip(
    formatBinding(KEYBINDINGS[KeyBinding.OPEN_LINK].binding),
  );

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
                href={segment.href ?? segment.text}
                className={CssClass.NOTE_LINK}
                target={Anchor.TARGET_BLANK}
                rel={Anchor.REL}
                title={followLinkTooltip}
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
