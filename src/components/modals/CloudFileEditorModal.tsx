import { RUNBOOK_JSON_PLACEHOLDER } from "@/common/config";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import { CodeEditor } from "@/components/common/CodeEditor";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import "./CloudFileEditorModal.css";
import { Modal } from "./Modal";

export function CloudFileEditorModal() {
  const t = useTranslation();
  const editor = useStore((state) => state.cloudFileEditor);
  const setText = useStore((state) => state.setCloudFileEditorText);
  const save = useStore((state) => state.saveCloudFileEditor);
  const close = useStore((state) => state.closeCloudFileEditor);

  const busy = editor !== null && (editor.loading || editor.saving);
  const dirty = editor !== null && editor.text !== editor.original;

  return (
    <Modal
      open={editor !== null}
      onClose={() => void close()}
      className="modal-cloud-editor"
      animated={false}
      noBackdrop
    >
      <p className="modal-title">
        {t.cloudModal.editTitle(editor?.file.name ?? "")}
      </p>
      <p className="modal-message">{t.cloudModal.editHint}</p>

      {editor?.loading ? (
        <p className="cloud-file-editor-status">{t.cloudModal.loading}</p>
      ) : (
        <CodeEditor
          className="cloud-file-editor-field"
          value={editor?.text ?? ""}
          onChange={setText}
          placeholder={RUNBOOK_JSON_PLACEHOLDER}
          bounded
          hasError={Boolean(editor?.error)}
          resizeDeps={[editor?.file.id]}
          onKeyDown={(event) => {
            if (
              !matchesKeybinding(event.nativeEvent, KeyBinding.SUBMIT_EDITOR)
            ) {
              return;
            }

            event.preventDefault();
            if (!busy && dirty) {
              void save();
            }
          }}
        />
      )}

      {editor?.error && (
        <p className="cloud-file-editor-error">{editor.error}</p>
      )}

      <div className="modal-actions">
        <button className="btn btn-lg" onClick={() => void close()}>
          {t.common.cancel}
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-primary"
          onClick={() => void save()}
          disabled={busy || !dirty}
        >
          {t.common.save}
        </button>
      </div>
    </Modal>
  );
}
