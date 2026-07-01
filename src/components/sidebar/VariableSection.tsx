import { ElementId } from '@/common/constants/dom';
import type { Variable } from '@/common/types';
import { getActiveTab, useStore } from '@/store/store';
import { matchesQuery } from '@/utils/runbook';
import { SidebarSearch, SidebarSection } from './SidebarSection';
import { VariableRow } from './VariableRow';

const EMPTY_VARIABLES: Variable[] = [];

export function VariableSection() {
  const collapsed = useStore((s) => s.variablesSectionCollapsed);
  const toggle = useStore((s) => s.toggleVariablesSection);
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const query = useStore((s) => s.variableSearchQuery);
  const setQuery = useStore((s) => s.setVariableSearchQuery);
  const addVariable = useStore((s) => s.addVariable);

  const visible = variables.filter((v) => matchesQuery(query, v.key, v.value));

  return (
    <SidebarSection id={ElementId.VARIABLES_SECTION} title="VARIABLES" collapsed={collapsed} onToggle={toggle}>
      <SidebarSearch value={query} placeholder="Search variables…" onChange={setQuery} />
      <div id="variables-list" className="sidebar-section-list">
        {variables.length === 0 ? (
          <p className="sidebar-section-empty-msg">No variables defined.</p>
        ) : visible.length === 0 ? (
          <p className="sidebar-section-empty-msg">No matches.</p>
        ) : (
          visible.map((variable) => <VariableRow key={variable.id} variable={variable} />)
        )}
      </div>
      <div className="sidebar-section-footer">
        <button id="variable-add-btn" className="btn" onClick={() => void addVariable()} title="New variable">
          <svg viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" />
          </svg>
          New
        </button>
      </div>
    </SidebarSection>
  );
}
