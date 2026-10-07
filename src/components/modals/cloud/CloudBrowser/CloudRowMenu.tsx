import { CssClass } from "@/common/constants/css";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuAlign,
  ContextMenuItem,
} from "@/components/common/contextMenu/ContextMenu";
import { TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import {
  BoxArrowInDown,
  Copy,
  Download,
  PencilSquare,
  Vr,
} from "react-bootstrap-icons";

interface CloudRowMenuProps {
  count: number;
  onRename?: () => void;
  onEdit?: () => void;
  onImport?: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onDelete: () => void;
  menuTitle: string;
}

export function CloudRowMenu({
  count,
  onRename,
  onEdit,
  onImport,
  onDuplicate,
  onDownload,
  onDelete,
  menuTitle,
}: CloudRowMenuProps) {
  const t = useTranslation();

  return (
    <ActionsMenu
      className="cloud-browser-row-actions cloud-browser-row-menu"
      title={menuTitle}
      align={ContextMenuAlign.END}
      horizontal={true}
    >
      {onRename && (
        <ContextMenuItem
          icon={<Vr className={CssClass.ICON_MD} />}
          onSelect={onRename}
        >
          {t.cloudModal.rename}
        </ContextMenuItem>
      )}

      {onEdit && (
        <ContextMenuItem
          icon={<PencilSquare className={CssClass.ICON_MD} />}
          onSelect={onEdit}
        >
          {t.cloudModal.edit}
        </ContextMenuItem>
      )}

      {onImport && (
        <ContextMenuItem
          icon={<BoxArrowInDown className={CssClass.ICON_MD} />}
          onSelect={onImport}
        >
          {t.cloudModal.importFiles}
        </ContextMenuItem>
      )}

      <ContextMenuItem
        icon={<Copy className={CssClass.ICON_MD} />}
        onSelect={onDuplicate}
      >
        {t.cloudModal.duplicate(count)}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<Download className={CssClass.ICON_MD} />}
        onSelect={onDownload}
      >
        {t.cloudModal.download(count)}
      </ContextMenuItem>

      <ContextMenuItem
        icon={
          <TrashIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
        onSelect={onDelete}
        danger
      >
        {t.cloudModal.delete(count)}
      </ContextMenuItem>
    </ActionsMenu>
  );
}
