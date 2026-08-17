import {
  DOCS_SECTION_ORDER,
  getDocsSectionNumbers,
  type DocsSectionId,
} from "@/common/constants/docs";
import { ScrollIntoView } from "@/common/constants/dom";
import { PanelId } from "@/common/enums";
import { PanelShell } from "@/components/common/panel/PanelShell";
import { usePanelKeybindings } from "@/hooks/usePanelKeybindings";
import { useTranslation } from "@/i18n";
import { useMonacoRuntime } from "@/monaco/useMonacoRuntime";
import { useStore } from "@/store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { DocsFooter } from "./DocsFooter";
import { DocsHeader } from "./DocsHeader";
import "./DocsPage.css";
import { DocsSection } from "./DocsSection";
import { DOCS_SECTION_CONTENT } from "./docsSections";
import { DocsToc } from "./DocsToc";
import { useDocsCollapse } from "./useDocsCollapse";
import { useScrollSpy } from "./useScrollSpy";

const SECTION_NUMBERS = getDocsSectionNumbers();

export function DocsPage() {
  useMonacoRuntime();

  const t = useTranslation();
  const language = useStore((state) => state.language);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const collapse = useDocsCollapse();
  const activeId = useScrollSpy(collapse.visibleIds, mainRef);
  const [pendingScrollId, setPendingScrollId] = useState<DocsSectionId | null>(
    null,
  );

  const initialHash = useMemo(
    () => location.hash.replace("#", ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  usePanelKeybindings(PanelId.DOCS_TOC);

  useEffect(() => {
    if (initialHash) {
      document.getElementById(initialHash)?.scrollIntoView();
    }
  }, [initialHash]);

  // Scrolling
  useEffect(() => {
    if (!pendingScrollId) {
      return;
    }

    document.getElementById(pendingScrollId)?.scrollIntoView({
      behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
    });

    window.history.replaceState(null, "", `#${pendingScrollId}`);
    setPendingScrollId(null);
  }, [pendingScrollId]);

  const navigate = (id: DocsSectionId) => {
    collapse.activateFromToc(id);
    setPendingScrollId(id);
  };

  return (
    <PanelShell panelId={PanelId.DOCS_TOC} id="docs-shell">
      <DocsHeader />
      <DocsToc activeId={activeId} collapse={collapse} onNavigate={navigate} />

      <main ref={mainRef} id="docs-main">
        <article id="docs-article">
          {DOCS_SECTION_ORDER.filter(({ id }) =>
            collapse.isArticleVisible(id),
          ).map(({ id, level }) => {
            const Content = DOCS_SECTION_CONTENT[id];
            return (
              <DocsSection
                key={id}
                id={id}
                level={level}
                number={SECTION_NUMBERS[id]}
                title={t.docs.toc[id]}
                collapsed={collapse.isArticleCollapsed(id)}
                onToggle={() => collapse.toggleArticle(id)}
              >
                <Content key={language} />
              </DocsSection>
            );
          })}
          <DocsFooter />
        </article>
      </main>
    </PanelShell>
  );
}
