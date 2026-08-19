import { SECRET_MASK } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { AppMode, DragGroup, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import {
  DragIcon,
  DuplicateIcon,
  EyeIcon,
  TrashIcon,
} from "@/components/icons";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useVariableSplitResize } from "@/hooks/useVariableSplitResize";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import {
  applyOperations,
  getCaseOperationKeywords,
  isConstantVariableKey,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef, type CSSProperties } from "react";
import { AlphabetUppercase } from "react-bootstrap-icons";
import "./VariableRow.css";

const CASE_KEYWORDS = getCaseOperationKeywords();

interface Props {
  variable: Variable;
  unused?: boolean;
  showSecretColumn?: boolean;
}

export const VariableRow = memo(function VariableRow({
  variable,
  unused,
  showSecretColumn,
}: Props) {
  const t = useTranslation();
  const variableId = variable.id;
  const variableKey = variable.key;
  const variableValue = variable.value;
  const isSecret = !!variable.secret;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const removeVariable = useStore((state) => state.removeVariable);
  const duplicateVariable = useStore((state) => state.duplicateVariable);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const reorderVariables = useStore((state) => state.reorderVariables);
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const keyRatio = useStore((state) => state.variableKeyRatio);
  const splitResize = useVariableSplitResize();
  const keyRef = useRef<HTMLInputElement>(null);

  const handleKeyPairWrap = usePairWrapping((value) =>
    updateVariable(variableId, VariableField.KEY, value),
  );
  const handleValuePairWrap = usePairWrapping((value) =>
    updateVariable(variableId, VariableField.VALUE, value),
  );

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.VARIABLE,
    variableId,
    reorderVariables,
    !readMode,
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus();
      keyRef.current?.select();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus]);

  const rowClass = classNames(
    "variable-row",
    "sidebar-section-list-row",
    isSecret && "is-secret",
    unused && "is-unused",
    isDragging && CssClass.DRAGGING,
  );

  const keyInputClass = classNames(
    "variable-key-input",
    "no-ligatures",
    isConstantVariableKey(variableKey) && "is-constant",
  );

  const variableInputsClass = classNames(
    "variable-inputs",
    isSecret && "is-secret",
    isDragOver && CssClass.DRAG_OVER,
  );

  const splitStyle = {
    "--variable-key-fr": `${keyRatio}fr`,
    "--variable-value-fr": `${1 - keyRatio}fr`,
  } as CSSProperties;

  return (
    <div
      className={rowClass}
      {...{ [DataAttr.VARIABLE_ID]: variableId }}
      {...rowProps}
    >
      <div
        className="drag-handle"
        title={t.common.dragToReorder}
        {...handleProps}
      >
        <DragIcon className="icon-md" />
      </div>

      <div className={variableInputsClass} style={splitStyle}>
        <input
          ref={keyRef}
          className={keyInputClass}
          type="text"
          placeholder={t.variables.keyPlaceholder}
          value={variableKey}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) =>
            updateVariable(variableId, VariableField.KEY, event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === Key.ENTER || event.key === Key.ESCAPE) {
              event.currentTarget.blur();
              return;
            }

            handleKeyPairWrap(event);
          }}
          title={unused ? t.variables.unusedTitle(variableKey) : variableKey}
        />

        <div
          className="variable-split-handle no-user-select"
          title={t.variables.dragResizeSplit}
          {...splitResize}
        />

        <div className="variable-value-wrap">
          <input
            className="variable-value-input no-ligatures"
            type="text"
            placeholder={t.variables.valuePlaceholder}
            value={variableValue}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) =>
              updateVariable(
                variableId,
                VariableField.VALUE,
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (event.key === Key.ENTER || event.key === Key.ESCAPE) {
                event.currentTarget.blur();
                return;
              }

              handleValuePairWrap(event);
            }}
            title={isSecret ? "" : variableValue}
          />

          {isSecret && variableValue && (
            <div className="variable-value-mask" aria-hidden="true">
              {SECRET_MASK}
            </div>
          )}
        </div>
      </div>

      {isSecret && (
        <button
          className="btn btn-icon variable-secret-btn"
          onClick={() => toggleVariableSecret(variableId)}
          title={t.variables.reveal}
        >
          <EyeIcon slashed className="icon-md icon-bold" />
        </button>
      )}

      <ActionsMenu className={CssClass.ROW_ACTIONS} title={t.variables.actions}>
        <ContextMenuItem
          icon={<EyeIcon slashed={!isSecret} className="icon-md icon-bold" />}
          onSelect={() => toggleVariableSecret(variableId)}
        >
          {isSecret ? t.variables.reveal : t.variables.mask}
        </ContextMenuItem>

        <ContextMenuItem
          icon={<DuplicateIcon className="icon-md icon-bold" />}
          onSelect={() => duplicateVariable(variableId)}
        >
          {t.variables.duplicate}
        </ContextMenuItem>

        <ContextMenuSubmenu
          icon={<AlphabetUppercase className="icon-md" />}
          label={t.variables.renameCase}
          iconlessItems
        >
          {CASE_KEYWORDS.map((keyword) => (
            <ContextMenuItem
              key={keyword}
              onSelect={() =>
                updateVariable(
                  variableId,
                  VariableField.KEY,
                  applyOperations(variableKey, [keyword], { key: variableKey })
                    .text,
                )
              }
            >
              {keyword}
            </ContextMenuItem>
          ))}
        </ContextMenuSubmenu>

        <ContextMenuItem
          icon={<TrashIcon className="icon-md icon-bold" />}
          onSelect={() => removeVariable(variableId)}
          danger
        >
          {t.variables.remove}
        </ContextMenuItem>
      </ActionsMenu>

      {!isSecret && showSecretColumn && (
        <div
          className="btn btn-icon variable-secret-btn is-placeholder"
          aria-hidden="true"
        >
          <EyeIcon slashed className="icon-md icon-bold" />
        </div>
      )}
    </div>
  );
});
