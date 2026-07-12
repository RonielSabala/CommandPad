import { useTranslation } from "@/i18n";
import { Prose, ProseList } from "../Prose";

export function GettingStartedDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.gettingStarted.intro} />
      <Prose text={t.docs.gettingStarted.concept} />
      <ProseList items={t.docs.gettingStarted.features} />
    </>
  );
}
