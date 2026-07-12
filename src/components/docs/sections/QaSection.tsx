import { NoteText } from "@/components/blocks/note/NoteText";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useState } from "react";
import { Prose } from "../Prose";

function QaItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="docs-qa-item">
      <button
        className="docs-qa-question"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <SidebarSectionChevronIcon
          className={classNames(
            "docs-qa-chevron icon-md icon-bold",
            open && "is-open",
          )}
        />
        {question}
      </button>
      {open && (
        <p className="docs-prose docs-qa-answer">
          <NoteText text={answer} />
        </p>
      )}
    </div>
  );
}

export function QaDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.qa.intro} />
      <div className="docs-qa-list">
        {t.docs.qa.items.map((item) => (
          <QaItem key={item.question} {...item} />
        ))}
      </div>
    </>
  );
}
