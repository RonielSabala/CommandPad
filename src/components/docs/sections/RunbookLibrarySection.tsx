import { useTranslation } from "@/i18n";
import { DemoRunbookRows } from "../demos/DemoRunbookRows";
import { Prose, ProseList } from "../Prose";

export function RunbookLibraryDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.runbookLibrary.intro} />
      <ProseList items={t.docs.runbookLibrary.items} />
      <DemoRunbookRows />
      <Prose text={t.docs.runbookLibrary.autoLabel} />
      <Prose text={t.docs.runbookLibrary.labelDetails} />
      <Prose text={t.docs.runbookLibrary.autoSave} />
    </>
  );
}
