import { DEFAULT_CONFIRM_LABEL } from "@/common/config";
import { EventType, Key } from "@/common/constants/events";
import { DialogTone } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useRef } from "react";
import { DialogModal } from "./DialogModal";

interface CachedDialog {
  message: string;
  title: string;
  confirmLabel: string;
  tone: DialogTone;
}

const EMPTY_DIALOG: CachedDialog = {
  message: "",
  title: DEFAULT_CONFIRM_LABEL,
  confirmLabel: DEFAULT_CONFIRM_LABEL,
  tone: DialogTone.INFO,
};

export function ConfirmModal() {
  const t = useTranslation();
  const dialog = useStore((state) => state.confirmDialog);
  const resolve = useStore((state) => state.resolveConfirm);

  const isOpen = dialog !== null;
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Keep the last dialog rendered while the modal fades out
  const lastDialogRef = useRef(EMPTY_DIALOG);
  if (dialog) {
    lastDialogRef.current = dialog;
  }

  const { message, title, confirmLabel, tone } = lastDialogRef.current;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === Key.ENTER) {
        event.preventDefault();
        resolve(true);
      }
    };

    document.addEventListener(EventType.KEY_DOWN, onKey);
    return () => document.removeEventListener(EventType.KEY_DOWN, onKey);
  }, [isOpen, resolve]);

  return (
    <DialogModal
      open={isOpen}
      onClose={() => resolve(false)}
      tone={tone}
      title={title}
      message={message}
    >
      <button className="btn btn-lg" onClick={() => resolve(false)}>
        {t.common.cancel}
      </button>

      <div className="vertical-divider" />

      <button
        ref={confirmRef}
        className="btn btn-lg btn-tone"
        onClick={() => resolve(true)}
      >
        {confirmLabel}
      </button>
    </DialogModal>
  );
}
