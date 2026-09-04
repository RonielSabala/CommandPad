import { CssClass } from "@/common/constants/css";
import {
  ClampConfig,
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
import { useExtractVariableAction } from "@/hooks/useExtractVariableAction";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { useStore } from "@/store/store";
import { getVariableKey } from "@/utils/resolution";
import { classNames, countLines } from "@/utils/string";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";

import "./VariableEditor.css";
import { VariableKeyInput } from "./VariableKeyInput";

const CLAMP_STYLE = {
  [ClampConfig.MAX_LINES_PROPERTY]: ClampConfig.MAX_LINES,
} as CSSProperties;

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

  const valueExpanded = useStore((state) =>
    state.expandedClampSurfaces[ClampSurface.VALUE].has(variableId),
  );
  const toggleExpanded = useStore((state) => state.toggleClampSurfaceExpanded);
  const autoExpandedRef = useRef(false);

  const valueOverflows = useMemo(
    () => countLines(variable.value) > ClampConfig.MAX_LINES,
    [variable.value],
  );
  const valueClamped = valueOverflows && !valueExpanded;

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

  const handleFocus = useCallback(() => {
    if (valueOverflows && !valueExpanded) {
      autoExpandedRef.current = true;
      toggleExpanded(variableId, ClampSurface.VALUE);
    }
  }, [valueOverflows, valueExpanded, toggleExpanded, variableId]);

  const handleBlur = useCallback(() => {
    if (autoExpandedRef.current) {
      autoExpandedRef.current = false;
      toggleExpanded(variableId, ClampSurface.VALUE);
    }
  }, [toggleExpanded, variableId]);

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
        isSecret && "is-secret",
        unused && "is-unused",
      )}
      style={CLAMP_STYLE}
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={t.variables.valuePlaceholder}
        completions={valueCompletions}
        actions={actions}
        masked={isSecret}
        clamped={valueClamped}
        header={
          !readMode && (
            <CodeLanguageSelect
              language={language}
              onChange={handleLanguageChange}
            />
          )
        }
        footer={
          valueOverflows && (
            <ClampToggle
              expanded={valueExpanded}
              onToggle={() => toggleExpanded(variableId, ClampSurface.VALUE)}
            />
          )
        }
      />
    </div>
  );
}
