import { CssClass } from "@/common/constants/css";
import type { CloudProvider } from "@/common/enums";
import { useTranslation } from "@/i18n";
import type { CloudFolderRef } from "@/services/cloud";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect } from "react";

import { CloudBrowser } from "./CloudBrowser";

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
      <CloudBrowser />

      <div className="modal-actions">
        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          onClick={onCancel}
        >
          {t.common.cancel}
        </button>

        <div className={CssClass.VERTICAL_DIVIDER} />

        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_PRIMARY,
          )}
          onClick={() => onSelect(path)}
          disabled={!signedIn || loading}
        >
          {t.exportModal.selectFolder}
        </button>
      </div>
    </>
  );
}
