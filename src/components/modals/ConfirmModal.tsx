import { DEFAULT_CONFIRM_LABEL } from "@/common/config";
import { EventType, Key } from "@/common/constants/events";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";

export function ConfirmModal() {
  const t = useTranslation();
  const dialog = useStore((state) => state.confirmDialog);
  const resolve = useStore((state) => state.resolveConfirm);

  const isOpen = dialog !== null;
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState(DEFAULT_CONFIRM_LABEL);
  const [confirmLabel, setConfirmLabel] = useState(DEFAULT_CONFIRM_LABEL);
  const [isDanger, setDanger] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Keep the last message rendered while the modal fades out
  useEffect(() => {
    if (dialog) {
      setMessage(dialog.message);
      setTitle(dialog.title);
      setConfirmLabel(dialog.confirmLabel);
      setDanger(dialog.danger);
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
    <Modal open={isOpen} onClose={() => resolve(false)}>
      <p className="modal-title">{title}</p>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-lg" onClick={() => resolve(false)}>
          {t.common.cancel}
        </button>
        <div className="vertical-divider" />
        <button
          ref={confirmRef}
          className={classNames(
            "btn",
            "btn-lg",
            isDanger ? "btn-danger" : "btn-primary",
          )}
          onClick={() => resolve(true)}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
