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

import { DocsHeader } from "./DocsHeader";
import "./DocsPage.css";
import { DocsPageBack } from "./DocsPageBack";
import { DocsPageNav } from "./DocsPageNav";
import { DocsSection } from "./DocsSection";
import { DOCS_SECTION_CONTENT } from "./docsSections";
import { DocsToc } from "./DocsToc";
import { useDocsCollapse } from "./useDocsCollapse";
import { useDocsPagination } from "./useDocsPagination";

const SECTION_NUMBERS = getDocsSectionNumbers();

export function DocsPage() {
  const t = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const collapse = useDocsCollapse();

  const { entry, previousId, nextId, position, total, goTo } =
    useDocsPagination(scrollRef);

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

      <main id="docs-main">
        <div ref={scrollRef} id="docs-scroll">
          <article id="docs-article">
            {previousId && <DocsPageBack id={previousId} onNavigate={goTo} />}

            <DocsSection
              id={id}
              level={level}
              number={SECTION_NUMBERS[id]}
              title={t.docs.toc[id]}
            >
              <Content />
            </DocsSection>
          </article>
        </div>

        <DocsPageNav
          previousId={previousId}
          nextId={nextId}
          position={position}
          total={total}
          onNavigate={goTo}
        />
      </main>
    </PanelShell>
  );
}
