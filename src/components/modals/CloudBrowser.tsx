import { CloudSyncConfig } from "@/common/config";
import { CloudProvider, ExportFormat, HistoryDirection } from "@/common/enums";
import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { stripJsonExtension } from "@/utils/export";
import { formatFileSize, formatTimestamp } from "@/utils/format";
import { Fragment, useState } from "react";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileEarmarkTextFill,
  FolderFill,
  FolderPlus,
} from "react-bootstrap-icons";
import "./CloudBrowser.css";
import { PROVIDER_ICON } from "./cloudProviders";

function CloudFileMeta({ file }: { file: CloudEntry }) {
  const language = useStore((state) => state.language);
  const modifiedAt =
    file.modifiedAt === null
      ? null
      : formatTimestamp(file.modifiedAt, language);

  const size = file.size === null ? null : formatFileSize(file.size, language);

  if (modifiedAt === null && size === null) {
    return null;
  }

  return (
    <span className="cloud-browser-file-meta">
      {modifiedAt !== null && (
        <span className="cloud-browser-file-date">{modifiedAt}</span>
      )}

      {size !== null && <span className="cloud-browser-file-size">{size}</span>}
    </span>
  );
}

function CloudFolderRow({ folder }: { folder: CloudEntry }) {
  const t = useTranslation();
  const openCloudFolder = useStore((state) => state.openCloudFolder);

  return (
    <div className="cloud-browser-row">
      <button
        className="cloud-browser-row-main"
        onClick={() => openCloudFolder(folder)}
        title={t.cloudModal.openFolderAction(folder.name)}
      >
        <FolderFill className="icon-md cloud-browser-row-icon" />
        <span className="cloud-browser-row-text">
          <span className="cloud-browser-row-name">{folder.name}</span>
        </span>
      </button>
    </div>
  );
}

function CloudFileRow({ file }: { file: CloudEntry }) {
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

        <div className="cloud-browser-row-actions">
          <button
            className="btn btn-flat-icon"
            onClick={commitRename}
            disabled={!draft.trim()}
            title={t.cloudModal.saveName}
          >
            <CheckIcon className="icon-md icon-bold" />
          </button>

          <button
            className="btn btn-flat-icon"
            onClick={() => setDraft(null)}
            title={t.cloudModal.cancelRename}
          >
            <XIcon className="icon-md icon-bold" />
          </button>
        </div>
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

      <div className="cloud-browser-row-actions">
        <button
          className="btn btn-flat-icon"
          onClick={() => setDraft(stripJsonExtension(file.name))}
          title={t.cloudModal.renameAction(file.name)}
        >
          <PencilIcon className="icon-md icon-bold" />
        </button>

        <button
          className="btn btn-danger btn-icon"
          onClick={() => void deleteCloudFile(file)}
          title={t.cloudModal.deleteAction(file.name)}
        >
          <TrashIcon className="icon-md icon-bold" />
        </button>
      </div>
    </div>
  );
}

