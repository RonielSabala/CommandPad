import { useTranslation } from "@/i18n";
import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { FolderFill } from "react-bootstrap-icons";

export function CloudFolderRow({ folder }: { folder: CloudEntry }) {
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
