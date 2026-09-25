import { CssClass } from "@/common/constants/css";
import { DataAttr, ElementId, ScrollIntoView } from "@/common/constants/dom";
import {
  PanelSide,
  RunbookView,
  SelectionGroup,
  VariableEntryKind,
} from "@/common/enums";
import type { Block, Variable, VariableSection } from "@/common/types";
import { AddRow } from "@/components/common/AddRow";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionIcon, VariableIcon } from "@/components/icons";
import { Minimap } from "@/components/workspace/minimap/Minimap";
import { VariablesMirror } from "@/components/workspace/minimap/VariablesMirror";
import { WorkspaceContextMenu } from "@/components/workspace/WorkspaceContextMenu";
import { useLassoSelection } from "@/hooks/useLassoSelection";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useTranslation } from "@/i18n";
import { buildVariableCompletions } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import { scrollRowIntoView } from "@/utils/dom";
import {
  getSecretKeys,
  getUsedVariableKeys,
  getVariableMap,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useEffect, useMemo, useRef, useState } from "react";

import "./RunbookVariables.css";
import { VariableRows } from "./VariableRows";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_SECTIONS: VariableSection[] = [];

function AddVariableRow() {
  const t = useTranslation();
  const addVariable = useStore((state) => state.addVariable);
  const addVariableSection = useStore((state) => state.addVariableSection);

  return (
    <AddRow
      label={t.variables.newRowLabel}
      items={[
        {
          key: VariableEntryKind.VARIABLE,
          icon: VariableIcon,
          label: t.variables.variableLabel,
          title: t.variables.newTitle,
          onAdd: addVariable,
        },
        {
          key: VariableEntryKind.SECTION,
          icon: SectionIcon,
          label: t.variables.sectionLabel,
          title: t.variables.newSection,
          onAdd: addVariableSection,
        },
      ]}
    />
  );
}

export function RunbookVariables() {
  const t = useTranslation();
  const activeTab = useStore(getActiveTab);

  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const sections = activeTab?.variableSections ?? EMPTY_SECTIONS;

  const isEmpty = variables.length === 0 && sections.length === 0;

  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pendingFocusVariableId = useStore(
    (state) => state.pendingFocusVariableId,
  );
  const pendingFocusSectionId = useStore(
    (state) => state.pendingFocusSectionId,
  );

  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === PanelSide.LEFT,
  );
  const showMinimap = minimapEnabled && !isEmpty;
  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu(
    CssClass.VARIABLE_ITEM,
  );

  useLassoSelection(root, SelectionGroup.VARIABLE);
  useScrollPersistence(scrollRef, RunbookView.VARIABLES);

  useEffect(() => {
    scrollRowIntoView(
      listRef.current,
      DataAttr.VARIABLE_ID,
      pendingFocusVariableId,
      ScrollIntoView.BLOCK_CENTER,
    );
  }, [pendingFocusVariableId]);

  useEffect(() => {
    scrollRowIntoView(
      listRef.current,
      DataAttr.VARIABLE_ID,
      pendingFocusSectionId,
      ScrollIntoView.BLOCK_CENTER,
    );
  }, [pendingFocusSectionId]);

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
    <div
      id="runbook-variables-wrapper"
      className={classNames(
        CssClass.MINIMAP_HOST,
        showMinimap && CssClass.MINIMAP_ON,
        minimapOnLeft && CssClass.MINIMAP_LEFT,
      )}
      onContextMenu={onContextMenu}
    >
      <div
        id="runbook-variables"
        className={CssClass.MINIMAP_SCROLLER}
        ref={(node) => {
          scrollRef.current = node;
          setRoot(node);
        }}
      >
        {isEmpty && (
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

        <div id={ElementId.VARIABLES_LIST} ref={listRef}>
          <VariableRows
            variables={variables}
            sections={sections}
            usedKeys={usedKeys}
            completions={completions}
          />
        </div>

        <AddVariableRow />
      </div>

      {showMinimap && (
        <Minimap
          scrollRef={scrollRef}
          listId={ElementId.VARIABLES_LIST}
          mirror={VariablesMirror}
        />
      )}

      {menuAnchor && (
        <WorkspaceContextMenu anchor={menuAnchor} onClose={closeMenu} />
      )}
    </div>
  );
}
