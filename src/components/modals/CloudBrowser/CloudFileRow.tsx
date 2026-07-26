import { useTranslation } from "@/i18n";
import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { FiletypeJson } from "react-bootstrap-icons";
import { CloudEntryRow } from "./CloudEntryRow";
import { CloudFileMeta } from "./CloudFileMeta";

export function CloudFileRow({ file }: { file: CloudEntry }) {
  const t = useTranslation();
  const importRunbookFromCloud = useStore(
    (state) => state.importRunbookFromCloud,
  );

  return (
    <CloudEntryRow
      entry={file}
      icon={FiletypeJson}
      activateTitle={t.cloudModal.importAction(file.name)}
      onActivate={() => void importRunbookFromCloud(file)}
      meta={<CloudFileMeta file={file} />}
    />
  );
}
