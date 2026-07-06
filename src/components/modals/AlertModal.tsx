import { useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";

export function AlertModal() {
  const dialog = useStore((state) => state.alertDialog);
  const resolve = useStore((state) => state.resolveAlert);
  const open = dialog !== null;

  const [message, setMessage] = useState("");
  const okRef = useRef<HTMLButtonElement>(null);

  // Keep the last message rendered while the modal fades out
  useEffect(() => {
    if (dialog) {
      setMessage(dialog.message);
    }
  }, [dialog]);

  useEffect(() => {
    if (open) {
      okRef.current?.focus();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={resolve}>
      <p className="modal-title">Invalid Format</p>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button
          ref={okRef}
          className="btn btn-lg btn-primary"
          onClick={resolve}
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
