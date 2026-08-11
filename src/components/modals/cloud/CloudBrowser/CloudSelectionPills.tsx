import { CloudSyncConfig } from "@/common/config";
import { XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { formatCloudPath } from "@/utils/format";
import { FileEarmark, FolderFill } from "react-bootstrap-icons";

import "./CloudSelectionPills.css";

interface Props {
  listedIds: Set<string>;
}

export function CloudSelectionPills({ listedIds }: Props) {
  const t = useTranslation();
  const selectedEntries = useStore((state) => state.cloudSelectedEntries);
  const toggleCloudSelected = useStore((state) => state.toggleCloudSelected);
  const clearCloudSelection = useStore((state) => state.clearCloudSelection);

  const allListed = [...selectedEntries.values()].every(({ entry }) =>
    listedIds.has(entry.id),
  );

  if (selectedEntries.size === 0 || allListed) {
    return null;
  }

  return (
    <div className="cloud-selection-pills">
      {[...selectedEntries.values()].map(({ entry, path }) => {
        const EntryIcon = entry.isFolder ? FolderFill : FileEarmark;
        const dropTitle = t.cloudModal.deselectRow(entry.name);

        return (
          <span
            className="cloud-selection-pill"
            key={entry.id}
            title={`${formatCloudPath(path)}${CloudSyncConfig.PATH_SEPARATOR}${entry.name}`}
          >
            <EntryIcon className="icon-sm cloud-selection-pill-icon" />

            <span className="cloud-selection-pill-name">{entry.name}</span>
            <button
              className="cloud-selection-pill-drop"
              title={dropTitle}
              aria-label={dropTitle}
              onClick={() => toggleCloudSelected(entry)}
            >
              <XIcon className="icon-sm icon-bold" />
            </button>
          </span>
        );
      })}

      <button className="cloud-selection-clear" onClick={clearCloudSelection}>
        {t.cloudModal.clearSelection}
      </button>
    </div>
  );
}
