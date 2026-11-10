import { SelectConfig } from "@/common/config";
import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import {
  AutoComplete,
  InputType,
  SelectSelector,
} from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import {
  AppMode,
  DragGroup,
  TooltipVariant,
  VariableField,
} from "@/common/enums";
import type { Variable } from "@/common/types";
import { VariableSyntax } from "@/common/variableSyntax";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { DeleteMenuItem } from "@/components/common/contextMenu/DeleteMenuItem";
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import { RenameInput } from "@/components/common/RenameInput";
import {
  Select,
  SelectAlign,
  type SelectOptionRowProps,
} from "@/components/common/Select";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  ArrowBarDown,
  ArrowBarUp,
  CheckIcon,
  CopyIcon,
  DuplicateIcon,
  OptionIcon,
  PlusIcon,
} from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { EMPTY_VARIABLES, getActiveVariables, useStore } from "@/store/store";
import {
  getTabSecretKeys,
  getTabVariableMap,
  getVariableKey,
  maskedText,
  resolveOptionValue,
  type VariableMap,
} from "@/utils/resolution";
import { abbreviate, classNames, countCharacters } from "@/utils/string";
import { createContext, useContext, useMemo, useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";

import { OptionScopeContext } from "./optionScopeContext";
import "./VariableOptionsSelect.css";

interface OptionVariable {
  variableId: string;
  variableKey: string;
  options: readonly string[];
}

const OptionVariableContext = createContext<OptionVariable>({
  variableId: "",
  variableKey: "",
  options: [],
});

const NO_OPTIONS: string[] = [];

const tabScopes = new WeakMap<
  readonly Variable[],
  { variableMaps: VariableMap[]; secretKeys: ReadonlySet<string> }
>();

/** The active tab's option scope. */
function tabOptionScope(variables: Variable[]) {
  let scope = tabScopes.get(variables);
  if (!scope) {
    scope = {
      variableMaps: [getTabVariableMap(variables)],
      secretKeys: getTabSecretKeys(variables),
    };

    tabScopes.set(variables, scope);
  }

  return scope;
}

/** What an option resolves to. */
function OptionHint({ option }: { option: string }) {
  const { variableKey } = useContext(OptionVariableContext);
  const embedScope = useContext(OptionScopeContext);
  const variables = useStore((state) =>
    embedScope ? EMPTY_VARIABLES : getActiveVariables(state),
  );

  const scope = embedScope ?? tabOptionScope(variables);
  const hint = useMemo(() => {
    const { variableMaps, secretKeys } = scope;
    const resolved = resolveOptionValue(
      option,
      variableKey,
      (key) => variableMaps.find((map) => Object.hasOwn(map, key))?.[key],
    );

    return resolved.text === option ? null : maskedText(resolved, secretKeys);
  }, [option, variableKey, scope]);

  if (hint === null) {
    return null;
  }

  return (
    <span
      className="variable-option-hint"
      {...tooltip(
        countCharacters(hint) > SelectConfig.MAX_OPTION_CHARS ? hint : null,
        TooltipVariant.CODE,
      )}
    >
      {abbreviate(hint, SelectConfig.MAX_OPTION_CHARS)}
    </span>
  );
}

function VariableOptionRow({
  value: option,
  selected,
  rowProps,
  children,
}: SelectOptionRowProps<string>) {
  const t = useTranslation();
  const { variableId, options } = useContext(OptionVariableContext);
  const renameVariableOption = useStore((state) => state.renameVariableOption);
  const removeVariableOption = useStore((state) => state.removeVariableOption);
  const duplicateVariableOption = useStore(
    (state) => state.duplicateVariableOption,
  );
  const reorderVariableOptions = useStore(
    (state) => state.reorderVariableOptions,
  );

  const [editing, setEditing] = useState(false);
  const {
    isDragging,
    isDragOver,
    handleProps,
    rowProps: dragProps,
  } = useRowReorder(DragGroup.VARIABLE_OPTION, option, (source, target) =>
    reorderVariableOptions(variableId, source, target),
  );

  const OptionStateIcon = selected ? CheckIcon : OptionIcon;

  return (
    <li
      {...rowProps}
      {...dragProps}
      className={classNames(
        rowProps.className,
        CssClass.REORDER_ROW,
        isDragging && CssClass.DRAGGING,
      )}
    >
      <DragImage icon={<OptionStateIcon className={STANDARD_ICON_CLASS} />}>
        {option}
      </DragImage>

      <DragHandle handleProps={handleProps} />

      <div
        className={classNames(
          "variable-option-target",
          editing && "is-editing",
          isDragOver && CssClass.DRAG_OVER,
        )}
      >
        {children}
        {editing && (
          <RenameInput
            className="variable-option-field variable-option-rename-input"
            value={option}
            onCommit={(name) => {
              setEditing(false);
              renameVariableOption(variableId, option, name);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>

      <ActionsMenu
        title={t.variables.optionActions}
        className="variable-option-actions"
        besideSelector={SelectSelector.MENU}
      >
        <ContextMenuItem
          icon={<PencilSquare className={CssClass.ICON_MD} />}
          onSelect={() => setEditing(true)}
        >
          {t.variables.editOption}
        </ContextMenuItem>

        <ContextMenuItem
          icon={<DuplicateIcon className={STANDARD_ICON_CLASS} />}
          onSelect={() => duplicateVariableOption(variableId, option)}
        >
          {t.variables.duplicateOption}
        </ContextMenuItem>

        <ContextMenuItem
          icon={<CopyIcon className={STANDARD_ICON_CLASS} />}
          onSelect={() => void navigator.clipboard.writeText(option)}
        >
          {t.variables.copyOption}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          icon={<ArrowBarUp className={STANDARD_ICON_CLASS} />}
          onSelect={() =>
            reorderVariableOptions(variableId, option, options[0] ?? option)
          }
          disabled={options[0] === option}
        >
          {t.variables.moveOptionToTop}
        </ContextMenuItem>

        <ContextMenuItem
          icon={<ArrowBarDown className={STANDARD_ICON_CLASS} />}
          onSelect={() =>
            reorderVariableOptions(variableId, option, options.at(-1) ?? option)
          }
          disabled={options.at(-1) === option}
        >
          {t.variables.moveOptionToBottom}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <DeleteMenuItem
          onSelect={() => removeVariableOption(variableId, option)}
        >
          {t.variables.removeOption}
        </DeleteMenuItem>
      </ActionsMenu>
    </li>
  );
}

interface Props {
  variable: Variable;
  value: string;
  className?: string;
  triggerClassName: string;
  onChange?: (value: string) => void;
}

export function VariableOptionsSelect({
  variable,
  value,
  className,
  triggerClassName,
  onChange,
}: Props) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const addVariableOption = useStore((state) => state.addVariableOption);
  const [draft, setDraft] = useState("");

  const variableId = variable.id;
  const variableKey = getVariableKey(variable);
  const options = variable.options ?? NO_OPTIONS;
  const optionVariable = useMemo(
    () => ({ variableId, variableKey, options }),
    [variableId, variableKey, options],
  );

  const editable = !readMode && !onChange;
  const selectOptions = useMemo(
    () =>
      options.map((option) => ({
        value: option,
        label: option,
        hint: option.includes(VariableSyntax.BRACE_OPEN) && (
          <OptionHint option={option} />
        ),
      })),
    [options],
  );

  const commitDraft = () => {
    addVariableOption(variableId, draft);
    setDraft("");
  };

  return (
    <OptionVariableContext.Provider value={optionVariable}>
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
                  "variable-option-field",
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
                <PlusIcon className={STANDARD_ICON_CLASS} />
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
