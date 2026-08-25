import { CssClass } from "@/common/constants/css";
import type { Block, Variable } from "@/common/types";
import { VariableItem } from "@/components/variables/VariableItem";
import type { VariableCompletion } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import { getUsedVariableKeys, isVariableUnused } from "@/utils/resolution";
import { memo, useMemo } from "react";

import { MinimapMirror } from "./Minimap";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];
const NO_COMPLETIONS: VariableCompletion[] = [];

export const VariablesMirror = memo(function VariablesMirror({
  width,
}: {
  width: number;
}) {
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;

  const usedKeys = useMemo(
    () => getUsedVariableKeys(blocks, variables),
    [blocks, variables],
  );

  return (
    <MinimapMirror className={CssClass.VARIABLES_MIRROR} width={width}>
      {variables.map((variable) => (
        <VariableItem
          key={variable.id}
          variable={variable}
          completions={NO_COMPLETIONS}
          unused={isVariableUnused(variable, usedKeys)}
        />
      ))}
    </MinimapMirror>
  );
});
