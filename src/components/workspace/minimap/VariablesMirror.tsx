import { CssClass } from "@/common/constants/css";
import { NO_COMPLETIONS } from "@/components/blocks/listContext";
import { KeptTabs } from "@/components/tabs/KeptTabs";
import { useScopedTab } from "@/components/tabs/tabScope";
import { VariableRows } from "@/components/variables/VariableRows";
import "@/components/variables/VariablesList.css";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { EMPTY_BLOCKS, EMPTY_SECTIONS, EMPTY_VARIABLES } from "@/store/store";
import { memo } from "react";

import { MinimapMirror } from "./Minimap";

const TabVariablesMirror = memo(function TabVariablesMirror({
  width,
}: {
  width: number;
}) {
  const tab = useScopedTab();
  const blocks = tab?.blocks ?? EMPTY_BLOCKS;
  const variables = tab?.variables ?? EMPTY_VARIABLES;
  const sections = tab?.variableSections ?? EMPTY_SECTIONS;

  const usedKeys = useUsedVariableKeys(blocks, variables);

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

export const VariablesMirror = memo(function VariablesMirror({
  width,
}: {
  width: number;
}) {
  return (
    <KeptTabs afterPaint>{() => <TabVariablesMirror width={width} />}</KeptTabs>
  );
});
