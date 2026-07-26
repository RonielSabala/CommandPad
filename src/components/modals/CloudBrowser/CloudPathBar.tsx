import { CloudSyncConfig } from "@/common/config";
import { HistoryDirection } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { Fragment } from "react";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FolderPlus,
} from "react-bootstrap-icons";
import "./CloudPathBar.css";

interface CloudPathBarProps {
  allowCreateFolder: boolean;
  creatingFolder: boolean;
  onStartNewFolder: () => void;
}

export function CloudPathBar({
  allowCreateFolder,
  creatingFolder,
  onStartNewFolder,
}: CloudPathBarProps) {
  const t = useTranslation();
  const path = useStore((state) => state.cloudPath);
  const historyIndex = useStore((state) => state.cloudHistoryIndex);
  const historyLength = useStore((state) => state.cloudHistory.length);
  const loading = useStore((state) => state.cloudLoading);

  const navigateCloudHistory = useStore((state) => state.navigateCloudHistory);
  const navigateCloudToDepth = useStore((state) => state.navigateCloudToDepth);
  const refreshCloudEntries = useStore((state) => state.refreshCloudEntries);

  return (
    <div className="cloud-browser-path-bar">
      <button
        className="btn btn-flat-icon"
        onClick={() => navigateCloudHistory(HistoryDirection.BACK)}
        disabled={historyIndex === 0}
        title={t.cloudModal.navigateBack}
      >
        <ArrowLeft className="icon-md icon-semibold" />
      </button>

      <button
        className="btn btn-flat-icon"
        onClick={() => navigateCloudHistory(HistoryDirection.FORWARD)}
        disabled={historyIndex >= historyLength - 1}
        title={t.cloudModal.navigateForward}
      >
        <ArrowRight className="icon-md icon-semibold" />
      </button>

      <nav className="cloud-browser-path">
        <button
          className="cloud-browser-crumb"
          onClick={() => navigateCloudToDepth(0)}
          disabled={path.length === 0}
          title={t.cloudModal.openFolderAction(CloudSyncConfig.APP_FOLDER_NAME)}
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
          onClick={onStartNewFolder}
          disabled={loading || creatingFolder}
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
          className={classNames(
            "icon-md icon-semibold",
            loading && "is-refreshing",
          )}
        />
      </button>
    </div>
  );
}
