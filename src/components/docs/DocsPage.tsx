import {
  DOCS_SECTION_ORDER,
  getDocsSectionNumbers,
  type DocsSectionId,
} from "@/common/constants/docs";
import { ScrollIntoView } from "@/common/constants/dom";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DocsFooter } from "./DocsFooter";
import { DocsHeader } from "./DocsHeader";
import "./DocsPage.css";
import { DocsSection } from "./DocsSection";
import { DOCS_SECTION_CONTENT } from "./docsSections";
import { DocsToc } from "./DocsToc";
import { useScrollSpy } from "./useScrollSpy";

const SECTION_NUMBERS = getDocsSectionNumbers();
const SECTION_IDS = DOCS_SECTION_ORDER.map((entry) => entry.id);

export function DocsPage() {
  const t = useTranslation();
  const language = useStore((state) => state.language);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const activeId = useScrollSpy(SECTION_IDS, mainRef);

  const initialHash = useMemo(
    () => location.hash.replace("#", ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (initialHash) {
      document.getElementById(initialHash)?.scrollIntoView();
    }
  }, [initialHash]);

  const navigate = (id: DocsSectionId) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
    });

    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="docs-shell">
      <DocsHeader />
      <DocsToc activeId={activeId} onNavigate={navigate} />
      <main ref={mainRef} className="docs-main">
        <article className="docs-article">
          {DOCS_SECTION_ORDER.map(({ id, level }) => {
            const Content = DOCS_SECTION_CONTENT[id];
            return (
              <DocsSection
                key={id}
                id={id}
                level={level}
                number={SECTION_NUMBERS[id]}
                title={t.docs.toc[id]}
              >
                <Content key={language} />
              </DocsSection>
            );
          })}
          <DocsFooter />
        </article>
      </main>
    </div>
  );
}
