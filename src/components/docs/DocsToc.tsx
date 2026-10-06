import { CssClass } from "@/common/constants/css";
import {
  DOCS_SECTION_ORDER,
  DocsSectionLevel,
  getDocsSectionNumbers,
  getDocsSectionParents,
  type DocsSectionId,
} from "@/common/constants/docs";
import { ScrollIntoView } from "@/common/constants/dom";
import { PanelId } from "@/common/enums";
import { asButton } from "@/components/common/asButton";
import { ResizablePanel } from "@/components/common/panel/ResizablePanel";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useEffect, useRef } from "react";

import "./DocsToc.css";
import type { DocsCollapse } from "./useDocsCollapse";

const SECTION_NUMBERS = getDocsSectionNumbers();
const SECTION_PARENTS = getDocsSectionParents();

interface Props {
  pageId: DocsSectionId;
  collapse: DocsCollapse;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsToc({ pageId, collapse, onNavigate }: Props) {
  const t = useTranslation();
  const activeRef = useRef<HTMLAnchorElement>(null);

  const highlightId = collapse.isVisible(pageId)
    ? pageId
    : SECTION_PARENTS[pageId];

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: ScrollIntoView.BLOCK_NEAREST,
      behavior: ScrollIntoView.BEHAVIOR_SMOOTH,
    });
  }, [highlightId]);

  const toggleAllLabel = collapse.allCollapsed
    ? t.docs.meta.expandAll
    : t.docs.meta.collapseAll;

  const foldLabel = (id: DocsSectionId) =>
    collapse.isCollapsed(id)
      ? t.docs.meta.showSubsections
      : t.docs.meta.hideSubsections;

  return (
    <ResizablePanel panelId={PanelId.DOCS_TOC} id="docs-toc">
      <div id="docs-toc-card" className="panel-card">
        <button
          id="docs-toc-header"
          className={CssClass.NO_USER_SELECT}
          {...tooltip(toggleAllLabel)}
          aria-label={toggleAllLabel}
          aria-expanded={!collapse.allCollapsed}
          onClick={collapse.toggleAll}
        >
          <span id="docs-toc-title" className="section-title">
            {t.docs.meta.tocTitle}
          </span>

          <SidebarSectionChevronIcon
            className={classNames(
              "docs-toc-chevron",
              collapse.allCollapsed && "is-collapsed",
              CssClass.ICON_MD,
              CssClass.ICON_BOLD,
            )}
          />
        </button>

        <nav id="docs-toc-nav">
          {DOCS_SECTION_ORDER.filter(({ id }) => collapse.isVisible(id)).map(
            ({ id, level }) => (
              <a
                key={id}
                ref={id === highlightId ? activeRef : null}
                href={`#${id}`}
                className={classNames(
                  "docs-toc-item",
                  id === highlightId && "docs-toc-active",
                  level === DocsSectionLevel.SUBSECTION && "docs-toc-sub",
                  CssClass.NO_USER_SELECT,
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
                    {...tooltip(foldLabel(id))}
                    aria-label={foldLabel(id)}
                    aria-expanded={!collapse.isCollapsed(id)}
                    {...asButton((event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      collapse.toggle(id);
                    })}
                  >
                    <SidebarSectionChevronIcon
                      className={classNames(
                        "docs-toc-chevron",
                        collapse.isCollapsed(id) && "is-collapsed",
                        CssClass.ICON_MD,
                        CssClass.ICON_BOLD,
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
      </div>
    </ResizablePanel>
  );
}
