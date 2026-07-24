import { EXPORT_SUCCESS_TIMEOUT_MS } from "@/common/config";
import { Key } from "@/common/constants/events";
import {
  CloudExportStatus,
  ExportFormat,
  SyncDestination,
} from "@/common/enums";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { getExportBasename } from "@/utils/export";
import { classNames } from "@/utils/string";
import { useEffect, useState } from "react";
import {
  ArrowRepeat,
  CheckCircleFill,
  ExclamationTriangleFill,
  LaptopFill,
} from "react-bootstrap-icons";
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDestination(lastDestination);
    setFormat(lastFormat);
    setFilename(getExportBasename(label));
  }, [isOpen, label, lastDestination, lastFormat]);

  const trimmed = filename.trim();
  const canExport = trimmed.length > 0;

  const handleExport = () => {
    if (canExport) {
      void exportRunbook(destination, format, trimmed);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <p className="modal-title">{t.exportModal.title}</p>

      {isExporting ? (
        <CloudExportStatusView onDone={onClose} />
      ) : (
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
                onClick={() => setDestination(SyncDestination.LOCAL)}
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
                    onClick={() => setDestination(provider)}
                  >
                    <ProviderIcon className="icon-md" />
                    {PROVIDER_NAME[provider]}
                  </button>
                );
              })}
            </div>
          </div>

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

            <div className="export-modal-filename">
              <input
                id="export-filename"
                className="export-modal-filename-input"
                value={filename}
                spellCheck={false}
                autoComplete="off"
                onChange={(event) => setFilename(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === Key.ENTER) {
                    event.preventDefault();
                    handleExport();
                  }
                }}
              />

              <span className="export-modal-extension">.{format}</span>
            </div>
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
