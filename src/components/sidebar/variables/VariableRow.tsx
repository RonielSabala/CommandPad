import { SECRET_MASK } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { AppMode, DragGroup, RunbookView, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { DragIcon, EyeIcon } from "@/components/icons";
import { VariableActionsMenu } from "@/components/variables/VariableActionsMenu";
import { VariableKeyInput } from "@/components/variables/VariableKeyInput";
import { usePairWrapping } from "@/hooks/usePairWrapping";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useVariableSplitResize } from "@/hooks/useVariableSplitResize";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef, type CSSProperties } from "react";
import "./VariableRow.css";

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
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const reorderVariables = useStore((state) => state.reorderVariables);

  const editorShowing = useStore(
    (state) => state.runbookView === RunbookView.VARIABLES,
  );
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const keyRatio = useStore((state) => state.variableKeyRatio);
  const splitResize = useVariableSplitResize();
  const keyRef = useRef<HTMLInputElement>(null);

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
    if (pendingFocus && !editorShowing) {
      keyRef.current?.focus();
      keyRef.current?.select();
      consumeVariableFocus();
    }
  }, [pendingFocus, editorShowing, consumeVariableFocus]);

  const rowClass = classNames(
    "variable-row",
    "sidebar-section-list-row",
    isSecret && "is-secret",
    unused && "is-unused",
    isDragging && CssClass.DRAGGING,
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
        <VariableKeyInput
          variableId={variableId}
          variableKey={variableKey}
          className="variable-key-input"
          unused={unused}
          inputRef={keyRef}
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
          title={t.variables.reveal(1)}
        >
          <EyeIcon slashed className="icon-md icon-bold" />
        </button>
      )}

      <VariableActionsMenu
        variableId={variableId}
        isSecret={isSecret}
        className={CssClass.ROW_ACTIONS}
      />

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
