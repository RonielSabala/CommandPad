import { CodeModelScope } from "@/common/editorConfig";
import type { Variable } from "@/common/types";
import { buildVariableCompletions } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
import { useMemo, useRef, type ReactNode } from "react";

import { VariableEditor } from "./VariableEditor";
import "./VariableTooltipEditor.css";

const EMPTY_VARIABLES: Variable[] = [];

interface Props {
  variableId: string;
  header?: ReactNode;
}

export function VariableTooltipEditor({ variableId, header }: Props) {
  const variables = useStore(
    (state) => getActiveTab(state)?.variables ?? EMPTY_VARIABLES,
  );
  const variable = variables.find((entry) => entry.id === variableId);
  const keyRef = useRef<HTMLInputElement>(null);

  const completions = useMemo(
    () =>
      buildVariableCompletions(
        getVariableMap(variables),
        getSecretKeys(variables),
      ),
    [variables],
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
