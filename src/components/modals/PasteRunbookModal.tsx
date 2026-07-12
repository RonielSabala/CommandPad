import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import "./PasteRunbookModal.css";

export function PasteRunbookModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.pasteRunbookModalOpen);
  const onClose = useStore((state) => state.closePasteRunbookModal);
  const importRunbookFromText = useStore(
    (state) => state.importRunbookFromText,
  );

  const [text, setText] = useState("");
  const [hasError, setHasError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset the field each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setText("");
      setHasError(false);
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!text.trim()) {
      setHasError(true);
      return;
    }

    const created = await importRunbookFromText(text);
    if (created) {
      onClose();
    } else {
      setHasError(true);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <p className="modal-title">{t.pasteModal.title}</p>
      <p className="modal-message">{t.pasteModal.message}</p>
      <textarea
        ref={textareaRef}
        className={`paste-runbook-input${hasError ? " has-error" : ""}`}
        value={text}
        spellCheck={false}
        placeholder={'{\n  "variables": [],\n  "blocks": []\n}'}
        onChange={(event) => {
          setText(event.target.value);
          setHasError(false);
        }}
      />
      {hasError && <p className="paste-runbook-error">{t.pasteModal.error}</p>}
      <div className="modal-actions">
        <button className="btn btn-lg" onClick={onClose}>
          {t.common.cancel}
        </button>
        <div className="vertical-divider" />
        <button
          className="btn btn-lg btn-primary"
          onClick={() => void handleCreate()}
        >
          {t.common.create}
        </button>
      </div>
    </Modal>
  );
}
