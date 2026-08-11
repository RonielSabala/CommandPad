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
import { classNames } from "@/utils/string";
import { useState, type MouseEvent } from "react";
import type { Icon } from "react-bootstrap-icons";

import { CloudRowConfirmActions } from "./CloudRowConfirmActions";
import { CloudRowMenu } from "./CloudRowMenu";
import { CloudSelectCircle } from "./CloudSelectCircle";
import { useCloudSelection } from "./cloudSelection";

const NAME_CLASS = "cloud-browser-row-name";
const OWN_CLICK_SELECTOR =
  ".cloud-browser-row-select, .cloud-browser-row-actions";

interface CloudEntryRowProps {
  entry: CloudEntry;
  icon: Icon;
  activateTitle: string;
  onActivate: () => void;
  onEdit?: () => void;
  path?: CloudFolderRef[];
}

export function CloudEntryRow({
  entry,
  icon: EntryIcon,
  activateTitle,
  onActivate,
  onEdit,
  path,
}: CloudEntryRowProps) {
  const t = useTranslation();
  const language = useStore((state) => state.language);
  const renameCloudEntry = useStore((state) => state.renameCloudEntry);
  const importRunbooksFromCloud = useStore(
    (state) => state.importRunbooksFromCloud,
  );
  const duplicateCloudEntries = useStore(
    (state) => state.duplicateCloudEntries,
  );
  const downloadCloudEntries = useStore((state) => state.downloadCloudEntries);
  const deleteCloudEntries = useStore((state) => state.deleteCloudEntries);

  const selection = useCloudSelection();
  const selectedEntries = useStore((state) => state.cloudSelectedEntries);
  const selected = selectedEntries.has(entry.id);

  const targets =
    selected && selectedEntries.size > 1
      ? [...selectedEntries.values()].map((picked) => picked.entry)
      : [entry];

  const files = targets.filter((target) => !target.isFolder);
  const multiple = targets.length > 1;

  const handleRowClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!event.currentTarget.contains(target)) {
      return;
    }

    if (target.closest(OWN_CLICK_SELECTOR)) {
      return;
    }

    const plain = !event.shiftKey && !event.ctrlKey && !event.metaKey;
    if (plain && target.closest(`.${NAME_CLASS}`)) {
      onActivate();
      return;
    }

    selection.select(entry, event);
  };

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
    <div
      className={classNames("cloud-browser-row", selected && "is-selected")}
      onClick={handleRowClick}
    >
      <CloudSelectCircle
        selected={selected}
        title={
          selected
            ? t.cloudModal.deselectRow(entry.name)
            : t.cloudModal.selectRow(entry.name)
        }
        onToggle={() => selection.toggle(entry)}
      />

      <button className="cloud-browser-row-main">
        <span className="cloud-browser-row-name-cell">
          <EntryIcon className="icon-md cloud-browser-row-icon" />

          <span className="cloud-browser-row-text">
            <span className={NAME_CLASS} title={activateTitle}>
              {entry.name}
            </span>

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

      <CloudRowMenu
        count={targets.length}
        onRename={
          multiple
            ? undefined
            : () =>
                setDraft(
                  entry.isFolder ? entry.name : stripJsonExtension(entry.name),
                )
        }
        onEdit={multiple ? undefined : onEdit}
        onImport={
          multiple && files.length > 0
            ? () => void importRunbooksFromCloud(files)
            : undefined
        }
        onDuplicate={() => void duplicateCloudEntries(targets)}
        onDownload={() => void downloadCloudEntries(targets)}
        onDelete={() => void deleteCloudEntries(targets)}
        menuTitle={t.cloudModal.entryActions}
      />
    </div>
  );
}
