import { CodeModelScope } from "@/common/editorConfig";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { buildVariableCompletions } from "@/monaco/completions";
import { getActiveBlocks, getActiveVariables, useStore } from "@/store/store";
import { getTabSecretKeys, getTabVariableMap } from "@/utils/resolution";
import { useMemo, useRef, type ReactNode } from "react";

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
  const variable = variables.find((entry) => entry.id === variableId);
  const keyRef = useRef<HTMLInputElement>(null);

  const completions = useMemo(
    () =>
      buildVariableCompletions(
        getTabVariableMap(variables),
        getTabSecretKeys(variables),
        usedKeys,
      ),
    [variables, usedKeys],
  );

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
