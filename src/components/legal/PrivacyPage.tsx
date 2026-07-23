import { useTranslation } from "@/i18n";
import { LegalPage } from "./LegalPage";

export function PrivacyPage() {
  const t = useTranslation();
  return <LegalPage content={t.privacy} />;
}
