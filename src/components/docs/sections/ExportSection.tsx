import { useTranslation } from "@/i18n";
import { Prose, ProseList } from "../Prose";

export function ExportDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.export.intro} />
      <ProseList items={t.docs.export.formats} />
      <Prose text={t.docs.export.saveDialog} />
      <Prose text={t.docs.export.copyMarkdown} />
    </>
  );
}

export function CloudExportDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.cloudExport.intro} />
      <Prose text={t.docs.cloudExport.switchProvider} />
      <Prose text={t.docs.cloudExport.overwrite} />
    </>
  );
}

export function CloudLinkedSyncDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.cloudLinkedSync.intro} />
      <Prose text={t.docs.cloudLinkedSync.syncBadge} />
      <Prose text={t.docs.cloudLinkedSync.stopSyncing} />
    </>
  );
}

export function CloudFileManagementDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.cloudFileManagement.folders} />
      <Prose text={t.docs.cloudFileManagement.search} />
      <Prose text={t.docs.cloudFileManagement.actions} />
      <Prose text={t.docs.cloudFileManagement.editFile} />
      <Prose text={t.docs.cloudFileManagement.recycleBin} />
    </>
  );
}
