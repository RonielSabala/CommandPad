import {
  getDocsSectionNumbers,
  isDocsSectionId,
} from "@/common/constants/docs";
import { EventType } from "@/common/constants/events";
import { PanelId } from "@/common/enums";
import { PanelShell } from "@/components/common/panel/PanelShell";
import { usePanelKeybindings } from "@/hooks/usePanelKeybindings";
import { useTranslation } from "@/i18n";
import { useEffect, useRef } from "react";

import { DocsFooter } from "./DocsFooter";
import { DocsHeader } from "./DocsHeader";
import "./DocsPage.css";
import { DocsPageNav } from "./DocsPageNav";
import { DocsSection } from "./DocsSection";
import { DOCS_SECTION_CONTENT } from "./docsSections";
import { DocsToc } from "./DocsToc";
import { useDocsCollapse } from "./useDocsCollapse";
import { useDocsPagination } from "./useDocsPagination";

const SECTION_NUMBERS = getDocsSectionNumbers();

export function DocsPage() {
  const t = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const collapse = useDocsCollapse();

  const { entry, previousId, nextId, goTo } = useDocsPagination(mainRef);
  const { id, level } = entry;

  const Content = DOCS_SECTION_CONTENT[id];

  usePanelKeybindings(PanelId.DOCS_TOC);

  useEffect(() => {
    const followHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (isDocsSectionId(hash)) {
        goTo(hash);
      }
    };

    window.addEventListener(EventType.HASH_CHANGE, followHash);
    return () => window.removeEventListener(EventType.HASH_CHANGE, followHash);
  }, [goTo]);

  return (
    <PanelShell panelId={PanelId.DOCS_TOC} id="docs-shell">
      <DocsHeader />

      <DocsToc pageId={id} collapse={collapse} onNavigate={goTo} />

      <main ref={mainRef} id="docs-main">
        <article id="docs-article">
          <DocsSection
            id={id}
            level={level}
            number={SECTION_NUMBERS[id]}
            title={t.docs.toc[id]}
          >
            <Content />
          </DocsSection>

          <DocsPageNav
            previousId={previousId}
            nextId={nextId}
            onNavigate={goTo}
          />

          <DocsFooter />
        </article>
      </main>
    </PanelShell>
  );
}
