import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { AppMode, DragGroup, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { DragIcon, EyeIcon, EyeSlashIcon, XIcon } from "@/components/icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef } from "react";
import "./VariableRow.css";

interface Props {
  variable: Variable;
}

export const VariableRow = memo(function VariableRow({ variable }: Props) {
  const variableId = variable.id;
  const variableKey = variable.key;
  const variableValue = variable.value;
  const isSecret = !!variable.secret;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const removeVariable = useStore((state) => state.removeVariable);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const reorderVariables = useStore((state) => state.reorderVariables);
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const keyRef = useRef<HTMLInputElement>(null);

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.VARIABLE,
    variableId,
    reorderVariables,
    !readMode,
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus]);

  const rowClass = classNames(
    "variable-row",
    "sidebar-section-list-row",
    isSecret && "is-secret",
    isDragging && CssClass.DRAGGING,
  );

  const variableInputsClass = classNames(
    "variable-inputs",
    isSecret && "is-secret",
    isDragOver && CssClass.DRAG_OVER,
  );

  return (
    <div
      className={rowClass}
      {...{ [DataAttr.VARIABLE_ID]: variableId }}
      {...rowProps}
    >
      <div className="drag-handle" title="Drag to reorder" {...handleProps}>
        <DragIcon className="icon-md" />
      </div>
      <div className={variableInputsClass}>
        <input
          ref={keyRef}
          className="variable-key-input"
          type="text"
          placeholder="key"
          value={variableKey}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) =>
            updateVariable(variableId, VariableField.KEY, event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === Key.ENTER) {
              event.currentTarget.blur();
            }
          }}
          title={variableKey}
        />
        <input
          className="variable-value-input"
          type="text"
          placeholder="value"
          value={variableValue}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) =>
            updateVariable(variableId, VariableField.VALUE, event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === Key.ENTER) {
              event.currentTarget.blur();
            }
          }}
          title={isSecret ? "" : variableValue}
        />
      </div>
      <button
        className={`btn btn-icon variable-secret-btn${isSecret ? " is-active" : ""}`}
        onClick={() => toggleVariableSecret(variableId)}
        title={isSecret ? "Reveal value" : "Mask value"}
      >
        {isSecret ? (
          <EyeSlashIcon className="icon-md icon-bold" />
        ) : (
          <EyeIcon className="icon-md icon-bold" />
        )}
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={() => removeVariable(variableId)}
        title="Remove variable"
      >
        <XIcon className="icon-md icon-bold" />
      </button>
    </div>
  );
});
