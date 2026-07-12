import {
  DOCS_SECTION_ORDER,
  DocsSectionLevel,
  getDocsSectionNumbers,
  type DocsSectionId,
} from "@/common/constants/docs";
import { Key } from "@/common/constants/events";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useRef, type KeyboardEvent } from "react";

const SECTION_NUMBERS = getDocsSectionNumbers();

interface Props {
  activeId: string | null;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsToc({ activeId, onNavigate }: Props) {
  const t = useTranslation();
  const navRef = useRef<HTMLElement>(null);

  // Tab reaches the items natively; ArrowUp/ArrowDown walk the sections
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== Key.ARROW_DOWN && event.key !== Key.ARROW_UP) {
      return;
    }

    event.preventDefault();
    const items = Array.from(
      navRef.current?.querySelectorAll("a") ?? [],
    ) as HTMLAnchorElement[];
    if (items.length === 0) {
      return;
    }

    const focusedIndex = items.indexOf(
      document.activeElement as HTMLAnchorElement,
    );
    const delta = event.key === Key.ARROW_DOWN ? 1 : -1;
    const nextIndex =
      focusedIndex === -1
        ? delta === 1
          ? 0
          : items.length - 1
        : Math.min(Math.max(focusedIndex + delta, 0), items.length - 1);

    const next = items[nextIndex];
    next.focus();
    onNavigate(next.hash.slice(1) as DocsSectionId);
  };

  return (
    <aside className="docs-toc">
      <span className="section-title docs-toc-title">
        {t.docs.meta.tocTitle}
      </span>
      <nav ref={navRef} onKeyDown={onKeyDown}>
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
