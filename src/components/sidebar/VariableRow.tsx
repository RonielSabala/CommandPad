import { memo, useEffect, useRef } from "react";

import { DataAttr } from "@/common/constants/dom";
import { AppMode, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useStore } from "@/store/store";
import { DragDotsIcon, TrashIcon } from "../Icons";

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

export const VariableRow = memo(function VariableRow({
  variable,
}: {
  variable: Variable;
}) {
  const readMode = useStore((s) => s.mode === AppMode.READ);
  const updateVariable = useStore((s) => s.updateVariable);
  const removeVariable = useStore((s) => s.removeVariable);
  const toggleVariableSecret = useStore((s) => s.toggleVariableSecret);
  const reorderVariables = useStore((s) => s.reorderVariables);
  const pendingFocus = useStore(
    (s) => s.pendingFocusVariableId === variable.id,
  );
  const consumeVariableFocus = useStore((s) => s.consumeVariableFocus);
  const keyRef = useRef<HTMLInputElement>(null);

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    "variable",
    variable.id,
    reorderVariables,
    !readMode,
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus]);

  const isSecret = !!variable.secret;

  return (
    <div
      className={`variable-row sidebar-section-row${isSecret ? " is-secret" : ""}${isDragging ? " dragging" : ""}`}
      {...{ [DataAttr.VARIABLE_ID]: variable.id }}
      {...rowProps}
    >
      <div
        className="variable-drag-handle drag-handle"
        title="Drag to reorder"
        {...handleProps}
      >
        <DragDotsIcon />
      </div>
      <div
        className={`variable-inputs${isSecret ? " is-secret" : ""}${isDragOver ? " drag-over" : ""}`}
      >
        <input
          ref={keyRef}
          className="variable-key-input"
          type="text"
          placeholder="key"
          value={variable.key}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) =>
            updateVariable(variable.id, VariableField.KEY, e.target.value)
          }
          title={variable.key}
        />
        <input
          className="variable-value-input"
          type="text"
          placeholder="value"
          value={variable.value}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) =>
            updateVariable(variable.id, VariableField.VALUE, e.target.value)
          }
          title={isSecret ? "" : variable.value}
        />
      </div>
      <button
        className={`btn btn-icon variable-secret-btn${isSecret ? " is-active" : ""}`}
        onClick={() => toggleVariableSecret(variable.id)}
        title={isSecret ? "Reveal value" : "Mask value"}
      >
        <SecretIcon masked={isSecret} />
      </button>
      <button
        className="btn btn-icon btn-danger variable-row-delete"
        onClick={() => removeVariable(variable.id)}
        title="Remove variable"
      >
        <TrashIcon />
      </button>
    </div>
  );
});
