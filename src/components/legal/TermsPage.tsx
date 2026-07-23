import { useTranslation } from "@/i18n";
import { LegalPage } from "./LegalPage";

export function TermsPage() {
  const t = useTranslation();
  return <LegalPage content={t.terms} />;
}
