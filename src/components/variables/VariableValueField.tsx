import { CssClass } from "@/common/constants/css";
import {
  DEFAULT_VARIABLE_LANGUAGE,
  MonacoLayout,
  type CodeModelScope,
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
import { CLAMP_SURFACE_STYLE, useClampSurface } from "@/hooks/useClampSurface";
import { useEditorActions } from "@/hooks/useEditorActions";
import { useTranslation } from "@/i18n";
import type { VariableCompletion } from "@/monaco/completions";
import { useStore } from "@/store/store";
import { classNames, countLines } from "@/utils/string";
import { useCallback, useMemo, useRef, type ReactNode } from "react";

import { VariableOptionsSelect } from "./VariableOptionsSelect";
import "./VariableValueField.css";

interface Props {
  variable: Variable;
  value: string;
  scope: CodeModelScope;
  surfaceId: string;
  completions: VariableCompletion[];
  keyRow: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

/** A variable's key above its value. */
export function VariableValueField({
  variable,
  value,
  scope,
  surfaceId,
  completions,
  keyRow,
  className,
  onChange,
}: Props) {
  const t = useTranslation();
  const variableId = variable.id;
  const isSecret = !!variable.secret;
  const language = variable.language ?? DEFAULT_VARIABLE_LANGUAGE;

  // An override edits the block
  const editable = !onChange;
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const updateVariable = useStore((state) => state.updateVariable);
  const actions = useEditorActions();

  const rootRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => countLines(value), [value]);
  const clamp = useClampSurface(surfaceId, ClampSurface.VALUE, lines, rootRef);

  const handleChange = useCallback(
    (next: string) =>
      onChange
        ? onChange(next)
        : updateVariable(variableId, VariableField.VALUE, next),
    [onChange, updateVariable, variableId],
  );

  const handleLanguageChange = useCallback(
    (next: CodeLanguage) =>
      updateVariable(variableId, VariableField.LANGUAGE, next),
    [updateVariable, variableId],
  );

  return (
    <div
      ref={rootRef}
      className={classNames(
        "variable-editor",
        CssClass.CLAMP_SURFACE,
        isSecret && CssClass.IS_SECRET,
        className,
      )}
      style={CLAMP_SURFACE_STYLE}
    >
      <div className="variable-editor-key-row">{keyRow}</div>

      {variable.options ? (
        <VariableOptionsSelect
          variableId={variableId}
          value={value}
          options={variable.options}
          triggerClassName="variable-editor-options"
          onChange={onChange}
        />
      ) : (
        <CodeEditor
          modelId={`${scope}/${surfaceId}`}
          className="variable-editor-value"
          value={value}
          language={language}
          onChange={handleChange}
          onFocus={clamp.onFocus}
          onBlur={clamp.onBlur}
          placeholder={t.variables.valuePlaceholder}
          completions={completions}
          actions={editable ? actions : undefined}
          masked={isSecret}
          gutter={lines > MonacoLayout.FIRST_LINE}
          clamped={clamp.clamped}
          header={
            editable &&
            !readMode && (
              <CodeLanguageSelect
                language={language}
                onChange={handleLanguageChange}
              />
            )
          }
          footer={
            clamp.overflows && (
              <ClampToggle expanded={clamp.expanded} onToggle={clamp.toggle} />
            )
          }
        />
      )}
    </div>
  );
}
