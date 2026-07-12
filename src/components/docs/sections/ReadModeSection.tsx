import { useTranslation } from "@/i18n";
import { Prose, ProseList } from "../Prose";

export function ReadModeDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.readMode.intro} />
      <ProseList items={t.docs.readMode.rules} />
      <Prose text={t.docs.readMode.persisted} />
      <Prose text={t.docs.readMode.exit} />
    </>
  );
}
