import { CloudProvider } from "@/common/enums";
import { useTranslation } from "@/i18n";
import type { CloudFile } from "@/services/cloud";
import { useStore } from "@/store/store";
import { ArrowClockwise, CloudArrowDownFill } from "react-bootstrap-icons";
import "./CloudImportModal.css";
import { PROVIDER_ICON } from "./cloudProviders";
import { Modal } from "./Modal";

function CloudFileRow({
  file,
  onImport,
}: {
  file: CloudFile;
  onImport: (file: CloudFile) => void;
}) {
  const t = useTranslation();
  return (
    <button
      className="cloud-modal-file-row"
      onClick={() => onImport(file)}
      title={t.cloudModal.importAction(file.name)}
    >
      <span className="cloud-modal-file-name">{file.name}</span>
      <CloudArrowDownFill className="icon-md" />
    </button>
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
  const signInToCloud = useStore((state) => state.signInToCloud);
  const signOutOfCloud = useStore((state) => state.signOutOfCloud);
  const refreshCloudFiles = useStore((state) => state.refreshCloudFiles);
  const importRunbookFromCloud = useStore(
    (state) => state.importRunbookFromCloud,
  );

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
          className="btn btn-lg btn-primary"
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
              <ArrowClockwise className="icon-md" />
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
              files.map((file) => (
                <CloudFileRow
                  key={file.id}
                  file={file}
                  onImport={(f) => void importRunbookFromCloud(f)}
                />
              ))}
          </div>
        </>
      )}

      {error && <p className="cloud-modal-error">{error}</p>}

      <div className="modal-actions">
        <button className="btn btn-lg" onClick={closeCloudImportModal}>
          {t.common.close}
        </button>
      </div>
    </Modal>
  );
}
