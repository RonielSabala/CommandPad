import { CssClass } from "@/common/constants/css";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { useTranslation } from "@/i18n";
import { InfoCircle } from "react-bootstrap-icons";

interface Props {
  onSelect: () => void;
  label?: string;
}

export function InfoMenuItem({ onSelect, label }: Props) {
  const t = useTranslation();

  return (
    <ContextMenuItem
      icon={<InfoCircle className={CssClass.ICON_MD} />}
      onSelect={onSelect}
    >
      {label ?? t.info.action}
    </ContextMenuItem>
  );
}
