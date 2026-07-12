import { useTranslation } from "@/i18n";
import { DemoMultiSelect } from "../demos/DemoMultiSelect";
import { Prose, ProseList } from "../Prose";

export function MultiSelectDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.multiSelect.intro} />
      <ProseList items={t.docs.multiSelect.actions} />
      <Prose text={t.docs.multiSelect.clear} />
      <Prose text={t.docs.multiSelect.demoHint} />
      <DemoMultiSelect />
    </>
  );
}
