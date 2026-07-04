import type { Variable } from "@/common/types";
import { getActiveTab, useStore } from "@/store/store";
import { matchesQuery } from "@/utils/runbook";
import { SidebarSearch } from "../shared/SidebarSearch";
import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { VariableRow } from "./VariableRow";

const EMPTY_VARIABLES: Variable[] = [];

export function VariableSection() {
  const collapsed = useStore((state) => state.variablesSectionCollapsed);
  const toggle = useStore((state) => state.toggleVariablesSection);
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
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
        placeholder="Search variables..."
        onChange={setQuery}
      />

      <SidebarSectionList
        items={variables}
        visibleItems={visibleItems}
        emptyMessage="No variables defined."
        getKey={(variable) => variable.id}
        renderItem={(variable) => (
          <VariableRow key={variable.id} variable={variable} />
        )}
      />

      <SidebarSectionFooter
        onClick={() => void addVariable()}
        title="New variable"
        label="New"
        icon={<path d="M8 3v10M3 8h10" />}
      />
    </SidebarSection>
  );
}
