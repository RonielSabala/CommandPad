import type { CloudProvider } from "@/common/enums";
import { useTranslation } from "@/i18n";
import type { CloudFolderRef } from "@/services/cloud";
import { useStore } from "@/store/store";
import { useEffect } from "react";
import { CloudBrowser } from "./CloudBrowser";
import "./CloudFolderPicker.css";

interface CloudFolderPickerProps {
  provider: CloudProvider;
  initialPath: CloudFolderRef[];
  onCancel: () => void;
  onSelect: (path: CloudFolderRef[]) => void;
}

export function CloudFolderPicker({
  provider,
  initialPath,
  onCancel,
  onSelect,
}: CloudFolderPickerProps) {
  const t = useTranslation();
  const path = useStore((state) => state.cloudPath);
  const signedIn = useStore((state) => state.cloudSignedIn);
  const loading = useStore((state) => state.cloudLoading);
  const startCloudBrowse = useStore((state) => state.startCloudBrowse);

  useEffect(() => {
    void startCloudBrowse(provider, initialPath);
  }, [provider, initialPath, startCloudBrowse]);

  return (
    <>
      <CloudBrowser allowCreateFolder />

      <div className="modal-actions">
        <button className="btn btn-lg" onClick={onCancel}>
          {t.common.cancel}
        </button>

        <div className="vertical-divider" />

        <button
          className="btn btn-lg btn-primary"
          onClick={() => onSelect(path)}
          disabled={!signedIn || loading}
        >
          {t.exportModal.selectFolder}
        </button>
      </div>
    </>
  );
}
