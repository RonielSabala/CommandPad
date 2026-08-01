import { useTranslation } from "@/i18n";
import type { CloudEntry, CloudFolderRef } from "@/services/cloud";
import { useStore } from "@/store/store";
import { Braces } from "react-bootstrap-icons";
import { CloudEntryRow } from "./CloudEntryRow";

interface CloudFileRowProps {
  file: CloudEntry;
  path?: CloudFolderRef[];
}

export function CloudFileRow({ file, path }: CloudFileRowProps) {
  const t = useTranslation();
  const importRunbookFromCloud = useStore(
    (state) => state.importRunbookFromCloud,
  );
  const openCloudFileEditor = useStore((state) => state.openCloudFileEditor);

  return (
    <CloudEntryRow
      entry={file}
      icon={Braces}
      activateTitle={t.cloudModal.importAction(file.name)}
      onActivate={() => void importRunbookFromCloud(file)}
      onEdit={() => void openCloudFileEditor(file)}
      path={path}
    />
  );
}
