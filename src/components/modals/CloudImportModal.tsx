import { CloudProvider, ExportFormat } from "@/common/enums";
import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import type { CloudFile } from "@/services/cloud";
import { useStore } from "@/store/store";
import { stripJsonExtension } from "@/utils/export";
import { formatFileSize, formatTimestamp } from "@/utils/format";
import { useState } from "react";
import { ArrowClockwise, ArrowLeft } from "react-bootstrap-icons";
import "./CloudImportModal.css";
import { PROVIDER_ICON } from "./cloudProviders";
import { Modal } from "./Modal";

function CloudFileMeta({ file }: { file: CloudFile }) {
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
    <span className="cloud-modal-file-meta">
      {modifiedAt !== null && (
        <span className="cloud-modal-file-date">{modifiedAt}</span>
      )}

      {size !== null && <span className="cloud-modal-file-size">{size}</span>}
    </span>
  );
}

function CloudFileRow({ file }: { file: CloudFile }) {
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
      <div className="cloud-modal-file-row">
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

        <div className="cloud-modal-file-actions">
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
    <div className="cloud-modal-file-row">
      <button
        className="cloud-modal-file-main"
        onClick={() => void importRunbookFromCloud(file)}
        title={t.cloudModal.importAction(file.name)}
      >
        <span className="cloud-modal-file-name">{file.name}</span>
        <CloudFileMeta file={file} />
      </button>

      <div className="cloud-modal-file-actions">
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

export function CloudImportModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.cloudImportModalOpen);
  const provider = useStore((state) => state.cloudProvider);
  const signedIn = useStore((state) => state.cloudSignedIn);
  const accountLabel = useStore((state) => state.cloudAccountLabel);
  const files = useStore((state) => state.cloudFiles);
  const loading = useStore((state) => state.cloudLoading);
  const error = useStore((state) => state.cloudError);

  const closeCloudImportModal = useStore(
    (state) => state.closeCloudImportModal,
  );
  const returnToDestinationModal = useStore(
    (state) => state.returnToDestinationModal,
  );

  const signInToCloud = useStore((state) => state.signInToCloud);
  const signOutOfCloud = useStore((state) => state.signOutOfCloud);
  const refreshCloudFiles = useStore((state) => state.refreshCloudFiles);

  const ProviderIcon = PROVIDER_ICON[provider];
  const signInLabel =
    provider === CloudProvider.SHAREPOINT
      ? t.cloudModal.signInSharePoint
      : t.cloudModal.signInGoogleDrive;

  return (
    <Modal open={isOpen} onClose={closeCloudImportModal}>
      <p className="modal-title">{t.cloudModal.importTitle}</p>

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
          <div className="cloud-modal-account">
            <span>{t.cloudModal.signedInAs(accountLabel ?? "")}</span>
            <button
              className="btn btn-danger"
              onClick={() => void signOutOfCloud()}
            >
              {t.cloudModal.signOut}
            </button>
          </div>

          <div className="cloud-modal-files-header">
            <button
              className="btn btn-flat-icon"
              onClick={() => void refreshCloudFiles()}
              disabled={loading}
              title={t.cloudModal.refresh}
            >
              <ArrowClockwise
                id="refresh-cloud-files-icon"
                className="icon-md icon-semibold"
              />
            </button>
          </div>

          <div className="cloud-modal-files modal-scrollable-body">
            {loading && (
              <p className="cloud-modal-empty">{t.cloudModal.loading}</p>
            )}
            {!loading && files.length === 0 && (
              <p className="cloud-modal-empty">{t.cloudModal.emptyFiles}</p>
            )}
            {!loading &&
              files.map((file) => <CloudFileRow key={file.id} file={file} />)}
          </div>
        </>
      )}

      {error && <p className="cloud-modal-error">{error}</p>}

      <div className="modal-actions">
        <button
          className="btn btn-lg"
          onClick={returnToDestinationModal}
          title={t.destinationModal.title}
        >
          <ArrowLeft className="icon-md icon-semibold" />
          {t.common.back}
        </button>

        <button className="btn btn-lg" onClick={closeCloudImportModal}>
          {t.common.close}
        </button>
      </div>
    </Modal>
  );
}
