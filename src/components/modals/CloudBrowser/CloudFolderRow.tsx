import { useTranslation } from "@/i18n";
import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { FolderFill } from "react-bootstrap-icons";
import { CloudEntryRow } from "./CloudEntryRow";

export function CloudFolderRow({ folder }: { folder: CloudEntry }) {
  const t = useTranslation();
  const openCloudFolder = useStore((state) => state.openCloudFolder);

  return (
    <CloudEntryRow
      entry={folder}
      icon={FolderFill}
      activateTitle={t.cloudModal.openFolderAction(folder.name)}
      onActivate={() => openCloudFolder(folder)}
    />
  );
}
