import { CssClass } from "@/common/constants/css";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { useTranslation } from "@/i18n";
import { InfoCircle } from "react-bootstrap-icons";

export function InfoMenuItem({ onSelect }: { onSelect: () => void }) {
  const t = useTranslation();

  return (
    <ContextMenuItem
      icon={<InfoCircle className={CssClass.ICON_MD} />}
      onSelect={onSelect}
    >
      {t.info.action}
    </ContextMenuItem>
  );
}
