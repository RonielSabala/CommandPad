import { createDefaultScrollTop, DEFAULT_TAB_LABEL } from "@/common/config";
import { RunbookView } from "@/common/enums";
import type { Block, RunbookContent, RunbookEntry, Tab } from "@/common/types";
import { generateId } from "@/utils/id";
import { getRunbookLabel } from "@/utils/runbook";
import { normalizeVariableSections } from "@/utils/variableSections";

import { withLibraryEntry } from "./libraryState";
import { getActiveTab, getLibraryEntry, getTabByRunbookId } from "./selectors";
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

/** The label an entry shows. */
export function entryLabel(
  entry: RunbookEntry,
  blocks: Block[] | undefined,
): string {
  return entry.named ? entry.label : getRunbookLabel(blocks, entry.filename);
}

/** Give a runbook `label` on its library entry and its tab. */
export function labelRunbook(
  state: StoreState,
  runbookId: string,
  label: string,
  named: boolean,
): Pick<StoreState, "tabs" | "runbookLibrary"> {
  const { tabs, runbookLibrary } = state;
  const pinned = named || undefined;
  const entry = getLibraryEntry(state, runbookId);
  const tab = getTabByRunbookId(state, runbookId);

  return {
    tabs:
      tab && tab.label !== label
        ? tabs.map((t) => (t === tab ? { ...t, label } : t))
        : tabs,
    runbookLibrary:
      entry && (entry.label !== label || entry.named !== pinned)
        ? withLibraryEntry(state, runbookId, (item) => ({
            ...item,
            label,
            named: pinned,
          })).runbookLibrary
        : runbookLibrary,
  };
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

  const newLabel = entryLabel(entry, tab.blocks);
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

/** `withActiveTab`, then relabel, since the edit may change the first block. */
export function withActiveTabRelabeled(
  state: StoreState,
  mutate: (tab: Tab) => Tab,
): {
  tabs: Tab[];
  runbookLibrary: RunbookEntry[];
} {
  const updated = withActiveTab(state, mutate);
  return { ...updated, ...relabelActive({ ...state, ...updated }) };
}
