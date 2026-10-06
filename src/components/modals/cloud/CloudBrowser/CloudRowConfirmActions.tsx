import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { CheckIcon, XIcon } from "@/components/icons";
import { classNames } from "@/utils/string";

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
        className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
        onClick={onConfirm}
        disabled={confirmDisabled}
        aria-label={confirmTitle}
        {...tooltip(confirmTitle)}
      >
        <CheckIcon
          className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
        />
      </button>

      <button
        className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
        onClick={onCancel}
        aria-label={cancelTitle}
        {...tooltip(cancelTitle)}
      >
        <XIcon className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)} />
      </button>
    </div>
  );
}
