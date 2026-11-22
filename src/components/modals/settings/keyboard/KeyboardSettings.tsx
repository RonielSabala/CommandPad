import { CssClass } from "@/common/constants/css";
import { DialogTone } from "@/common/enums";
import {
  bindingLabel,
  REBINDABLE_KEYBINDINGS,
  type KeyBinding,
} from "@/common/keybindings";
import { FramedSection } from "@/components/common/FramedSection";
import { SearchInput } from "@/components/common/SearchInput";
import { useTranslation } from "@/i18n";
import { useStore, useStoreActions } from "@/store/store";
import { classNames, matchesQuery } from "@/utils/string";
import { useState } from "react";

import { KeybindingRow } from "./KeybindingRow";
import "./KeyboardSettings.css";

export function KeyboardSettings() {
  const t = useTranslation();
  const overrides = useStore((state) => state.keybindingOverrides);
  const { confirm, resetAllKeybindings } = useStoreActions();

  const [query, setQuery] = useState("");
  const [recordingId, setRecordingId] = useState<KeyBinding | null>(null);

  const keyboard = t.settings.keyboard;
  const needle = query.trim();
  const shown = REBINDABLE_KEYBINDINGS.filter((id) =>
    matchesQuery(needle, t.keybindings[id], bindingLabel(id)),
  );

  const resetAll = async () => {
    const confirmed = await confirm(keyboard.resetAllMessage, {
      title: keyboard.resetAllTitle,
      confirmLabel: keyboard.resetAll,
      tone: DialogTone.WARNING,
    });

    if (confirmed) {
      resetAllKeybindings();
    }
  };

  return (
    <>
      <div className="keyboard-settings-toolbar">
        <SearchInput
          className="keyboard-settings-search"
          value={query}
          placeholder={keyboard.search}
          onChange={setQuery}
        />

        <button
          className={CssClass.BTN}
          disabled={Object.keys(overrides).length === 0}
          onClick={() => void resetAll()}
        >
          {keyboard.resetAll}
        </button>
      </div>

      <FramedSection>
        {shown.length > 0 ? (
          shown.map((id) => (
            <KeybindingRow
              key={id}
              id={id}
              modified={overrides[id] !== undefined}
              recording={id === recordingId}
              onRecording={setRecordingId}
            />
          ))
        ) : (
          <p
            className={classNames(
              "keyboard-settings-empty",
              CssClass.FRAMED_ROW,
            )}
          >
            {keyboard.noMatch}
          </p>
        )}
      </FramedSection>
    </>
  );
}
