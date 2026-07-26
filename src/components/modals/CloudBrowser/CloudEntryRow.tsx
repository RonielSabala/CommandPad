import { ExportFormat } from "@/common/enums";
import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { useTranslation } from "@/i18n";
import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { stripJsonExtension } from "@/utils/export";
import { useState, type ReactNode } from "react";
import type { Icon } from "react-bootstrap-icons";
import { CloudRowConfirmActions } from "./CloudRowConfirmActions";
import { CloudRowEditActions } from "./CloudRowEditActions";

interface CloudEntryRowProps {
  entry: CloudEntry;
  icon: Icon;
  activateTitle: string;
  onActivate: () => void;
  meta?: ReactNode;
}

export function CloudEntryRow({
  entry,
  icon: EntryIcon,
  activateTitle,
  onActivate,
  meta,
}: CloudEntryRowProps) {
  const t = useTranslation();
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
      <div className="cloud-browser-row">
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

  return (
    <div className="cloud-browser-row">
      <button
        className="cloud-browser-row-main"
        onClick={onActivate}
        title={activateTitle}
      >
        <EntryIcon className="icon-md cloud-browser-row-icon" />

        <span className="cloud-browser-row-text">
          <span className="cloud-browser-row-name">{entry.name}</span>
          {meta}
        </span>
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
