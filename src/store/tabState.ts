import {
  createDefaultScrollTop,
  DEFAULT_TAB_LABEL,
  RunbookConfig,
} from "@/common/config";
import { RunbookView } from "@/common/enums";
import type { RunbookContent, RunbookEntry, Tab } from "@/common/types";
import { generateId } from "@/utils/id";
import { getRunbookLabel } from "@/utils/runbook";
import { normalizeVariableSections } from "@/utils/variableSections";

import { getActiveTab } from "./selectors";
import type { StoreState } from "./types";

export function createTabObject(
  label = DEFAULT_TAB_LABEL,
  runbookId: string | null = null,
): Tab {
  return {
    id: generateId(),
    label,
    runbookId,
    variables: [],
    blocks: [],
    variableSections: [],
    view: RunbookView.PREVIEW,
    scrollTop: createDefaultScrollTop(),
  };
}

export function tabContent(tab: Tab | null | undefined): RunbookContent {
  return {
    blocks: tab?.blocks ?? [],
    variables: tab?.variables ?? [],
    variableSections: tab?.variableSections ?? [],
  };
}

/** A tab's content fields, read from stored content that may predate sections. */
export function contentFields(content: RunbookContent) {
  const variables = content.variables ?? [];
  return {
    blocks: content.blocks ?? [],
    variables,
    variableSections: normalizeVariableSections(
      content.variableSections,
      variables.length,
    ),
  };
}

/** Immutably replace the active tab via `mutate`. */
export function withActiveTab(
  state: StoreState,
  mutate: (tab: Tab) => Tab,
): { tabs: Tab[] } {
  const active = getActiveTab(state);
  if (!active) {
    return { tabs: state.tabs };
  }
  return { tabs: state.tabs.map((t) => (t.id === active.id ? mutate(t) : t)) };
}

/**
 * Recompute a tab's label from its blocks and mirror it into the runbook
 * library entry.
 */
export function relabelTab(
  state: StoreState,
  tab: Tab | null,
): {
  tabs: Tab[];
  runbookLibrary: RunbookEntry[];
} {
  if (!tab?.runbookId) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  const entry = state.runbookLibrary.find((item) => item.id === tab.runbookId);
  if (!entry) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  const newLabel = getRunbookLabel(
    tab.blocks,
    entry.filename || RunbookConfig.DEFAULT_LABEL,
  );

  if (newLabel === entry.label && newLabel === tab.label) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  return {
    tabs: state.tabs.map((t) =>
      t.id === tab.id ? { ...t, label: newLabel } : t,
    ),
    runbookLibrary: state.runbookLibrary.map((item) =>
      item.id === entry.id ? { ...item, label: newLabel } : item,
    ),
  };
}

export function relabelActive(state: StoreState): {
  tabs: Tab[];
  runbookLibrary: RunbookEntry[];
} {
  return relabelTab(state, getActiveTab(state));
}
