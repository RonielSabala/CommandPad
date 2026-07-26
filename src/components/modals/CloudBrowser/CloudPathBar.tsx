import { CloudSyncConfig } from "@/common/config";
import { HistoryDirection } from "@/common/enums";
import {
  FilenameInput,
  FilenameInputSize,
} from "@/components/common/FilenameInput";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { Fragment, useState } from "react";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FolderFill,
  FolderPlus,
} from "react-bootstrap-icons";
import "./CloudPathBar.css";
import { CloudRowConfirmActions } from "./CloudRowConfirmActions";

export function CloudPathBar({
  allowCreateFolder,
}: {
  allowCreateFolder: boolean;
}) {
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
            className={classNames(
              "icon-md icon-semibold",
              loading && "is-refreshing",
            )}
          />
        </button>
      </div>

      {draft !== null && (
        <div className="cloud-path-bar-new-folder">
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

          <CloudRowConfirmActions
            onConfirm={commitFolder}
            onCancel={() => setDraft(null)}
            confirmDisabled={!draft.trim()}
            confirmTitle={t.cloudModal.createFolder}
            cancelTitle={t.cloudModal.cancelNewFolder}
          />
        </div>
      )}
    </>
  );
}
