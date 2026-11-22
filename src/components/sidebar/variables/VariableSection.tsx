import { CssClass, STANDARD_ICON_CLASS } from "@/common/constants/css";
import { VariableKind } from "@/common/enums";
import { SearchInput } from "@/components/common/SearchInput";
import { EnumIcon, VariableIcon } from "@/components/icons";
import { KeptTabs } from "@/components/tabs/KeptTabs";
import { useScopedTab } from "@/components/tabs/tabScope";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { useTranslation } from "@/i18n";
import {
  EMPTY_BLOCKS,
  EMPTY_VARIABLES,
  useStore,
  useStoreActions,
} from "@/store/store";
import { isVariableUnused } from "@/utils/resolution";
import { matchesQuery } from "@/utils/string";
import { memo, useState } from "react";

import { SidebarSection } from "../shared/SidebarSection";
import { SidebarSectionFooter } from "../shared/SidebarSectionFooter";
import { SidebarSectionList } from "../shared/SidebarSectionList";
import { VariableRow } from "./VariableRow";

/** The variables of the tab in scope. */
const VariableList = memo(function VariableList({ shown }: { shown: boolean }) {
  const t = useTranslation();
  const tab = useScopedTab();

  const blocks = tab?.blocks ?? EMPTY_BLOCKS;
  const variables = tab?.variables ?? EMPTY_VARIABLES;
  const usedKeys = useUsedVariableKeys(blocks, variables);

  // A hidden list keeps its rows while the search changes, and catches up once shown
  const liveQuery = useStore((state) =>
    shown ? state.variableSearchQuery : null,
  );
  const [query, setQuery] = useState(liveQuery ?? "");
  if (liveQuery !== null && liveQuery !== query) {
    setQuery(liveQuery);
  }

  const visibleItems = variables.filter((variable) =>
    matchesQuery(query, variable.key, variable.value),
  );
  const showSecretColumn = visibleItems.some((variable) => variable.secret);

  return (
    <SidebarSectionList
      className={CssClass.VARIABLE_ROWS}
      isEmpty={variables.length === 0}
      visibleItems={visibleItems}
      emptyMessage={t.variables.empty}
      getKey={(variable) => variable.id}
      renderItem={(variable) => (
        <VariableRow
          key={variable.id}
          variable={variable}
          unused={isVariableUnused(variable, usedKeys)}
          showSecretColumn={showSecretColumn}
        />
      )}
    />
  );
});

export function VariableSection() {
  const t = useTranslation();
  const query = useStore((state) => state.variableSearchQuery);
  const collapsed = useStore((state) => state.variablesSectionCollapsed);
  const {
    toggleVariablesSection: toggle,
    setVariableSearchQuery: setQuery,
    addVariable,
  } = useStoreActions();

  return (
    <SidebarSection
      id="variables-section"
      title={t.variables.title}
      collapsed={collapsed}
      onToggle={toggle}
    >
      <SearchInput
        value={query}
        placeholder={t.variables.searchPlaceholder}
        onChange={setQuery}
      />

      <KeptTabs className="sidebar-kept-lists">
        {(shown) => <VariableList shown={shown} />}
      </KeptTabs>

      <SidebarSectionFooter
        onClick={() => void addVariable()}
        title={t.variables.newTitle}
        label={t.variables.variableLabel}
        icon={<VariableIcon className={STANDARD_ICON_CLASS} />}
        secondaryAction={{
          onClick: () => void addVariable(VariableKind.ENUM),
          title: t.variables.newEnumTitle,
          label: t.variables.enumLabel,
          icon: <EnumIcon className={STANDARD_ICON_CLASS} />,
        }}
      />
    </SidebarSection>
  );
}
