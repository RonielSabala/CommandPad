import { EXPORT_SUCCESS_TIMEOUT_MS } from "@/common/config";
import {
  CloudExportStatus,
  ExportFormat,
  SyncDestination,
} from "@/common/enums";
import { FilenameInput } from "@/components/common/FilenameInput";
import { useTranslation } from "@/i18n";
import type { CloudFolderRef } from "@/services/cloud";
import { getActiveTab, useStore } from "@/store/store";
import { getExportBasename } from "@/utils/export";
import { formatCloudPath } from "@/utils/format";
import { classNames } from "@/utils/string";
import { useEffect, useState } from "react";
import {
  ArrowRepeat,
  CheckCircleFill,
  ExclamationTriangleFill,
  FolderFill,
  LaptopFill,
} from "react-bootstrap-icons";
import { CloudFolderPicker } from "./CloudFolderPicker";
import { PROVIDER_ICON, PROVIDER_NAME, PROVIDERS } from "./cloudProviders";
import "./ExportModal.css";
import { Modal } from "./Modal";

const FORMATS: readonly ExportFormat[] = [
  ExportFormat.JSON,
  ExportFormat.MD,
  ExportFormat.TXT,
];

const ROOT_FOLDER_PATH: CloudFolderRef[] = [];

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
          <ArrowRepeat className="icon-lg cloud-export-spinner" />
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
  const label = useStore((state) => getActiveTab(state)?.label ?? "");
  const lastDestination = useStore((state) => state.lastExportDestination);
  const lastFormat = useStore((state) => state.lastExportFormat);
  const cloudExportStatus = useStore((state) => state.cloudExportStatus);
  const isExporting = cloudExportStatus !== CloudExportStatus.IDLE;
  const [destination, setDestination] = useState<SyncDestination>(
    SyncDestination.LOCAL,
  );

  const [format, setFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [filename, setFilename] = useState("");
  const [pickingFolder, setPickingFolder] = useState(false);
  const [folderPath, setFolderPath] =
    useState<CloudFolderRef[]>(ROOT_FOLDER_PATH);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDestination(lastDestination);
    setFormat(lastFormat);
    setFilename(getExportBasename(label));
    setFolderPath(ROOT_FOLDER_PATH);
    setPickingFolder(false);
  }, [isOpen, label, lastDestination, lastFormat]);

  const trimmed = filename.trim();
  const canExport = trimmed.length > 0;
  const isCloud = destination !== SyncDestination.LOCAL;
  const isBrowsingCloud = !isExporting && pickingFolder && isCloud;

  const chooseDestination = (next: SyncDestination) => {
    setDestination(next);
    setFolderPath(ROOT_FOLDER_PATH);
  };

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
      <p className="modal-title">{t.exportModal.title}</p>

      {isExporting && <CloudExportStatusView onDone={onClose} />}

      {isBrowsingCloud && (
        <CloudFolderPicker
          provider={destination}
          initialPath={folderPath}
          onCancel={() => setPickingFolder(false)}
          onSelect={(path) => {
            setFolderPath(path);
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
                onClick={() => chooseDestination(SyncDestination.LOCAL)}
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
                    onClick={() => chooseDestination(provider)}
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
                  onClick={() => setFormat(option)}
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
              onChange={setFilename}
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
