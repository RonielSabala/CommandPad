import { SelectionGroup } from "@/common/enums";
import type { Block, Variable } from "@/common/types";
import { EmptyState } from "@/components/common/EmptyState";
import { PlusIcon } from "@/components/icons";
import { useLassoSelection } from "@/hooks/useLassoSelection";
import { useTranslation } from "@/i18n";
import { buildVariableCompletions } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import {
  getSecretKeys,
  getUsedVariableKeys,
  getVariableMap,
  isVariableUnused,
} from "@/utils/resolution";
import { useMemo, useState } from "react";
import "./RunbookVariables.css";
import { VariableItem } from "./VariableItem";

const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_BLOCKS: Block[] = [];

function AddVariableRow() {
  const t = useTranslation();
  const addVariable = useStore((state) => state.addVariable);

  return (
    <div id="add-variable-row">
      <button className="btn" onClick={() => void addVariable()}>
        <PlusIcon className="icon-md icon-bold" />
        {t.variables.newTitle}
      </button>
    </div>
  );
}

export function RunbookVariables() {
  const t = useTranslation();
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;

  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useLassoSelection(root, SelectionGroup.VARIABLE);

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);
  const usedKeys = useMemo(
    () => getUsedVariableKeys(blocks, variables),
    [blocks, variables],
  );

  const completions = useMemo(
    () => buildVariableCompletions(variableMap, secretKeys),
    [variableMap, secretKeys],
  );

  return (
    <div id="runbook-variables" ref={setRoot}>
      {variables.length === 0 && (
        <EmptyState
          icon={
            <span className="empty-state-glyph" aria-hidden="true">
              {"{}"}
            </span>
          }
          title={t.variables.emptyTitle}
          hint={t.variables.emptyHint}
        />
      )}

      {variables.map((variable) => (
        <VariableItem
          key={variable.id}
          variable={variable}
          completions={completions}
          unused={isVariableUnused(variable, usedKeys)}
        />
      ))}

      <AddVariableRow />
    </div>
  );
}
