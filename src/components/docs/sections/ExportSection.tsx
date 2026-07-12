import { useTranslation } from "@/i18n";
import { Prose, ProseList } from "../Prose";

export function ExportDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.export.intro} />
      <ProseList items={t.docs.export.formats} />
      <Prose text={t.docs.export.saveDialog} />
    </>
  );
}
