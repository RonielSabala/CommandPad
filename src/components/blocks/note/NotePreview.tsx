import { classNames } from "@/utils/string";
import type { Ref } from "react";

import "./NotePreview.css";
import { NoteText } from "./NoteText";

interface Props {
  text: string;
  placeholder?: string;
  styleClass?: string;
  className?: string;
  requiresLinkModifier?: boolean;
  /** No textarea behind it, so the text and its links answer for themselves. */
  standalone?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/** Markdown text rendered as the elements it describes. */
export function NotePreview({
  text,
  placeholder,
  styleClass,
  className,
  requiresLinkModifier,
  standalone,
  ref,
}: Props) {
  return (
    <div
      ref={ref}
      className={classNames(
        "note-preview",
        className,
        styleClass,
        standalone && "is-standalone",
      )}
    >
      {text ? (
        <NoteText text={text} requiresLinkModifier={requiresLinkModifier} />
      ) : (
        placeholder && (
          <span className="note-preview-placeholder">{placeholder}</span>
        )
      )}
    </div>
  );
}
