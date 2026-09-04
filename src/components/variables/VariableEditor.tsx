import { CssClass } from "@/common/constants/css";
import {
  CodeModelScope,
  DEFAULT_VARIABLE_LANGUAGE,
} from "@/common/editorConfig";
import {
  AppMode,
  ClampSurface,
  CodeLanguage,
  VariableField,
} from "@/common/enums";
import type { Variable } from "@/common/types";
import { ClampToggle } from "@/components/common/codeEditor/ClampToggle";
import { CodeEditor } from "@/components/common/codeEditor/CodeEditor";
import { CodeLanguageSelect } from "@/components/common/codeEditor/CodeLanguageSelect";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { EyeIcon } from "@/components/icons";
import { CLAMP_SURFACE_STYLE, useClampSurface } from "@/hooks/useClampSurface";
import { useExtractVariableAction } from "@/hooks/useExtractVariableAction";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { useStore } from "@/store/store";
import { getVariableKey } from "@/utils/resolution";
import { classNames, countLines } from "@/utils/string";
import { useCallback, useEffect, useMemo, type RefObject } from "react";

import "./VariableEditor.css";
import { VariableKeyInput } from "./VariableKeyInput";

interface Props {
  variable: Variable;
  completions: VariableCompletion[];
  unused?: boolean;
  keyRef: RefObject<HTMLInputElement | null>;
}

export function VariableEditor({
  variable,
  completions,
  unused,
  keyRef,
}: Props) {
  const t = useTranslation();
  const variableId = variable.id;
  const isSecret = !!variable.secret;

  const language = variable.language ?? DEFAULT_VARIABLE_LANGUAGE;

  const updateVariable = useStore((state) => state.updateVariable);
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const consumeVariableFocus = useStore((state) => state.consumeVariableFocus);
  const pendingFocus = useStore(
    (state) => state.pendingFocusVariableId === variableId,
  );

  const valueLines = useMemo(
    () => countLines(variable.value),
    [variable.value],
  );
  const valueClamp = useClampSurface(
    variableId,
    ClampSurface.VALUE,
    valueLines,
  );

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

  const handleLanguageChange = useCallback(
    (next: CodeLanguage) =>
      updateVariable(variableId, VariableField.LANGUAGE, next),
    [updateVariable, variableId],
  );

  useEffect(() => {
    if (pendingFocus) {
      keyRef.current?.focus();
      keyRef.current?.select();
      consumeVariableFocus();
    }
  }, [pendingFocus, consumeVariableFocus, keyRef]);

  return (
    <div
      className={classNames(
        "variable-editor",
        CssClass.VARIABLE_SURFACE,
        CssClass.CLAMP_SURFACE,
        isSecret && "is-secret",
        unused && "is-unused",
      )}
      style={CLAMP_SURFACE_STYLE}
    >
      <div className="variable-editor-key-row">
        <VariableKeyInput
          variableId={variableId}
          variableKey={variable.key}
          className="variable-editor-key"
          unused={unused}
          inputRef={keyRef}
          scrollable
        />

        {isSecret && (
          <button
            className="btn btn-icon variable-editor-secret-btn"
            onClick={() => toggleVariableSecret(variableId)}
            aria-label={t.variables.reveal(1)}
            {...tooltip(t.variables.reveal(1))}
          >
            <EyeIcon slashed className="icon-md icon-bold" />
          </button>
        )}
      </div>

      <CodeEditor
        modelId={`${CodeModelScope.VARIABLE}/${variableId}`}
        className="variable-editor-value"
        value={variable.value}
        language={language}
        onChange={handleChange}
        onFocus={valueClamp.onFocus}
        onBlur={valueClamp.onBlur}
        placeholder={t.variables.valuePlaceholder}
        completions={valueCompletions}
        actions={actions}
        masked={isSecret}
        clamped={valueClamp.clamped}
        header={
          !readMode && (
            <CodeLanguageSelect
              language={language}
              onChange={handleLanguageChange}
            />
          )
        }
        footer={
          valueClamp.overflows && (
            <ClampToggle
              expanded={valueClamp.expanded}
              onToggle={valueClamp.toggle}
            />
          )
        }
      />
    </div>
  );
}
