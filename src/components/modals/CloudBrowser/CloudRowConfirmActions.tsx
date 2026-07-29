import { CheckIcon, XIcon } from "@/components/icons";

interface CloudRowConfirmActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  confirmTitle: string;
  cancelTitle: string;
}

export function CloudRowConfirmActions({
  onConfirm,
  onCancel,
  confirmDisabled,
  confirmTitle,
  cancelTitle,
}: CloudRowConfirmActionsProps) {
  return (
    <div className="cloud-browser-row-actions">
      <button
        className="btn btn-flat-icon"
        onClick={onConfirm}
        disabled={confirmDisabled}
        title={confirmTitle}
      >
        <CheckIcon className="icon-md icon-bold" />
      </button>

      <button
        className="btn btn-flat-icon"
        onClick={onCancel}
        title={cancelTitle}
      >
        <XIcon className="icon-md icon-bold" />
      </button>
    </div>
  );
}
