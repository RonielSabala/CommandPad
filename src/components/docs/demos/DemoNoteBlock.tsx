import { Key } from "@/common/constants/events";
import { NoteStyle } from "@/common/enums";
import "@/components/blocks/note/NoteBlock.css";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useNoteFormatting } from "@/hooks/useNoteFormatting";
import { useTabInsertion } from "@/hooks/useTabInsertion";
import { useTranslation } from "@/i18n";
import { useState } from "react";

const NOTE_STYLES: NoteStyle[] = [
  NoteStyle.HEADING,
  NoteStyle.SUBHEADING,
  NoteStyle.BODY,
];

interface Props {
  text: string;
  onTextChange: (value: string) => void;
  initialStyle?: NoteStyle;
  showStyleRow?: boolean;
}

// Store-free, controlled replica of NoteBlock: click into it to see the
// raw markdown, blur to see it rendered, same markup and CSS as the real
// component. Callers own the text state and the DocsDemo frame.
export function DemoNoteBlock({
  text,
  onTextChange,
  initialStyle = NoteStyle.BODY,
  showStyleRow = true,
}: Props) {
  const t = useTranslation();
  const [style, setStyle] = useState<NoteStyle>(initialStyle);
  const [focused, setFocused] = useState(false);

  const placeholder = t.note.stylePlaceholder[style];
  const handleTabKey = useTabInsertion(onTextChange);
  const handleFormatKey = useNoteFormatting(onTextChange);

  return (
    <div className={`note-block${focused ? " is-focused" : ""}`}>
      {showStyleRow && (
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
      )}
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
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === Key.ESCAPE) {
              event.currentTarget.blur();
              return;
            }

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
  );
}
