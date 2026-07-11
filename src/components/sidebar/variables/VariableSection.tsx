import type { Block, Variable } from "@/common/types";
import { PlusIcon } from "@/components/icons";
import { getActiveTab, useStore } from "@/store/store";
import { getUsedVariableKeys } from "@/utils/resolution";
import { matchesQuery } from "@/utils/string";
import { useMemo } from "react";
import { SidebarSearch } from "../shared/SidebarSearch";
import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { VariableRow } from "./VariableRow";

const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_BLOCKS: Block[] = [];

export function VariableSection() {
  const collapsed = useStore((state) => state.variablesSectionCollapsed);
  const toggle = useStore((state) => state.toggleVariablesSection);
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const usedKeys = useMemo(
    () => getUsedVariableKeys(blocks, variables),
    [blocks, variables],
  );
  const query = useStore((state) => state.variableSearchQuery);
  const setQuery = useStore((state) => state.setVariableSearchQuery);
  const addVariable = useStore((state) => state.addVariable);
  const visibleItems = variables.filter((variable) =>
    matchesQuery(query, variable.key, variable.value),
  );

  return (
    <SidebarSection
      id="variables-section"
      title="VARIABLES"
      collapsed={collapsed}
      onToggle={toggle}
    >
      <SidebarSearch
        value={query}
        placeholder="Search variables…"
        onChange={setQuery}
      />

      <SidebarSectionList
        items={variables}
        visibleItems={visibleItems}
        emptyMessage="No variables defined."
        getKey={(variable) => variable.id}
        renderItem={(variable) => (
          <VariableRow
            key={variable.id}
            variable={variable}
            unused={!!variable.key.trim() && !usedKeys.has(variable.key.trim())}
          />
        )}
      />

      <SidebarSectionFooter
        onClick={() => void addVariable()}
        title="New variable"
        label="New"
        icon={PlusIcon}
      />
    </SidebarSection>
  );
}
