import {
  CodeModelScope,
  RUNBOOK_JSON_PLACEHOLDER,
} from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { CodeEditor } from "@/components/common/codeEditor/CodeEditor";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
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

  // Reset the field each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setText("");
      setHasError(false);
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
    <Modal open={isOpen} onClose={onClose} className="modal-paste-runbook">
      <p className="modal-title">{t.pasteModal.title}</p>
      <p className="modal-message">{t.pasteModal.message}</p>

      {isOpen && (
        <CodeEditor
          modelId={CodeModelScope.PASTE_RUNBOOK}
          language={CodeLanguage.JSON}
          className="paste-runbook-editor"
          value={text}
          placeholder={RUNBOOK_JSON_PLACEHOLDER}
          bounded
          folding
          autoFocus
          hasError={hasError}
          onChange={(value) => {
            setText(value);
            setHasError(false);
          }}
          onSubmit={() => void handleCreate()}
        />
      )}

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
