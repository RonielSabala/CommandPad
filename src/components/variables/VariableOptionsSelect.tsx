import { CssClass } from "@/common/constants/css";
import {
  AutoComplete,
  InputType,
  SelectSelector,
} from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { AppMode, DragGroup, VariableField } from "@/common/enums";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import {
  Select,
  SelectAlign,
  type SelectOptionRowProps,
} from "@/components/common/Select";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./VariableOptionsSelect.css";

const OptionVariableContext = createContext("");

function VariableOptionRow({
  value: option,
  rowProps,
  children,
}: SelectOptionRowProps<string>) {
  const t = useTranslation();
  const variableId = useContext(OptionVariableContext);
  const renameVariableOption = useStore((state) => state.renameVariableOption);
  const removeVariableOption = useStore((state) => state.removeVariableOption);
  const reorderVariableOptions = useStore(
    (state) => state.reorderVariableOptions,
  );

  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isDragging,
    isDragOver,
    handleProps,
    rowProps: dragProps,
  } = useRowReorder(DragGroup.VARIABLE_OPTION, option, (source, target) =>
    reorderVariableOptions(variableId, source, target),
  );

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <li
      {...rowProps}
      {...dragProps}
      className={classNames(
        rowProps.className,
        isDragging && CssClass.DRAGGING,
      )}
    >
      <DragImage>{option}</DragImage>
      <DragHandle handleProps={handleProps} />

      <div
        className={classNames(
          "variable-option-target",
          isDragOver && CssClass.DRAG_OVER,
        )}
      >
        {editing ? (
          <input
            ref={inputRef}
            className={classNames(
              "variable-option-input",
              CssClass.NO_LIGATURES,
            )}
            type={InputType.TEXT}
            defaultValue={option}
            spellCheck={false}
            autoComplete={AutoComplete.OFF}
            aria-label={t.variables.editOption}
            onBlur={(event) => {
              setEditing(false);
              renameVariableOption(variableId, option, event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === Key.ENTER || event.key === Key.ESCAPE) {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.blur();
              }
            }}
          />
        ) : (
          children
        )}
      </div>

      <ActionsMenu
        title={t.variables.optionActions}
        className="variable-option-actions"
        besideSelector={SelectSelector.MENU}
      >
        <ContextMenuItem
          icon={
            <PencilIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => setEditing(true)}
        >
          {t.variables.editOption}
        </ContextMenuItem>

        <ContextMenuItem
          icon={
            <TrashIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => removeVariableOption(variableId, option)}
          danger
        >
          {t.variables.removeOption}
        </ContextMenuItem>
      </ActionsMenu>
    </li>
  );
}

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
    <OptionVariableContext.Provider value={variableId}>
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
        matchTriggerWidth={false}
        searchPlaceholder={t.variables.searchOptionsPlaceholder}
        optionRow={editable ? VariableOptionRow : undefined}
        footer={
          editable && (
            <div className="variable-option-add-row">
              <input
                className={classNames(
                  "variable-option-input",
                  CssClass.NO_LIGATURES,
                )}
                type={InputType.TEXT}
                placeholder={t.variables.addOptionPlaceholder}
                value={draft}
                spellCheck={false}
                autoComplete={AutoComplete.OFF}
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
    </OptionVariableContext.Provider>
  );
}
