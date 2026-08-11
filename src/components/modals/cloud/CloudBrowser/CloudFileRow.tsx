import { useTranslation } from "@/i18n";
import type { CloudEntry, CloudFolderRef } from "@/services/cloud";
import { useStore } from "@/store/store";
import { FileEarmark } from "react-bootstrap-icons";

import { CloudEntryRow } from "./CloudEntryRow";

interface CloudFileRowProps {
  file: CloudEntry;
  path?: CloudFolderRef[];
}

export function CloudFileRow({ file, path }: CloudFileRowProps) {
  const t = useTranslation();
  const openCloudFileEditor = useStore((state) => state.openCloudFileEditor);
  const importRunbooksFromCloud = useStore(
    (state) => state.importRunbooksFromCloud,
  );

  return (
    <CloudEntryRow
      entry={file}
      icon={FileEarmark}
      activateTitle={t.cloudModal.importAction(file.name)}
      onActivate={() => void importRunbooksFromCloud([file])}
      onEdit={() => void openCloudFileEditor(file)}
      path={path}
    />
  );
}
