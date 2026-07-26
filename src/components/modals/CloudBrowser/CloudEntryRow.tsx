import { CloudSyncConfig } from "@/common/config";
import { ExportFormat } from "@/common/enums";
import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { useTranslation } from "@/i18n";
import type { CloudEntry, CloudFolderRef } from "@/services/cloud";
import { useStore } from "@/store/store";
import { stripJsonExtension } from "@/utils/export";
import {
  formatCloudPath,
  formatFileSize,
  formatTimestamp,
} from "@/utils/format";
import { useState } from "react";
import type { Icon } from "react-bootstrap-icons";
import { CloudRowConfirmActions } from "./CloudRowConfirmActions";
import { CloudRowEditActions } from "./CloudRowEditActions";

interface CloudEntryRowProps {
  entry: CloudEntry;
  icon: Icon;
  activateTitle: string;
  onActivate: () => void;
  path?: CloudFolderRef[];
}

export function CloudEntryRow({
  entry,
  icon: EntryIcon,
  activateTitle,
  onActivate,
  path,
}: CloudEntryRowProps) {
  const t = useTranslation();
  const language = useStore((state) => state.language);
  const renameCloudEntry = useStore((state) => state.renameCloudEntry);
  const deleteCloudEntry = useStore((state) => state.deleteCloudEntry);

  // A non-null draft means this row is being renamed
  const [draft, setDraft] = useState<string | null>(null);

  const commitRename = () => {
    if (draft === null || !draft.trim()) {
      return;
    }

    void renameCloudEntry(entry, draft);
    setDraft(null);
  };

  if (draft !== null) {
    return (
      <div className="cloud-browser-row cloud-browser-row-editing">
        <EntryIcon className="icon-md cloud-browser-row-icon" />
        <FilenameInput
          value={draft}
          extension={entry.isFolder ? undefined : ExportFormat.JSON}
          size={FilenameInputSize.COMPACT}
          autoFocus
          placeholder={
            entry.isFolder
              ? t.cloudModal.folderNamePlaceholder
              : t.cloudModal.namePlaceholder
          }
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

  const modifiedAt =
    entry.modifiedAt === null
      ? null
      : formatTimestamp(entry.modifiedAt, language);

  const size =
    entry.size === null
      ? CloudSyncConfig.NO_SIZE_PLACEHOLDER
      : formatFileSize(entry.size, language);

  return (
    <div className="cloud-browser-row">
      <button
        className="cloud-browser-row-main"
        onClick={onActivate}
        title={activateTitle}
      >
        <span className="cloud-browser-row-name-cell">
          <EntryIcon className="icon-md cloud-browser-row-icon" />

          <span className="cloud-browser-row-text">
            <span className="cloud-browser-row-name">{entry.name}</span>

            {path !== undefined && (
              <span className="cloud-browser-row-path">
                {formatCloudPath(path)}
              </span>
            )}
          </span>
        </span>

        <span className="cloud-browser-row-date">{modifiedAt}</span>
        <span className="cloud-browser-row-size">{size}</span>
      </button>

      <CloudRowEditActions
        onRename={() =>
          setDraft(entry.isFolder ? entry.name : stripJsonExtension(entry.name))
        }
        onDelete={() => void deleteCloudEntry(entry)}
        renameTitle={t.cloudModal.renameAction(entry.name)}
        deleteTitle={t.cloudModal.deleteAction(entry.name)}
      />
    </div>
  );
}
