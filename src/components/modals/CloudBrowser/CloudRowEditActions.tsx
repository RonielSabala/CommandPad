import { PencilIcon, TrashIcon } from "@/components/icons";

interface CloudRowEditActionsProps {
  onRename: () => void;
  onDelete: () => void;
  renameTitle: string;
  deleteTitle: string;
}

export function CloudRowEditActions({
  onRename,
  onDelete,
  renameTitle,
  deleteTitle,
}: CloudRowEditActionsProps) {
  return (
    <div className="cloud-browser-row-actions">
      <button
        className="btn btn-flat-icon"
        onClick={onRename}
        title={renameTitle}
      >
        <PencilIcon className="icon-md icon-bold" />
      </button>

      <button
        className="btn btn-danger btn-icon"
        onClick={onDelete}
        title={deleteTitle}
      >
        <TrashIcon className="icon-md icon-bold" />
      </button>
    </div>
  );
}
