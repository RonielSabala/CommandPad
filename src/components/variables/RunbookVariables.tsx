import { CssClass } from "@/common/constants/css";
import { ElementId } from "@/common/constants/dom";
import { PanelSide, RunbookView, SelectionGroup } from "@/common/enums";
import type { Block, Variable } from "@/common/types";
import { EmptyState } from "@/components/common/EmptyState";
import { PlusIcon } from "@/components/icons";
import { Minimap } from "@/components/workspace/minimap/Minimap";
import { VariablesMirror } from "@/components/workspace/minimap/VariablesMirror";
import { WorkspaceContextMenu } from "@/components/workspace/WorkspaceContextMenu";
import { useLassoSelection } from "@/hooks/useLassoSelection";
import { useScrollPersistence } from "@/hooks/useScrollPersistence";
import { useWorkspaceContextMenu } from "@/hooks/useWorkspaceContextMenu";
import { useTranslation } from "@/i18n";
import { buildVariableCompletions } from "@/monaco/completions";
import { getActiveTab, useStore } from "@/store/store";
import {
  getSecretKeys,
  getUsedVariableKeys,
  getVariableMap,
  isVariableUnused,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useMemo, useRef, useState } from "react";

import "./RunbookVariables.css";
import { VariableItem } from "./VariableItem";

const EMPTY_VARIABLES: Variable[] = [];
const EMPTY_BLOCKS: Block[] = [];

function AddVariableRow() {
  const t = useTranslation();
  const addVariable = useStore((state) => state.addVariable);

  return (
    <div id="add-variable-row">
      <button className="btn" onClick={() => void addVariable()}>
        <PlusIcon className="icon-md icon-bold" />
        {t.variables.newTitle}
      </button>
    </div>
  );
}

export function RunbookVariables() {
  const t = useTranslation();
  const activeTab = useStore(getActiveTab);
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;

  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === PanelSide.LEFT,
  );
  const showMinimap = minimapEnabled && variables.length > 0;
  const { menuAnchor, onContextMenu, closeMenu } = useWorkspaceContextMenu(
    CssClass.VARIABLE_ITEM,
  );

  useLassoSelection(root, SelectionGroup.VARIABLE);
  useScrollPersistence(scrollRef, RunbookView.VARIABLES);

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
        {variables.length === 0 && (
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

        <div id={ElementId.VARIABLES_LIST}>
          {variables.map((variable) => (
            <VariableItem
              key={variable.id}
              variable={variable}
              completions={completions}
              unused={isVariableUnused(variable, usedKeys)}
            />
          ))}
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
