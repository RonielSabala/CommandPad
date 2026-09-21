import type { DocsSectionId } from "@/common/constants/docs";
import { useTranslation } from "@/i18n";
import type { CSSProperties } from "react";

import { DocsFooter } from "./DocsFooter";
import { DocsPageLink } from "./DocsPageLink";
import "./DocsPageNav.css";

interface Props {
  previousId: DocsSectionId | null;
  nextId: DocsSectionId | null;
  position: number;
  total: number;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsPageNav({
  previousId,
  nextId,
  position,
  total,
  onNavigate,
}: Props) {
  const t = useTranslation();
  const progress = `${(position / total) * 100}%`;

  return (
    <div id="docs-page-bar" className="no-user-select">
      <div
        className="docs-page-progress"
        style={{ "--docs-page-progress": progress } as CSSProperties}
        role="progressbar"
        aria-valuenow={position}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={t.docs.meta.pageProgress(position, total)}
      />

      <nav id="docs-page-nav">
        {previousId ? (
          <DocsPageLink id={previousId} onNavigate={onNavigate} />
        ) : (
          <span />
        )}

        <span className="docs-page-nav-count">
          {t.docs.meta.pageProgress(position, total)}
        </span>

        {nextId ? (
          <DocsPageLink id={nextId} next onNavigate={onNavigate} />
        ) : (
          <span />
        )}

        <DocsFooter />
      </nav>
    </div>
  );
}
