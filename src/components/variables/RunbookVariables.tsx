import { CssClass } from "@/common/constants/css";
import { DataAttr, ElementId, ScrollIntoView } from "@/common/constants/dom";
import {
  PanelSide,
  RunbookView,
  SelectionGroup,
  VariableEntryKind,
  VariableKind,
} from "@/common/enums";
import { AddRow } from "@/components/common/addRow/AddRow";
import { EmptyState } from "@/components/common/EmptyState";
import { EnumIcon, SectionIcon, VariableIcon } from "@/components/icons";
import { KeptTabs } from "@/components/tabs/KeptTabs";
import { useScopedTab, useViewScope } from "@/components/tabs/tabScope";
import { Minimap } from "@/components/workspace/minimap/Minimap";
import { VariablesMirror } from "@/components/workspace/minimap/VariablesMirror";
import { WorkspaceContextMenu } from "@/components/workspace/WorkspaceContextMenu";
import { useCompletionSource } from "@/hooks/useCompletionSource";
import { useLassoSelection } from "@/hooks/useLassoSelection";
import { useRowReveal } from "@/hooks/useRowReveal";
import { useScrollingClass } from "@/hooks/useScrollingClass";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { useUsedVariableKeys } from "@/hooks/useUsedVariableKeys";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useTranslation } from "@/i18n";
import {
  EMPTY_BLOCKS,
  EMPTY_SECTIONS,
  EMPTY_VARIABLES,
  useStore,
  useStoreActions,
} from "@/store/store";
import { scrollRowIntoView } from "@/utils/dom";
import { classNames } from "@/utils/string";
import { memo, useEffect, useRef, useState } from "react";

import "./RunbookVariables.css";
import { VariableRows } from "./VariableRows";
import "./VariablesList.css";

function AddVariableRow() {
  const t = useTranslation();
  const { addVariable, addVariableSection } = useStoreActions();

  return (
    <AddRow
      label={t.variables.newRowLabel}
      items={[
        {
          key: VariableKind.TEXT,
          icon: VariableIcon,
          label: t.variables.variableLabel,
          title: t.variables.variableTitle,
          info: t.variables.variableInfo,
          onAdd: () => void addVariable(),
        },
        {
          key: VariableKind.ENUM,
          icon: EnumIcon,
          label: t.variables.enumLabel,
          title: t.variables.enumTitle,
          info: t.variables.enumInfo,
          onAdd: () => void addVariable(VariableKind.ENUM),
        },
        {
          key: VariableEntryKind.SECTION,
          icon: SectionIcon,
          label: t.variables.sectionLabel,
          title: t.variables.sectionTitle,
          info: t.variables.sectionInfo,
          onAdd: addVariableSection,
        },
      ]}
    />
  );
}

/** The variables of the tab in scope. */
const VariablesList = memo(function VariablesList({
  shown,
}: {
  shown: boolean;
}) {
  const tab = useScopedTab();
  const blocks = tab?.blocks ?? EMPTY_BLOCKS;
  const variables = tab?.variables ?? EMPTY_VARIABLES;
  const sections = tab?.variableSections ?? EMPTY_SECTIONS;

  const listRef = useRef<HTMLDivElement>(null);

  const pendingFocusVariableId = useStore(
    (state) => state.pendingFocusVariableId,
  );
  const pendingFocusSectionId = useStore(
    (state) => state.pendingFocusSectionId,
  );
  const pendingRevealVariableId = useStore(
    (state) => state.pendingRevealVariable?.id ?? null,
  );
  const { finishVariableReveal } = useStoreActions();

  useRowReveal(
    listRef,
    DataAttr.VARIABLE_ID,
    shown ? pendingRevealVariableId : null,
    finishVariableReveal,
  );

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

  const usedKeys = useUsedVariableKeys(blocks, variables);
  const completions = useCompletionSource(variables, usedKeys);

  return (
    <div
      id={shown ? ElementId.VARIABLES_LIST : undefined}
      className={classNames(CssClass.VARIABLES_LIST, CssClass.REORDER_LIST)}
      ref={listRef}
    >
      <VariableRows
        variables={variables}
        sections={sections}
        usedKeys={usedKeys}
        completions={completions}
      />
    </div>
  );
});

export function RunbookVariables() {
  const t = useTranslation();
  const { shown } = useViewScope();
  const isEmpty = useScopedTab(
    (tab) => !tab?.variables.length && !tab?.variableSections.length,
  );

  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === PanelSide.LEFT,
  );
  const showMinimap = minimapEnabled && !isEmpty;
  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu(
    CssClass.VARIABLE_ITEM,
  );

  useScrollingClass(scrollRef);
  useScrollPersistence(scrollRef, RunbookView.VARIABLES);
  useLassoSelection(shown ? root : null, SelectionGroup.VARIABLE);

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
              <span className="empty-state-glyph" aria-hidden={true}>
                {"{}"}
              </span>
            }
            title={t.variables.emptyTitle}
            hint={t.variables.emptyHint}
          />
        )}

        <KeptTabs>{(shown) => <VariablesList shown={shown} />}</KeptTabs>
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