function CloudPathBar({ allowCreateFolder }: { allowCreateFolder: boolean }) {
  const t = useTranslation();
  const path = useStore((state) => state.cloudPath);
  const historyIndex = useStore((state) => state.cloudHistoryIndex);
  const historyLength = useStore((state) => state.cloudHistory.length);
  const loading = useStore((state) => state.cloudLoading);
  const navigateCloudHistory = useStore((state) => state.navigateCloudHistory);
  const navigateCloudToDepth = useStore((state) => state.navigateCloudToDepth);
  const refreshCloudEntries = useStore((state) => state.refreshCloudEntries);
  const createCloudFolder = useStore((state) => state.createCloudFolder);

  // A non-null draft means the new-folder form is open
  const [draft, setDraft] = useState<string | null>(null);

  const commitFolder = () => {
    if (draft === null || !draft.trim()) {
      return;
    }

    void createCloudFolder(draft);
    setDraft(null);
  };

  return (
    <>
      <div className="cloud-browser-path-bar">
        <button
          className="btn btn-flat-icon"
          onClick={() => navigateCloudHistory(HistoryDirection.BACK)}
          disabled={loading || historyIndex === 0}
          title={t.cloudModal.navigateBack}
        >
          <ArrowLeft className="icon-md icon-semibold" />
        </button>

        <button
          className="btn btn-flat-icon"
          onClick={() => navigateCloudHistory(HistoryDirection.FORWARD)}
          disabled={loading || historyIndex >= historyLength - 1}
          title={t.cloudModal.navigateForward}
        >
          <ArrowRight className="icon-md icon-semibold" />
        </button>

        <nav className="cloud-browser-path">
          <button
            className="cloud-browser-crumb"
            onClick={() => navigateCloudToDepth(0)}
            disabled={path.length === 0}
            title={t.cloudModal.openFolderAction(
              CloudSyncConfig.APP_FOLDER_NAME,
            )}
          >
            {CloudSyncConfig.APP_FOLDER_NAME}
          </button>

          {path.map((folder, index) => (
            <Fragment key={folder.id}>
              <ChevronRight className="cloud-browser-crumb-separator" />
              <button
                className="cloud-browser-crumb"
                onClick={() => navigateCloudToDepth(index + 1)}
                disabled={index === path.length - 1}
                title={t.cloudModal.openFolderAction(folder.name)}
              >
                {folder.name}
              </button>
            </Fragment>
          ))}
        </nav>

        {allowCreateFolder && (
          <button
            className="btn btn-flat-icon"
            onClick={() => setDraft("")}
            disabled={loading || draft !== null}
            title={t.cloudModal.newFolder}
          >
            <FolderPlus className="icon-md icon-semibold" />
          </button>
        )}

        <button
          className="btn btn-flat-icon"
          onClick={() => void refreshCloudEntries()}
          disabled={loading}
          title={t.cloudModal.refresh}
        >
          <ArrowClockwise
            id="refresh-cloud-files-icon"
            className="icon-md icon-semibold"
          />
        </button>
      </div>

      {draft !== null && (
        <div className="cloud-browser-new-folder">
          <FolderFill className="icon-md cloud-browser-row-icon" />
          <FilenameInput
            value={draft}
            size={FilenameInputSize.COMPACT}
            autoFocus
            placeholder={t.cloudModal.folderNamePlaceholder}
            onChange={setDraft}
            onSubmit={commitFolder}
            onCancel={() => setDraft(null)}
          />

          <div className="cloud-browser-row-actions">
            <button
              className="btn btn-flat-icon"
              onClick={commitFolder}
              disabled={!draft.trim()}
              title={t.cloudModal.createFolder}
            >
              <CheckIcon className="icon-md icon-bold" />
            </button>

            <button
              className="btn btn-flat-icon"
              onClick={() => setDraft(null)}
              title={t.cloudModal.cancelNewFolder}
            >
              <XIcon className="icon-md icon-bold" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface CloudBrowserProps {
  showFiles?: boolean;
  allowCreateFolder?: boolean;
}

export function CloudBrowser({
  showFiles = false,
  allowCreateFolder = false,
}: CloudBrowserProps) {
  const t = useTranslation();
  const provider = useStore((state) => state.cloudProvider);
  const signedIn = useStore((state) => state.cloudSignedIn);
  const accountLabel = useStore((state) => state.cloudAccountLabel);
  const entries = useStore((state) => state.cloudEntries);
  const loading = useStore((state) => state.cloudLoading);
  const error = useStore((state) => state.cloudError);
  const signInToCloud = useStore((state) => state.signInToCloud);
  const signOutOfCloud = useStore((state) => state.signOutOfCloud);

  const ProviderIcon = PROVIDER_ICON[provider];
  const signInLabel =
    provider === CloudProvider.SHAREPOINT
      ? t.cloudModal.signInSharePoint
      : t.cloudModal.signInGoogleDrive;

  const visible = showFiles
    ? entries
    : entries.filter((entry) => entry.isFolder);

  const emptyMessage = showFiles
    ? t.cloudModal.emptyFiles
    : t.cloudModal.emptyFolders;

  return (
    <>
      {!signedIn && (
        <button
          className="btn btn-lg btn-primary signin-button"
          onClick={() => void signInToCloud()}
          disabled={loading}
        >
          <ProviderIcon className="icon-md" />
          {signInLabel}
        </button>
      )}

      {signedIn && (
        <>
          <div className="cloud-browser-account">
            <span>{t.cloudModal.signedInAs(accountLabel ?? "")}</span>
            <button
              className="btn btn-danger"
              onClick={() => void signOutOfCloud()}
            >
              {t.cloudModal.signOut}
            </button>
          </div>

          <CloudPathBar allowCreateFolder={allowCreateFolder} />

          <div className="cloud-browser-entries modal-scrollable-body">
            {loading && (
              <p className="cloud-browser-empty">{t.cloudModal.loading}</p>
            )}

            {!loading && visible.length === 0 && (
              <p className="cloud-browser-empty">{emptyMessage}</p>
            )}

            {!loading &&
              visible.map((entry) =>
                entry.isFolder ? (
                  <CloudFolderRow key={entry.id} folder={entry} />
                ) : (
                  <CloudFileRow key={entry.id} file={entry} />
                ),
              )}
          </div>
        </>
      )}

      {error && <p className="cloud-browser-error">{error}</p>}
    </>
  );
}
