import { CloudSyncConfig } from "@/common/config";
import {
  CodeModelScope,
  RUNBOOK_JSON_PLACEHOLDER,
} from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { NoteText } from "@/components/blocks/note/NoteText";
import { CodeEditor } from "@/components/common/codeEditor/CodeEditor";
import { Spinner } from "@/components/common/Spinner";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { formatCloudPath } from "@/utils/format";
import { Modal } from "../Modal";
import "./CloudFileEditorModal.css";

export function CloudFileEditorModal() {
  const t = useTranslation();
  const editor = useStore((state) => state.cloudFileEditor);
  const setText = useStore((state) => state.setCloudFileEditorText);
  const save = useStore((state) => state.saveCloudFileEditor);
  const close = useStore((state) => state.closeCloudFileEditor);

  const busy = editor !== null && (editor.loading || editor.saving);
  const dirty = editor !== null && editor.text !== editor.original;
  const filePath = editor
    ? [formatCloudPath(editor.folderPath), editor.file.name].join(
        CloudSyncConfig.PATH_SEPARATOR,
      )
    : "";

  return (
    <Modal
      open={editor !== null}
      onClose={() => void close()}
      className="modal-cloud-editor"
      animated={false}
      noBackdrop
    >
      <p className="modal-title">
        <NoteText text={t.cloudModal.editTitle(filePath)} />
      </p>
      <p className="modal-message">{t.cloudModal.editHint}</p>

      {editor?.loading ? (
        <p className="cloud-file-editor-status">
          <Spinner />
          {t.cloudModal.loading}
        </p>
      ) : (
        editor && (
          <CodeEditor
            modelId={`${CodeModelScope.CLOUD_FILE}/${editor.file.id}`}
            language={CodeLanguage.JSON}
            className="cloud-file-editor-field"
            value={editor.text}
            onChange={setText}
            placeholder={RUNBOOK_JSON_PLACEHOLDER}
            bounded
            hasError={Boolean(editor.error)}
            onSubmit={() => {
              if (!busy && dirty) {
                void save();
              }
            }}
          />
        )
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
