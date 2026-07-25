import { ExportFormat } from "@/common/enums";
import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { useTranslation } from "@/i18n";
import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { stripJsonExtension } from "@/utils/export";
import { useState } from "react";
import { FileEarmarkTextFill } from "react-bootstrap-icons";
import { CloudFileMeta } from "./CloudFileMeta";
import { CloudRowConfirmActions } from "./CloudRowConfirmActions";
import { CloudRowEditActions } from "./CloudRowEditActions";

export function CloudFileRow({ file }: { file: CloudEntry }) {
  const t = useTranslation();
  const renameCloudFile = useStore((state) => state.renameCloudFile);
  const deleteCloudFile = useStore((state) => state.deleteCloudFile);
  const importRunbookFromCloud = useStore(
    (state) => state.importRunbookFromCloud,
  );

  // A non-null draft means this row is being renamed
  const [draft, setDraft] = useState<string | null>(null);

  const commitRename = () => {
    if (draft === null || !draft.trim()) {
      return;
    }

    void renameCloudFile(file, draft);
    setDraft(null);
  };

  if (draft !== null) {
    return (
      <div className="cloud-browser-row">
        <FileEarmarkTextFill className="icon-md cloud-browser-row-icon" />
        <FilenameInput
          value={draft}
          extension={ExportFormat.JSON}
          size={FilenameInputSize.COMPACT}
          autoFocus
          placeholder={t.cloudModal.namePlaceholder}
          onChange={setDraft}
          onSubmit={commitRename}
          onCancel={() => setDraft(null)}
        />

        <CloudRowConfirmActions
          onConfirm={commitRename}
          onCancel={() => setDraft(null)}
          confirmDisabled={!draft.trim()}
          confirmTitle={t.cloudModal.saveName}
          cancelTitle={t.cloudModal.cancelRename}
        />
      </div>
    );
  }

  return (
    <div className="cloud-browser-row">
      <button
        className="cloud-browser-row-main"
        onClick={() => void importRunbookFromCloud(file)}
        title={t.cloudModal.importAction(file.name)}
      >
        <FileEarmarkTextFill className="icon-md cloud-browser-row-icon" />

        <span className="cloud-browser-row-text">
          <span className="cloud-browser-row-name">{file.name}</span>
          <CloudFileMeta file={file} />
        </span>
      </button>

      <CloudRowEditActions
        onRename={() => setDraft(stripJsonExtension(file.name))}
        onDelete={() => void deleteCloudFile(file)}
        renameTitle={t.cloudModal.renameAction(file.name)}
        deleteTitle={t.cloudModal.deleteAction(file.name)}
      />
    </div>
  );
}
