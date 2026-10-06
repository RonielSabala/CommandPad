import { CssClass } from "@/common/constants/css";
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
  onChange?: (value: string) => void;
}

export function VariableOptionsSelect({
  variableId,
  value,
  options,
  className,
  triggerClassName,
  onChange,
}: Props) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const addVariableOption = useStore((state) => state.addVariableOption);
  const removeVariableOption = useStore((state) => state.removeVariableOption);
  const [draft, setDraft] = useState("");

  const editable = !readMode && !onChange;
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
      onChange={
        onChange ??
        ((next) => updateVariable(variableId, VariableField.VALUE, next))
      }
      className={classNames("variable-options-select", className)}
      triggerClassName={classNames(
        "variable-options-trigger",
        CssClass.SELECT_KEY_INERT,
        triggerClassName,
      )}
      align={SelectAlign.START}
      empty={t.variables.noOptions}
      portal
      optionAction={
        editable
          ? (option) => (
              <button
                className={classNames(
                  "variable-option-remove",
                  CssClass.BTN,
                  CssClass.BTN_FLAT_ICON,
                )}
                onClick={() => removeVariableOption(variableId, option)}
                aria-label={t.variables.removeOption(option)}
                {...tooltip(t.variables.removeOption(option))}
              >
                <TrashIcon
                  className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
                />
              </button>
            )
          : undefined
      }
      footer={
        editable && (
          <div className="variable-option-add-row">
            <input
              className={classNames(
                "variable-option-add",
                CssClass.NO_LIGATURES,
              )}
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
              className={classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON)}
              onClick={commitDraft}
              disabled={!draft.trim()}
              aria-label={t.variables.addOption}
              {...tooltip(t.variables.addOption)}
            >
              <PlusIcon
                className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
              />
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
