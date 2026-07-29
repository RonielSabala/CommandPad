import { Select, type SelectOption } from "@/components/common/Select";
import { LanguageFlag } from "@/components/icons/flags";
import {
  LANGUAGE_LABELS,
  LANGUAGE_NAMES,
  LANGUAGE_ORDER,
  useTranslation,
  type Language,
} from "@/i18n";
import { useStore } from "@/store/store";
import { Translate } from "react-bootstrap-icons";
import "./LanguageSelect.css";

interface FlagCircleProps {
  language: Language;
}

function FlagCircle({ language }: FlagCircleProps) {
  return (
    <span className="language-flag" aria-hidden="true">
      <LanguageFlag language={language} />
    </span>
  );
}

const LANGUAGE_OPTIONS: readonly SelectOption<Language>[] = LANGUAGE_ORDER.map(
  (language) => ({
    value: language,
    label: (
      <>
        <FlagCircle language={language} />
        {LANGUAGE_NAMES[language]}
      </>
    ),
  }),
);

export function LanguageSelect() {
  const t = useTranslation();
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  return (
    <Select
      className="language-select"
      triggerClassName="btn btn-lg btn-flat-icon"
      title={t.header.changeLanguage}
      value={language}
      options={LANGUAGE_OPTIONS}
      onChange={setLanguage}
    >
      <FlagCircle language={language} />
      <span className="language-code">{LANGUAGE_LABELS[language]}</span>
      <Translate className="icon" />
    </Select>
  );
}
