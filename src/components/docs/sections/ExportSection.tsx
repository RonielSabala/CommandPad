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

export function CloudSyncDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.cloudSync.intro} />
      <Prose text={t.docs.cloudSync.howItWorks} />
      <Prose text={t.docs.cloudSync.storage} />
      <Prose text={t.docs.cloudSync.setupNote} />
    </>
  );
}
