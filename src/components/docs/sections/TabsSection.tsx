import { useTranslation } from "@/i18n";
import { DemoTabs } from "../demos/DemoTabs";
import { Prose, ProseList } from "../Prose";

export function TabsDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.tabs.intro} />
      <ProseList items={t.docs.tabs.items} />
      <Prose text={t.docs.tabs.labelDemo} />
      <DemoTabs />
    </>
  );
}
