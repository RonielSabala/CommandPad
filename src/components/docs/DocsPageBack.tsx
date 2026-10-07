import { CssClass } from "@/common/constants/css";
import type { DocsSectionId } from "@/common/constants/docs";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
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
      className={classNames("docs-page-back", CssClass.NO_USER_SELECT)}
      onClick={() => onNavigate(id)}
    >
      <ChevronLeft className={CssClass.ICON} />
      {t.docs.meta.backTo(title)}
    </button>
  );
}
