import { ActionsMenu } from "@/components/common/ActionsMenu";
import {
  ContextMenuAlign,
  ContextMenuItem,
} from "@/components/common/ContextMenu";
import { TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { Copy, Download, PencilSquare, Vr } from "react-bootstrap-icons";

interface CloudRowMenuProps {
  onRename: () => void;
  onEdit?: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onDelete: () => void;
  menuTitle: string;
}

export function CloudRowMenu({
  onRename,
  onEdit,
  onDuplicate,
  onDownload,
  onDelete,
  menuTitle,
}: CloudRowMenuProps) {
  const t = useTranslation();

  return (
    <ActionsMenu
      className="cloud-browser-row-actions"
      title={menuTitle}
      align={ContextMenuAlign.END}
    >
      <ContextMenuItem icon={<Vr className="icon-md" />} onSelect={onRename}>
        {t.cloudModal.rename}
      </ContextMenuItem>

      {onEdit && (
        <ContextMenuItem
          icon={<PencilSquare className="icon-md" />}
          onSelect={onEdit}
        >
          {t.cloudModal.edit}
        </ContextMenuItem>
      )}

      <ContextMenuItem
        icon={<Copy className="icon-md" />}
        onSelect={onDuplicate}
      >
        {t.cloudModal.duplicate}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<Download className="icon-md" />}
        onSelect={onDownload}
      >
        {t.cloudModal.download}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<TrashIcon className="icon-md icon-bold" />}
        onSelect={onDelete}
        danger
      >
        {t.cloudModal.delete}
      </ContextMenuItem>
    </ActionsMenu>
  );
}
