import { Key } from "@/common/constants/events";
import { AppMode, VariableField } from "@/common/enums";
import { Select, SelectAlign } from "@/components/common/Select";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useMemo, useState } from "react";

import "./VariableOptionsSelect.css";

interface Props {
  variableId: string;
  value: string;
  options: readonly string[];
  className?: string;
  triggerClassName: string;
}

export function VariableOptionsSelect({
  variableId,
  value,
  options,
  className,
  triggerClassName,
}: Props) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const addVariableOption = useStore((state) => state.addVariableOption);
  const removeVariableOption = useStore((state) => state.removeVariableOption);
  const [draft, setDraft] = useState("");

  const selectOptions = useMemo(
    () => options.map((option) => ({ value: option, label: option })),
    [options],
  );

  const commitDraft = () => {
    addVariableOption(variableId, draft);
    setDraft("");
  };

  return (
    <Select
      value={value}
      options={selectOptions}
      onChange={(next) => updateVariable(variableId, VariableField.VALUE, next)}
      className={classNames("variable-options-select", className)}
      triggerClassName={classNames(
        "variable-options-trigger",
        triggerClassName,
      )}
      align={SelectAlign.START}
      empty={t.variables.noOptions}
      portal
      optionAction={
        readMode
          ? undefined
          : (option) => (
              <button
                className="btn btn-flat-icon variable-option-remove"
                onClick={() => removeVariableOption(variableId, option)}
                aria-label={t.variables.removeOption(option)}
                {...tooltip(t.variables.removeOption(option))}
              >
                <TrashIcon className="icon-md icon-bold" />
              </button>
            )
      }
      footer={
        !readMode && (
          <div className="variable-option-add-row">
            <input
              className="variable-option-add no-ligatures"
              type="text"
              placeholder={t.variables.addOptionPlaceholder}
              value={draft}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === Key.ENTER) {
                  event.preventDefault();
                  commitDraft();
                }
              }}
            />
            <button
              className="btn btn-flat-icon"
              onClick={commitDraft}
              disabled={!draft.trim()}
              aria-label={t.variables.addOption}
              {...tooltip(t.variables.addOption)}
            >
              <PlusIcon className="icon-md icon-bold" />
            </button>
          </div>
        )
      }
    >
      <span
        className={classNames(
          "variable-options-value",
          !value && "is-placeholder",
        )}
      >
        {value || t.variables.optionPlaceholder}
      </span>
    </Select>
  );
}
