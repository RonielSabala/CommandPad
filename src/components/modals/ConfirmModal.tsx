import { useEffect, useRef, useState } from "react";

import { EventType, Key } from "@/common/constants/events";
import { useStore } from "@/store/store";
import { Modal } from "./Modal";

export function ConfirmModal() {
  const dialog = useStore((s) => s.confirmDialog);
  const resolve = useStore((s) => s.resolveConfirm);
  const open = dialog !== null;
  const [message, setMessage] = useState("");
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Keep the last message rendered while the modal fades out
  useEffect(() => {
    if (dialog) {
      setMessage(dialog.message);
    }
  }, [dialog]);

  useEffect(() => {
    if (!open) {
      return;
    }
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === Key.ENTER) {
        e.preventDefault();
        resolve(true);
      }
    };
    document.addEventListener(EventType.KEY_DOWN, onKey);
    return () => document.removeEventListener(EventType.KEY_DOWN, onKey);
  }, [open, resolve]);

  return (
    <Modal open={open} onClose={() => resolve(false)}>
      <p className="modal-title">Clear Workspace</p>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-lg" onClick={() => resolve(false)}>
          Cancel
        </button>
        <div className="vertical-divider" />
        <button
          ref={confirmRef}
          className="btn btn-lg btn-danger"
          onClick={() => resolve(true)}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
