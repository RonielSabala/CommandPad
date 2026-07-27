import { DEFAULT_CONFIRM_LABEL } from "@/common/config";
import { EventType, Key } from "@/common/constants/events";
import { DialogTone } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { DialogModal } from "./DialogModal";

export function ConfirmModal() {
  const t = useTranslation();
  const dialog = useStore((state) => state.confirmDialog);
  const resolve = useStore((state) => state.resolveConfirm);

  const isOpen = dialog !== null;
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState(DEFAULT_CONFIRM_LABEL);
  const [confirmLabel, setConfirmLabel] = useState(DEFAULT_CONFIRM_LABEL);
  const [tone, setTone] = useState<DialogTone>(DialogTone.INFO);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Keep the last message rendered while the modal fades out
  useEffect(() => {
    if (dialog) {
      setMessage(dialog.message);
      setTitle(dialog.title);
      setConfirmLabel(dialog.confirmLabel);
      setTone(dialog.tone);
    }
  }, [dialog]);

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
