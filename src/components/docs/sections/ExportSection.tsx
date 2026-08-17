import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

export function ExportDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.export.intro(t.header.export)} />
      <Prose text={t.docs.export.formats} />
      <Prose text={t.docs.export.saveDialog} />
      <Prose text={t.docs.export.copyMarkdown(t.contextMenu.copyMarkdown)} />
    </>
  );
}

export function CloudExportDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose
        text={t.docs.cloudExport.intro(t.header.export, t.runbooks.import)}
      />
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
      <Prose text={t.docs.cloudLinkedSync.syncBadge(t.runbooks.title)} />
      <Prose
        text={t.docs.cloudLinkedSync.stopSyncing(t.runbooks.stopSyncing)}
      />
    </>
  );
}

export function CloudFileManagementDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.cloudFileManagement.folders} />
      <Prose text={t.docs.cloudFileManagement.search} />
      <Prose
        text={t.docs.cloudFileManagement.actions(
          t.cloudModal.rename,
          t.cloudModal.edit,
          t.cloudModal.duplicate(1),
          t.cloudModal.download(1),
          t.cloudModal.delete(1),
        )}
      />
      <Prose text={t.docs.cloudFileManagement.multiSelect} />
      <Prose text={t.docs.cloudFileManagement.bulkActions} />
      <Prose text={t.docs.cloudFileManagement.editFile} />
      <Prose text={t.docs.cloudFileManagement.recycleBin} />
    </>
  );
}
