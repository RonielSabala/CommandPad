import { VariableSplit } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { CODE_LANGUAGE_OPTIONS } from "@/components/common/codeEditor/CodeLanguageSelect";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";

import {
  SettingCheckbox,
  SettingItem,
  SettingRange,
  SettingSelect,
} from "./SettingsParts";

function keyPercentOf(ratio: number): number {
  return Math.round(ratio * 100);
}

const EVEN_KEY_PERCENT = keyPercentOf(VariableSplit.DEFAULT);

export function EditorSettings() {
  const t = useTranslation();
  const commandLanguage = useStore((state) => state.defaultCommandLanguage);
  const variableLanguage = useStore((state) => state.defaultVariableLanguage);
  const keyRatio = useStore((state) => state.variableKeyRatio);
  const spellcheckEnabled = useStore((state) => state.spellcheckEnabled);
  const minimapEnabled = useStore((state) => state.minimapEnabled);

  const setCommandLanguage = useStore(
    (state) => state.setDefaultCommandLanguage,
  );
  const setVariableLanguage = useStore(
    (state) => state.setDefaultVariableLanguage,
  );

  const setKeyRatio = useStore((state) => state.setVariableKeyRatio);
  const resetKeyRatio = useStore((state) => state.resetVariableKeyRatio);
  const toggleSpellcheck = useStore((state) => state.toggleSpellcheck);
  const toggleMinimap = useStore((state) => state.toggleMinimap);

  const { variableSplit } = t.settings;
  const keyPercent = keyPercentOf(keyRatio);

  return (
    <>
      <SettingItem
        title={t.settings.commandLanguage.title}
        description={t.settings.commandLanguage.description}
      >
        <SettingSelect
          value={commandLanguage}
          options={CODE_LANGUAGE_OPTIONS}
          onChange={setCommandLanguage}
        />
      </SettingItem>

      <SettingItem
        title={t.settings.variableLanguage.title}
        description={t.settings.variableLanguage.description}
      >
        <SettingSelect
          value={variableLanguage}
          options={CODE_LANGUAGE_OPTIONS}
          onChange={setVariableLanguage}
        />
      </SettingItem>

      <SettingItem
        title={variableSplit.title}
        description={variableSplit.description}
      >
        <SettingRange
          label={variableSplit.title}
          value={keyRatio}
          min={VariableSplit.MIN}
          max={VariableSplit.MAX}
          step={VariableSplit.STEP}
          valueText={variableSplit.value(keyPercent, 100 - keyPercent)}
          onChange={setKeyRatio}
        >
          <button
            className={CssClass.BTN}
            disabled={keyPercent === EVEN_KEY_PERCENT}
            onClick={resetKeyRatio}
          >
            {variableSplit.reset}
          </button>
        </SettingRange>
      </SettingItem>

      <SettingCheckbox
        title={t.settings.spellcheck.title}
        description={t.settings.spellcheck.description}
        checked={spellcheckEnabled}
        onToggle={toggleSpellcheck}
      />

      <SettingCheckbox
        title={t.settings.minimap.title}
        description={t.settings.minimap.description}
        checked={minimapEnabled}
        onToggle={toggleMinimap}
      />
    </>
  );
}
