import { NoteStyle } from "@/common/enums";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useNoteFormatting } from "@/hooks/useNoteFormatting";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useTranslation } from "@/i18n";
import { useState } from "react";
import "@/components/blocks/note/NoteBlock.css";
import { DocsDemo } from "./DocsDemo";

const NOTE_STYLES: NoteStyle[] = [
  NoteStyle.HEADING,
  NoteStyle.SUBHEADING,
  NoteStyle.BODY,
];

interface Props {
  initialText: string;
  initialStyle?: NoteStyle;
}

// Store-free replica of NoteBlock: click into it to see the raw markdown,
// blur to see it rendered — same markup and CSS as the real component
export function DemoNoteBlock({
  initialText,
  initialStyle = NoteStyle.BODY,
}: Props) {
  const t = useTranslation();
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState<NoteStyle>(initialStyle);
  const [focused, setFocused] = useState(false);

  const placeholder = t.note.stylePlaceholder[style];
  const handleTabKey = useTabInsertion(setText);
  const handleFormatKey = useNoteFormatting(setText);

  return (
    <DocsDemo>
      <div className={`note-block${focused ? " is-focused" : ""}`}>
        <div className="note-style-row">
          {NOTE_STYLES.map((noteStyle) => (
            <button
              key={noteStyle}
              className={`note-style-btn${style === noteStyle ? " active" : ""}`}
              onClick={() => setStyle(noteStyle)}
            >
              {t.note.styleLabel[noteStyle]}
            </button>
          ))}
        </div>
        <label
          className={`note-auto-width style-${style}`}
          data-value={text || placeholder}
        >
          <textarea
            className={`note-textarea style-${style}`}
            placeholder={placeholder}
            spellCheck={false}
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              handleFormatKey(event);
              handleTabKey(event);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <div className={`note-preview style-${style}`}>
            {text ? (
              <NoteText text={text} />
            ) : (
              <span className="note-preview-placeholder">{placeholder}</span>
            )}
          </div>
        </label>
      </div>
    </DocsDemo>
  );
}
