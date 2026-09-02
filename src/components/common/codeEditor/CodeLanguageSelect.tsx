import {
  CODE_LANGUAGE_LABEL,
  COMMAND_LANGUAGE_ORDER,
} from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { Select, SelectAlign, type SelectOption } from "../Select";

import "./CodeLanguageSelect.css";

const LANGUAGE_OPTIONS: readonly SelectOption<CodeLanguage>[] =
  COMMAND_LANGUAGE_ORDER.map((language) => ({
    value: language,
    label: CODE_LANGUAGE_LABEL[language],
  }));

interface Props {
  language: CodeLanguage;
  onChange: (language: CodeLanguage) => void;
}

export function CodeLanguageSelect({ language: value, onChange }: Props) {
  const t = useTranslation();

  return (
    <Select
      triggerClassName="btn code-language-trigger"
      title={t.command.changeLanguage}
      align={SelectAlign.END}
      portal
      value={value}
      options={LANGUAGE_OPTIONS}
      onChange={onChange}
    >
      <span className="code-language-label">{CODE_LANGUAGE_LABEL[value]}</span>
    </Select>
  );
}
