import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

export function ReadModeDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.readMode.intro} />
      <Prose text={t.docs.readMode.rules} />
      <Prose text={t.docs.readMode.persisted} />
      <Prose text={t.docs.readMode.exit} />
    </>
  );
}
