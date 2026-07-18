import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

export function LanguageDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.language.intro} />
      <Prose text={t.docs.language.detection} />
    </>
  );
}
