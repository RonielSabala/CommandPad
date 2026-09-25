import type { Block, Variable, VariableSection } from "@/common/types";
import { VariableRows } from "@/components/variables/VariableRows";
import type { VariableCompletion } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import { getUsedVariableKeys } from "@/utils/resolution";
import { memo, useMemo } from "react";

import { MinimapMirror } from "./Minimap";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_SECTIONS: VariableSection[] = [];
const NO_COMPLETIONS: VariableCompletion[] = [];

export const VariablesMirror = memo(function VariablesMirror({
  width,
}: {
  width: number;
}) {
  const activeTab = useStore(getActiveTab);

  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const sections = activeTab?.variableSections ?? EMPTY_SECTIONS;

  const usedKeys = useMemo(
    () => getUsedVariableKeys(blocks, variables),
    [blocks, variables],
  );

  return (
    <MinimapMirror id="variables-mirror" width={width}>
      <VariableRows
        variables={variables}
        sections={sections}
        usedKeys={usedKeys}
        completions={NO_COMPLETIONS}
      />
    </MinimapMirror>
  );
});
