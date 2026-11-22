import { CodeModelScope } from "@/common/editorConfig";
import { useCompletionSource } from "@/hooks/useCompletionSource";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { getActiveBlocks, getActiveVariables, useStore } from "@/store/store";
import { useRef, type ReactNode } from "react";

import { VariableEditor } from "./VariableEditor";
import "./VariableTooltipEditor.css";

interface Props {
  variableId: string;
  header?: ReactNode;
}

export function VariableTooltipEditor({ variableId, header }: Props) {
  const blocks = useStore(getActiveBlocks);
  const variables = useStore(getActiveVariables);
  const usedKeys = useUsedVariableKeys(blocks, variables);
  const completions = useCompletionSource(variables, usedKeys);
  const variable = variables.find((entry) => entry.id === variableId);
  const keyRef = useRef<HTMLInputElement>(null);

  if (!variable) {
    return null;
  }

  return (
    <div className="variable-tooltip-editor">
      {header}
      <VariableEditor
        variable={variable}
        completions={completions}
        keyRef={keyRef}
        scope={CodeModelScope.VARIABLE_TOOLTIP}
        autoFocus
      />
    </div>
  );
}
