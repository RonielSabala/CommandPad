import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuAlign,
  ContextMenuItem,
} from "@/components/common/contextMenu/ContextMenu";
import { TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
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
      className="cloud-browser-row-actions"
      title={menuTitle}
      align={ContextMenuAlign.END}
      horizontal={true}
    >
      {onRename && (
        <ContextMenuItem icon={<Vr className="icon-md" />} onSelect={onRename}>
          {t.cloudModal.rename}
        </ContextMenuItem>
      )}

      {onEdit && (
        <ContextMenuItem
          icon={<PencilSquare className="icon-md" />}
          onSelect={onEdit}
        >
          {t.cloudModal.edit}
        </ContextMenuItem>
      )}

      {onImport && (
        <ContextMenuItem
          icon={<BoxArrowInDown className="icon-md" />}
          onSelect={onImport}
        >
          {t.cloudModal.importFiles}
        </ContextMenuItem>
      )}

      <ContextMenuItem
        icon={<Copy className="icon-md" />}
        onSelect={onDuplicate}
      >
        {t.cloudModal.duplicate(count)}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<Download className="icon-md" />}
        onSelect={onDownload}
      >
        {t.cloudModal.download(count)}
      </ContextMenuItem>

      <ContextMenuItem
        icon={<TrashIcon className="icon-md icon-bold" />}
        onSelect={onDelete}
        danger
      >
        {t.cloudModal.delete(count)}
      </ContextMenuItem>
    </ActionsMenu>
  );
}
