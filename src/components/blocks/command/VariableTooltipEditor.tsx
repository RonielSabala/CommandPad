import { CodeModelScope } from "@/common/editorConfig";
import type { Variable } from "@/common/types";
import { VariableEditor } from "@/components/variables/VariableEditor";
import { buildVariableCompletions } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
import { useMemo, useRef } from "react";

const EMPTY_VARIABLES: Variable[] = [];

interface Props {
  variableId: string;
}

export function VariableTooltipEditor({ variableId }: Props) {
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
    <VariableEditor
      variable={variable}
      completions={completions}
      keyRef={keyRef}
      scope={CodeModelScope.VARIABLE_TOOLTIP}
      autoFocus
    />
  );
}
