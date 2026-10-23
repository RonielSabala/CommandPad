import {
  RunbookEmbedView,
  RunbookView,
  VariableEntryKind,
} from "@/common/enums";
import type { Tab } from "@/common/types";

import type { StoreState } from "./types";

export function getActiveTab(state: StoreState): Tab | null {
  return (
    state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0] ?? null
  );
}

export function getRunbookView(state: StoreState): RunbookView {
  return getActiveTab(state)?.view ?? RunbookView.PREVIEW;
}

export function getRunbookEmbedView(
  tab: Tab | null,
  blockId: string,
): RunbookEmbedView {
  return tab?.embedViews?.[blockId] ?? RunbookEmbedView.BLOCKS;
}

/** What a variable action acts on. */
export function targetVariableIds(
  state: StoreState,
  variableId: string,
): ReadonlySet<string> {
  return state.selectedVariableIds.has(variableId)
    ? state.selectedVariableIds
    : new Set([variableId]);
}

/** How many of `ids` are sections. */
function countSections(state: StoreState, ids: ReadonlySet<string>): number {
  let count = 0;
  for (const section of getActiveTab(state)?.variableSections ?? []) {
    if (ids.has(section.id)) {
      count++;
    }
  }

  return count;
}

/** How many of each kind `variableId`'s actions reach. */
export function countVariableTargets(
  state: StoreState,
  variableId: string,
): Record<VariableEntryKind, number> {
  const selected = state.selectedVariableIds;
  if (!selected.has(variableId)) {
    const isSection = !!getActiveTab(state)?.variableSections.some(
      (section) => section.id === variableId,
    );

    return {
      [VariableEntryKind.SECTION]: isSection ? 1 : 0,
      [VariableEntryKind.VARIABLE]: isSection ? 0 : 1,
    };
  }

  const sections = countSections(state, selected);
  return {
    [VariableEntryKind.SECTION]: sections,
    [VariableEntryKind.VARIABLE]: selected.size - sections,
  };
}

export function hasValuesToClear(
  state: StoreState,
  variableId: string,
): boolean {
  const targets = targetVariableIds(state, variableId);
  return !!getActiveTab(state)?.variables.some(
    (variable) => targets.has(variable.id) && variable.value,
  );
}

export function countSelectedSections(state: StoreState): number {
  return countSections(state, state.selectedVariableIds);
}
