import {
  DOCS_SECTION_ORDER,
  DocsSectionLevel,
  getDocsSectionNumbers,
  type DocsSectionId,
} from "@/common/constants/docs";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";

const SECTION_NUMBERS = getDocsSectionNumbers();

interface Props {
  activeId: string | null;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsToc({ activeId, onNavigate }: Props) {
  const t = useTranslation();

  return (
    <aside className="docs-toc">
      <span className="section-title docs-toc-title">{t.docs.meta.tocTitle}</span>
      <nav>
        {DOCS_SECTION_ORDER.map(({ id, level }) => (
          <a
            key={id}
            href={`#${id}`}
            className={classNames(
              "docs-toc-item",
              level === DocsSectionLevel.SUBSECTION && "docs-toc-sub",
              id === activeId && "docs-toc-active",
            )}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(id);
            }}
          >
            <span className="docs-toc-number">{SECTION_NUMBERS[id]}</span>
            {t.docs.toc[id]}
          </a>
        ))}
      </nav>
    </aside>
  );
}
