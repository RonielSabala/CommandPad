import { SelectConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
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
import { DragHandle } from "@/components/common/DragHandle";
import { DragImage } from "@/components/common/DragImage";
import {
  Select,
  SelectAlign,
  type SelectOptionRowProps,
} from "@/components/common/Select";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  CheckIcon,
  CopyIcon,
  DuplicateIcon,
  OptionIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { getTabVariableMap } from "@/hooks/useTabUnresolved";
import { useTranslation } from "@/i18n";
import { EMPTY_VARIABLES, getActiveVariables, useStore } from "@/store/store";
import {
  getSecretKeys,
  getVariableKey,
  maskedText,
  resolveOptionValue,
  type VariableMap,
} from "@/utils/resolution";
import { abbreviate, classNames, countCharacters } from "@/utils/string";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowBarDown, ArrowBarUp } from "react-bootstrap-icons";

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
  { variableMaps: VariableMap[]; secretKeys: Set<string> }
>();

/** The active tab's option scope. */
function tabOptionScope(variables: Variable[]) {
  let scope = tabScopes.get(variables);
  if (!scope) {
    scope = {
      variableMaps: [getTabVariableMap(variables)],
      secretKeys: getSecretKeys(variables),
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
      <DragImage icon={selected ? CheckIcon : OptionIcon}>{option}</DragImage>
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
            <DuplicateIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => duplicateVariableOption(variableId, option)}
        >
          {t.variables.duplicateOption}
        </ContextMenuItem>

        <ContextMenuItem
          icon={
            <CopyIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={() => void navigator.clipboard.writeText(option)}
        >
          {t.variables.copyOption}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          icon={
            <ArrowBarUp
              className={(CssClass.ICON_MD, CssClass.ICON_SEMIBOLD)}
            />
          }
          onSelect={() =>
            reorderVariableOptions(variableId, option, options[0] ?? option)
          }
          disabled={options[0] === option}
        >
          {t.variables.moveOptionToTop}
        </ContextMenuItem>

        <ContextMenuItem
          icon={
            <ArrowBarDown
              className={(CssClass.ICON_MD, CssClass.ICON_SEMIBOLD)}
            />
          }
          onSelect={() =>
            reorderVariableOptions(variableId, option, options.at(-1) ?? option)
          }
          disabled={options.at(-1) === option}
        >
          {t.variables.moveOptionToBottom}
        </ContextMenuItem>

        <ContextMenuSeparator />

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
