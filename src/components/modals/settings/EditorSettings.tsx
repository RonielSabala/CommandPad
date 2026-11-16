import { SettingDefault, VariableSplit } from "@/common/config";
import {
  ClampLines,
  DEFAULT_COMMAND_LANGUAGE,
  DEFAULT_VARIABLE_LANGUAGE,
  TabWidth,
} from "@/common/editorConfig";
import { PanelSide } from "@/common/enums";
import { CODE_LANGUAGE_OPTIONS } from "@/components/common/codeEditor/CodeLanguageSelect";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useMemo } from "react";

import {
  SettingCheckbox,
  SettingItem,
  SettingRange,
  SettingSelect,
} from "./parts";

function keyPercentOf(ratio: number): number {
  return Math.round(ratio * 100);
}

export function EditorSettings() {
  const t = useTranslation();
  const commandLanguage = useStore((state) => state.defaultCommandLanguage);
  const variableLanguage = useStore((state) => state.defaultVariableLanguage);
  const keyRatio = useStore((state) => state.variableKeyRatio);
  const tabWidth = useStore((state) => state.tabWidth);
  const promptEnabled = useStore((state) => state.commandPromptEnabled);
  const clampMaxLines = useStore((state) => state.clampMaxLines);
  const spellcheckEnabled = useStore((state) => state.spellcheckEnabled);
  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapPosition = useStore((state) => state.minimapPosition);

  const setCommandLanguage = useStore(
    (state) => state.setDefaultCommandLanguage,
  );
  const setVariableLanguage = useStore(
    (state) => state.setDefaultVariableLanguage,
  );

  const setKeyRatio = useStore((state) => state.setVariableKeyRatio);
  const setTabWidth = useStore((state) => state.setTabWidth);
  const togglePrompt = useStore((state) => state.toggleCommandPrompt);
  const setClampMaxLines = useStore((state) => state.setClampMaxLines);
  const toggleSpellcheck = useStore((state) => state.toggleSpellcheck);
  const toggleMinimap = useStore((state) => state.toggleMinimap);
  const setMinimapPosition = useStore((state) => state.setMinimapPosition);

  const {
    tabWidth: tabWidthText,
    clampLines,
    variableSplit,
    minimapSide,
  } = t.settings;
  const keyPercent = keyPercentOf(keyRatio);
  const minimapSideOptions = useMemo(
    () =>
      Object.values(PanelSide).map((value) => ({
        value,
        label: minimapSide.options[value],
      })),
    [minimapSide],
  );

  return (
    <>
      <SettingItem
        title={t.settings.commandLanguage.title}
        description={t.settings.commandLanguage.description}
      >
        <SettingSelect
          value={commandLanguage}
          defaultValue={DEFAULT_COMMAND_LANGUAGE}
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
          defaultValue={DEFAULT_VARIABLE_LANGUAGE}
          options={CODE_LANGUAGE_OPTIONS}
          onChange={setVariableLanguage}
        />
      </SettingItem>

      <SettingItem
        title={tabWidthText.title}
        description={tabWidthText.description}
      >
        <SettingRange
          label={tabWidthText.title}
          value={tabWidth}
          defaultValue={TabWidth.DEFAULT}
          min={TabWidth.MIN}
          max={TabWidth.MAX}
          step={TabWidth.STEP}
          valueText={tabWidthText.value(tabWidth)}
          onChange={setTabWidth}
        />
      </SettingItem>

      <SettingCheckbox
        title={t.settings.commandPrompt.title}
        description={t.settings.commandPrompt.description}
        checked={promptEnabled}
        defaultValue={SettingDefault.COMMAND_PROMPT}
        onToggle={togglePrompt}
      />

      <SettingItem
        title={clampLines.title}
        description={clampLines.description}
      >
        <SettingRange
          label={clampLines.title}
          value={clampMaxLines}
          defaultValue={ClampLines.DEFAULT}
          min={ClampLines.MIN}
          max={ClampLines.MAX}
          step={ClampLines.STEP}
          valueText={clampLines.value(clampMaxLines)}
          onChange={setClampMaxLines}
        />
      </SettingItem>

      <SettingItem
        title={variableSplit.title}
        description={variableSplit.description}
      >
        <SettingRange
          label={variableSplit.title}
          value={keyRatio}
          defaultValue={VariableSplit.DEFAULT}
          min={VariableSplit.MIN}
          max={VariableSplit.MAX}
          step={VariableSplit.STEP}
          valueText={variableSplit.value(keyPercent, 100 - keyPercent)}
          onChange={setKeyRatio}
        />
      </SettingItem>

      <SettingCheckbox
        title={t.settings.spellcheck.title}
        description={t.settings.spellcheck.description}
        checked={spellcheckEnabled}
        defaultValue={SettingDefault.SPELLCHECK}
        onToggle={toggleSpellcheck}
      />

      <SettingCheckbox
        title={t.settings.minimap.title}
        description={t.settings.minimap.description}
        checked={minimapEnabled}
        defaultValue={SettingDefault.MINIMAP}
        onToggle={toggleMinimap}
      />

      <SettingItem
        title={minimapSide.title}
        description={minimapSide.description}
      >
        <SettingSelect
          value={minimapPosition}
          defaultValue={SettingDefault.MINIMAP_POSITION}
          options={minimapSideOptions}
          onChange={setMinimapPosition}
          disabled={!minimapEnabled}
        />
      </SettingItem>
    </>
  );
}
