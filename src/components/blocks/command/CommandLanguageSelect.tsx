import {
  CODE_LANGUAGE_LABEL,
  COMMAND_LANGUAGE_ORDER,
  DEFAULT_COMMAND_LANGUAGE,
} from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import {
  Select,
  SelectAlign,
  type SelectOption,
} from "@/components/common/Select";
import { useTranslation } from "@/i18n";

import "./CommandLanguageSelect.css";

const LANGUAGE_OPTIONS: readonly SelectOption<CodeLanguage>[] =
  COMMAND_LANGUAGE_ORDER.map((language) => ({
    value: language,
    label: CODE_LANGUAGE_LABEL[language],
  }));

interface Props {
  language: CodeLanguage | undefined;
  onChange: (language: CodeLanguage) => void;
}

export function CommandLanguageSelect({ language, onChange }: Props) {
  const t = useTranslation();
  const value = language ?? DEFAULT_COMMAND_LANGUAGE;

  return (
    <Select
      triggerClassName="btn command-language-trigger"
      title={t.command.changeLanguage}
      align={SelectAlign.END}
      portal
      value={value}
      options={LANGUAGE_OPTIONS}
      onChange={onChange}
    >
      <span className="command-language-label">
        {CODE_LANGUAGE_LABEL[value]}
      </span>
    </Select>
  );
}
