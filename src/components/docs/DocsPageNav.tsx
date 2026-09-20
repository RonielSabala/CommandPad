import type { DocsSectionId } from "@/common/constants/docs";
import { DocsPageLink } from "./DocsPageLink";

import "./DocsPageNav.css";

interface Props {
  previousId: DocsSectionId | null;
  nextId: DocsSectionId | null;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsPageNav({ previousId, nextId, onNavigate }: Props) {
  return (
    <nav id="docs-page-nav" className="no-user-select">
      {previousId && <DocsPageLink id={previousId} onNavigate={onNavigate} />}
      {nextId && <DocsPageLink id={nextId} next onNavigate={onNavigate} />}
    </nav>
  );
}
