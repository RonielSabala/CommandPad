import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

export function GettingStartedDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.gettingStarted.intro} />
      <Prose text={t.docs.gettingStarted.journey} />
      <Prose text={t.docs.gettingStarted.navigate} />
      <Prose text={t.docs.gettingStarted.tryIt} />
    </>
  );
}
