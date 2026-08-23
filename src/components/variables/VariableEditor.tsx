import { CssClass } from "@/common/constants/css";
import { CodeModelScope } from "@/common/editorConfig";
import { AppMode, VariableField } from "@/common/enums";
import type { Variable } from "@/common/types";
import { CodeEditor } from "@/components/common/codeEditor/CodeEditor";
import { EyeIcon } from "@/components/icons";
import { useExtractVariableAction } from "@/hooks/useExtractVariableAction";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { useStore } from "@/store/store";
import { getVariableKey } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useCallback, useEffect, useMemo, useRef } from "react";

import "./VariableEditor.css";
import { VariableKeyInput } from "./VariableKeyInput";

interface Props {
  variable: Variable;
  completions: VariableCompletion[];
  unused?: boolean;
}

export function VariableEditor({ variable, completions, unused }: Props) {
  const t = useTranslation();
  const variableId = variable.id;
  const isSecret = !!variable.secret;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );

  const keyRef = useRef<HTMLInputElement>(null);
  const actions = useExtractVariableAction();

  // A variable resolving to itself can never fill in, so never offer it
  const ownKey = getVariableKey(variable);
  const valueCompletions = useMemo(
    () => completions.filter((entry) => entry.key !== ownKey),
    [completions, ownKey],
  );

  const handleChange = useCallback(
    (value: string) => updateVariable(variableId, VariableField.VALUE, value),
    [updateVariable, variableId],
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus();
      keyRef.current?.select();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus]);

  return (
    <div
      className={classNames(
        "variable-editor",
        CssClass.VARIABLE_SURFACE,
        isSecret && "is-secret",
        unused && "is-unused",
      )}
    >
      <div className="variable-editor-key-row">
        <VariableKeyInput
          variableId={variableId}
          variableKey={variable.key}
          className="variable-editor-key"
          unused={unused}
          inputRef={keyRef}
        />

        {isSecret && (
          <button
            className="btn btn-icon variable-editor-secret-btn"
            onClick={() => toggleVariableSecret(variableId)}
            title={t.variables.reveal(1)}
          >
            <EyeIcon slashed className="icon-md icon-bold" />
          </button>
        )}
      </div>

      <CodeEditor
        modelId={`${CodeModelScope.VARIABLE}/${variableId}`}
        className="variable-editor-value"
        value={variable.value}
        onChange={handleChange}
        placeholder={t.variables.valuePlaceholder}
        completions={valueCompletions}
        actions={actions}
        readOnly={readMode}
      />
    </div>
  );
}
