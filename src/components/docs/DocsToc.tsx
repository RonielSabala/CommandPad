import {
  DOCS_SECTION_ORDER,
  DocsSectionLevel,
  getDocsSectionNumbers,
  type DocsSectionId,
} from "@/common/constants/docs";
import { PanelId } from "@/common/enums";
import { ResizablePanel } from "@/components/common/panel/ResizablePanel";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import "./DocsToc.css";
import type { DocsCollapse } from "./useDocsCollapse";

const SECTION_NUMBERS = getDocsSectionNumbers();

interface Props {
  activeId: string | null;
  collapse: DocsCollapse;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsToc({ activeId, collapse, onNavigate }: Props) {
  const t = useTranslation();

  const toggleAllLabel = collapse.allCollapsed
    ? t.docs.meta.expandAll
    : t.docs.meta.collapseAll;

  return (
    <ResizablePanel panelId={PanelId.DOCS_TOC} id="docs-toc">
      <button
        id="docs-toc-header"
        className="no-user-select"
        title={toggleAllLabel}
        aria-label={toggleAllLabel}
        aria-expanded={!collapse.allCollapsed}
        onClick={collapse.toggleAll}
      >
        <span id="docs-toc-title" className="section-title">
          {t.docs.meta.tocTitle}
        </span>

        <SidebarSectionChevronIcon
          className={classNames(
            "docs-toc-chevron icon-md icon-bold",
            collapse.allCollapsed && "is-collapsed",
          )}
        />
      </button>

      <nav id="docs-toc-nav">
        {DOCS_SECTION_ORDER.filter(({ id }) => collapse.isNavVisible(id)).map(
          ({ id, level }) => (
            <a
              key={id}
              href={`#${id}`}
              className={classNames(
                "docs-toc-item",
                "no-user-select",
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

              {collapse.hasChildren(id) ? (
                <span
                  className="docs-toc-chevron-hit"
                  role="button"
                  tabIndex={0}
                  aria-expanded={!collapse.isNavCollapsed(id)}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    collapse.toggleNav(id);
                  }}
                >
                  <SidebarSectionChevronIcon
                    className={classNames(
                      "docs-toc-chevron icon-md icon-bold",
                      collapse.isNavCollapsed(id) && "is-collapsed",
                    )}
                  />
                </span>
              ) : (
                <span className="docs-toc-chevron-spacer" />
              )}
            </a>
          ),
        )}
      </nav>
    </ResizablePanel>
  );
}
