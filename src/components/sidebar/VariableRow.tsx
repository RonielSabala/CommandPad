import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore } from "@/store/store";
import { memo, useEffect, useRef } from "react";
import { DragDotsIcon, TrashIcon } from "../Icons";
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
  const id = variable.id;
  const key = variable.key;
  const value = variable.value;
  const isSecret = !!variable.secret;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const removeVariable = useStore((state) => state.removeVariable);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const reorderVariables = useStore((state) => state.reorderVariables);
  const pendingFocus = useStore((state) => state.pendingFocusVariableId === id);
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const keyRef = useRef<HTMLInputElement>(null);

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    "variable-group",
    id,
    reorderVariables,
    !readMode,
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus]);

  return (
    <div
      className={`sidebar-section-list-row variable-row${isDragging ? ` ${CssClass.DRAGGING}` : ""}${isSecret ? ` ${CssClass.VAR_SECRET}` : ""}`}
      {...{ [DataAttr.VARIABLE_ID]: id }}
      {...rowProps}
    >
      <div className="drag-handle" title="Drag to reorder" {...handleProps}>
        <DragDotsIcon />
      </div>
      <div
        className={`variable-inputs${isDragOver ? ` ${CssClass.DRAG_OVER}` : ""}${isSecret ? ` ${CssClass.VAR_SECRET}` : ""}`}
      >
        <input
          ref={keyRef}
          className="variable-key-input"
          type="text"
          placeholder="key"
          value={key}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) =>
            updateVariable(id, VariableField.KEY, event.target.value)
          }
          title={key}
        />
        <input
          className="variable-value-input"
          type="text"
          placeholder="value"
          value={value}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) =>
            updateVariable(id, VariableField.VALUE, event.target.value)
          }
          title={isSecret ? "" : value}
        />
      </div>
      <button
        className={`btn btn-icon variable-secret-btn${isSecret ? " is-active" : ""}`}
        onClick={() => toggleVariableSecret(id)}
        title={isSecret ? "Reveal value" : "Mask value"}
      >
        <SecretIcon masked={isSecret} />
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={() => removeVariable(id)}
        title="Remove variable"
      >
        <TrashIcon />
      </button>
    </div>
  );
});
