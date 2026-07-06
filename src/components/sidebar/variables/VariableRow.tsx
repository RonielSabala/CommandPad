import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { DragDotsIcon, TrashIcon } from "@/components/Icons";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef } from "react";
import "./VariableRow.css";

function SecretIcon({ masked }: { masked: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
      {masked && <line x1="2" y1="2" x2="14" y2="14" />}
    </svg>
  );
}

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
        <DragDotsIcon />
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
          title={isSecret ? "" : variableValue}
        />
      </div>
      <button
        className={`btn btn-icon variable-secret-btn${isSecret ? " is-active" : ""}`}
        onClick={() => toggleVariableSecret(variableId)}
        title={isSecret ? "Reveal value" : "Mask value"}
      >
        <SecretIcon masked={isSecret} />
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={() => removeVariable(variableId)}
        title="Remove variable"
      >
        <TrashIcon />
      </button>
    </div>
  );
});
