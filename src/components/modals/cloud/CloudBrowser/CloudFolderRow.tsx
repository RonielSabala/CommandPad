import { useTranslation } from "@/i18n";
import type { CloudEntry, CloudFolderRef } from "@/services/cloud";
import { useStoreActions } from "@/store/store";
import { FolderFill } from "react-bootstrap-icons";

import { CloudEntryRow } from "./CloudEntryRow";

interface CloudFolderRowProps {
  folder: CloudEntry;
  path?: CloudFolderRef[];
}

export function CloudFolderRow({ folder, path }: CloudFolderRowProps) {
  const t = useTranslation();
  const { openCloudFolder, navigateCloudToPath } = useStoreActions();

  return (
    <CloudEntryRow
      entry={folder}
      icon={FolderFill}
      activateTitle={t.cloudModal.openFolderAction(folder.name)}
      onActivate={() =>
        path === undefined
          ? openCloudFolder(folder)
          : navigateCloudToPath([...path, { id: folder.id, name: folder.name }])
      }
      path={path}
    />
  );
}
