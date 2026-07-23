import { NoteText } from "@/components/blocks/note/NoteText";
import { Collapsible } from "@/components/common/Collapsible";
import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";
import "./QaSection.css";

export function QaDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.qa.intro} />

      <div id="docs-qa-list">
        {t.docs.qa.items.map((item) => (
          <Collapsible
            key={item.question}
            className="collapsible-compact"
            title={item.question}
          >
            <p className="docs-prose">
              <NoteText text={item.answer} />
            </p>
          </Collapsible>
        ))}
      </div>
    </>
  );
}
