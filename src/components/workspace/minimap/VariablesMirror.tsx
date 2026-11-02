import { CssClass } from "@/common/constants/css";
import { NO_COMPLETIONS } from "@/components/blocks/listContext";
import { VariableRows } from "@/components/variables/VariableRows";
import "@/components/variables/VariablesList.css";
import {
  EMPTY_BLOCKS,
  EMPTY_SECTIONS,
  EMPTY_VARIABLES,
  getActiveTab,
  useStore,
} from "@/store/store";
import { getUsedVariableKeys } from "@/utils/resolution";
import { memo, useMemo } from "react";

import { MinimapMirror } from "./Minimap";

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
    <MinimapMirror className={CssClass.VARIABLES_LIST} width={width}>
      <VariableRows
        variables={variables}
        sections={sections}
        usedKeys={usedKeys}
        completions={NO_COMPLETIONS}
      />
    </MinimapMirror>
  );
});
