import {
  RunbookEmbedView,
  RunbookView,
  SortDirection,
  VariableEntryKind,
} from "@/common/enums";
import type {
  Block,
  RunbookEntry,
  Tab,
  Variable,
  VariableSection,
} from "@/common/types";

import type { StoreState } from "./types";

export const EMPTY_BLOCKS: Block[] = [];
export const EMPTY_VARIABLES: Variable[] = [];
export const EMPTY_SECTIONS: VariableSection[] = [];

export function getActiveTab(state: StoreState): Tab | null {
  return (
    state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0] ?? null
  );
}

export function getActiveBlocks(state: StoreState): Block[] {
  return getActiveTab(state)?.blocks ?? EMPTY_BLOCKS;
}

export function getActiveVariables(state: StoreState): Variable[] {
  return getActiveTab(state)?.variables ?? EMPTY_VARIABLES;
}

export function getActiveRunbookId(state: StoreState): string | null {
  return getActiveTab(state)?.runbookId ?? null;
}

export function getRunbookTab(
  state: StoreState,
  runbookId: string,
): Tab | undefined {
  return state.tabs.find((t) => t.runbookId === runbookId);
}

const openRunbookIds = new WeakMap<
  readonly Tab[],
  ReadonlySet<string | null>
>();

/** Whether a tab shows `runbookId`. */
export function isRunbookOpen(state: StoreState, runbookId: string): boolean {
  const tabs = state.tabs;
  let ids = openRunbookIds.get(tabs);
  if (!ids) {
    ids = new Set(tabs.map((tab) => tab.runbookId));
    openRunbookIds.set(tabs, ids);
  }

  return ids.has(runbookId);
}

export function getLibraryEntry(
  state: StoreState,
  runbookId: string,
): RunbookEntry | undefined {
  return state.runbookLibrary.find((entry) => entry.id === runbookId);
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

/** Whether a block action acts on the whole block selection. */
export function actsOnBlockSelection(
  state: StoreState,
  blockId: string,
): boolean {
  return state.selectedBlockIds.has(blockId);
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

/** Whether any variable a row action on `variableId` targets passes `test`. */
function someTargetVariable(
  state: StoreState,
  variableId: string,
  test: (variable: Variable) => unknown,
): boolean {
  const targets = targetVariableIds(state, variableId);
  return !!getActiveTab(state)?.variables.some(
    (variable) => targets.has(variable.id) && test(variable),
  );
}

export function hasValuesToClear(
  state: StoreState,
  variableId: string,
): boolean {
  return someTargetVariable(state, variableId, (variable) => variable.value);
}

const OPTION_ORDER = new Intl.Collator(undefined, { numeric: true });
const OPTION_SIGN = {
  [SortDirection.ASC]: 1,
  [SortDirection.DESC]: -1,
} as const;

function compareOptions(
  a: string,
  b: string,
  direction: SortDirection,
): number {
  return OPTION_SIGN[direction] * OPTION_ORDER.compare(a, b);
}

/** Whether an enum's options are out of `direction` order. */
function isOutOfOrder(variable: Variable, direction: SortDirection): boolean {
  const { options } = variable;
  return !!options?.some(
    (option, index) =>
      index > 0 && compareOptions(options[index - 1], option, direction) > 0,
  );
}

export function sortedOptions(
  variable: Variable,
  direction: SortDirection,
): string[] | null {
  return variable.options && isOutOfOrder(variable, direction)
    ? [...variable.options].sort((a, b) => compareOptions(a, b, direction))
    : null;
}

/** Only an enum's selected option. */
export function selectedOptionOnly(variable: Variable): string[] | null {
  const { options, value } = variable;
  return options && options.length > 1 && options.includes(value)
    ? [value]
    : null;
}

export function hasOptionsToSort(
  state: StoreState,
  variableId: string,
  direction: SortDirection,
): boolean {
  return someTargetVariable(state, variableId, (variable) =>
    isOutOfOrder(variable, direction),
  );
}

export function hasOtherOptions(
  state: StoreState,
  variableId: string,
): boolean {
  return someTargetVariable(state, variableId, selectedOptionOnly);
}

export function countSelectedSections(state: StoreState): number {
  return countSections(state, state.selectedVariableIds);
}
