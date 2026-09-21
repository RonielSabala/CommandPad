import type { DocsSectionId } from "@/common/constants/docs";
import { useTranslation } from "@/i18n";
import { ChevronLeft } from "react-bootstrap-icons";

import "./DocsPageBack.css";

interface Props {
  id: DocsSectionId;
  onNavigate: (id: DocsSectionId) => void;
}

export function DocsPageBack({ id, onNavigate }: Props) {
  const t = useTranslation();
  const title = t.docs.toc[id];

  return (
    <button
      className="docs-page-back no-user-select"
      onClick={() => onNavigate(id)}
    >
      <ChevronLeft className="icon" />
      {t.docs.meta.backTo(title)}
    </button>
  );
}
