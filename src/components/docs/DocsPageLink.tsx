import {
  getDocsSectionNumbers,
  type DocsSectionId,
} from "@/common/constants/docs";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

import "./DocsPageLink.css";

const SECTION_NUMBERS = getDocsSectionNumbers();

interface Props {
  id: DocsSectionId;
  next?: boolean;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsPageLink({ id, next = false, onNavigate }: Props) {
  const t = useTranslation();
  const direction = next ? t.docs.meta.nextPage : t.docs.meta.previousPage;

  return (
    <button
      className={classNames("docs-page-link", next && "is-next")}
      aria-label={`${direction}: ${t.docs.toc[id]}`}
      onClick={() => onNavigate(id)}
    >
      {!next && <ChevronLeft className="docs-page-link-icon icon" />}

      <span className="docs-page-link-text">
        <span className="docs-page-link-label">{direction}</span>

        <span className="docs-page-link-title">
          <span className="docs-page-link-number">{SECTION_NUMBERS[id]}</span>
          {t.docs.toc[id]}
        </span>
      </span>

      {next && <ChevronRight className="docs-page-link-icon icon" />}
    </button>
  );
}
