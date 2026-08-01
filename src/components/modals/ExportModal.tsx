import { EXPORT_SUCCESS_TIMEOUT_MS } from "@/common/config";
import {
  CloudExportStatus,
  ExportFormat,
  SyncDestination,
} from "@/common/enums";
import { FilenameInput } from "@/components/common/FilenameInput";
import { Spinner } from "@/components/common/Spinner";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { formatCloudPath } from "@/utils/format";
import { classNames } from "@/utils/string";
import { useEffect, useState } from "react";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  FolderFill,
  LaptopFill,
} from "react-bootstrap-icons";
import { CloudFolderPicker } from "./CloudFolderPicker";
import { CloudModalTitle } from "./CloudModalTitle";
import { PROVIDER_ICON, PROVIDER_NAME, PROVIDERS } from "./cloudProviders";
import "./ExportModal.css";
import { Modal } from "./Modal";

const FORMATS: readonly ExportFormat[] = [
  ExportFormat.JSON,
  ExportFormat.MD,
  ExportFormat.TXT,
];

function CloudExportStatusView({ onDone }: { onDone: () => void }) {
  const t = useTranslation();
  const status = useStore((state) => state.cloudExportStatus);
  const provider = useStore((state) => state.cloudExportProvider);
  const closeExportModal = useStore((state) => state.closeExportModal);
  const resetCloudExportStatus = useStore(
    (state) => state.resetCloudExportStatus,
  );

  const providerName = provider ? PROVIDER_NAME[provider] : "";

  useEffect(() => {
    if (status !== CloudExportStatus.SUCCESS) {
      return;
    }

    const timer = setTimeout(onDone, EXPORT_SUCCESS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status, onDone]);

  return (
    <div
      className={classNames("cloud-export-status", `is-${status}`)}
      role="status"
      aria-live="polite"
    >
      {status === CloudExportStatus.UPLOADING && (
        <>
          <Spinner className="cloud-export-spinner" />
          <p className="cloud-export-status-text">
            {t.exportModal.savingTo(providerName)}
          </p>
        </>
      )}

      {status === CloudExportStatus.SUCCESS && (
        <>
          <CheckCircleFill className="icon-lg cloud-export-icon-success" />
          <p className="cloud-export-status-text">
            {t.exportModal.savedTo(providerName)}
          </p>
        </>
      )}

      {status === CloudExportStatus.ERROR && (
        <>
          <ExclamationTriangleFill className="icon-lg cloud-export-icon-error" />
          <p className="cloud-export-status-text">
            {t.exportModal.exportError}
          </p>
          <div className="modal-actions">
            <button className="btn btn-lg" onClick={closeExportModal}>
              {t.common.close}
            </button>
            <button
              className="btn btn-lg btn-primary"
              onClick={resetCloudExportStatus}
            >
              {t.exportModal.tryAgain}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ExportModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.exportModalOpen);
  const onClose = useStore((state) => state.closeExportModal);
  const exportRunbook = useStore((state) => state.exportRunbook);

  const destination = useStore((state) => state.lastExportDestination);
  const folderPath = useStore((state) => state.lastExportFolderPath);
  const format = useStore((state) => state.lastExportFormat);
  const filename = useStore((state) => state.lastExportFilename);

  const setExportDestination = useStore((state) => state.setExportDestination);
  const setExportFolderPath = useStore((state) => state.setExportFolderPath);
  const setExportFormat = useStore((state) => state.setExportFormat);
  const setExportFilename = useStore((state) => state.setExportFilename);

  const cloudExportStatus = useStore((state) => state.cloudExportStatus);
  const isExporting = cloudExportStatus !== CloudExportStatus.IDLE;
  const [pickingFolder, setPickingFolder] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPickingFolder(false);
  }, [isOpen]);

  const trimmed = filename.trim();
  const canExport = trimmed.length > 0;
  const isCloud = destination !== SyncDestination.LOCAL;
  const isBrowsingCloud = !isExporting && pickingFolder && isCloud;

  const handleExport = () => {
    if (canExport) {
      void exportRunbook(
        destination,
        format,
        trimmed,
        folderPath.at(-1)?.id ?? null,
      );
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className={classNames(isBrowsingCloud && "modal-cloud")}
    >
      {isBrowsingCloud ? (
        <CloudModalTitle
          message={t.exportModal.cloudTitle}
          provider={destination}
          onChange={setExportDestination}
        />
      ) : (
        <p className="modal-title">{t.exportModal.title}</p>
      )}

      {isExporting && <CloudExportStatusView onDone={onClose} />}

      {isBrowsingCloud && (
        <CloudFolderPicker
          provider={destination}
          initialPath={folderPath}
          onCancel={() => setPickingFolder(false)}
          onSelect={(path) => {
            setExportFolderPath(path);
            setPickingFolder(false);
          }}
        />
      )}

      {!isExporting && !pickingFolder && (
        <>
          <div className="export-modal-field">
            <p className="export-modal-label">
              {t.exportModal.destinationLabel}
            </p>
            <div className="export-modal-options">
              <button
                className={classNames(
                  "export-modal-option",
                  destination === SyncDestination.LOCAL && "is-selected",
                )}
                onClick={() => setExportDestination(SyncDestination.LOCAL)}
              >
                <LaptopFill className="icon-md" />
                {t.destinationModal.local}
              </button>

              {PROVIDERS.map((provider) => {
                const ProviderIcon = PROVIDER_ICON[provider];
                return (
                  <button
                    key={provider}
                    className={classNames(
                      "export-modal-option",
                      destination === provider && "is-selected",
                    )}
                    onClick={() => setExportDestination(provider)}
                  >
                    <ProviderIcon className="icon-md" />
                    {PROVIDER_NAME[provider]}
                  </button>
                );
              })}
            </div>
          </div>

          {isCloud && (
            <div className="export-modal-field">
              <p className="export-modal-label">{t.exportModal.folderLabel}</p>

              <button
                className="export-modal-folder"
                onClick={() => setPickingFolder(true)}
                title={t.exportModal.chooseFolder}
              >
                <FolderFill className="icon-md" />
                <span className="export-modal-folder-path">
                  {formatCloudPath(folderPath)}
                </span>
                <span className="export-modal-folder-change">
                  {t.exportModal.changeFolder}
                </span>
              </button>
            </div>
          )}

          <div className="export-modal-field">
            <p className="export-modal-label">{t.exportModal.formatLabel}</p>
            <div className="export-modal-options">
              {FORMATS.map((option) => (
                <button
                  key={option}
                  className={classNames(
                    "export-modal-option",
                    format === option && "is-selected",
                  )}
                  onClick={() => setExportFormat(option)}
                >
                  .{option}
                </button>
              ))}
            </div>
          </div>

          <div className="export-modal-field">
            <label className="export-modal-label" htmlFor="export-filename">
              {t.exportModal.filenameLabel}
            </label>

            <FilenameInput
              id="export-filename"
              value={filename}
              extension={format}
              onChange={setExportFilename}
              onSubmit={handleExport}
            />
          </div>

          <div className="modal-actions">
            <button className="btn btn-lg" onClick={onClose}>
              {t.common.cancel}
            </button>

            <div className="vertical-divider" />

            <button
              className="btn btn-lg btn-primary"
              onClick={handleExport}
              disabled={!canExport}
            >
              {t.exportModal.confirm}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
