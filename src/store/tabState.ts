import { createDefaultScrollTop, DEFAULT_TAB_LABEL } from "@/common/config";
import { RunbookView } from "@/common/enums";
import type {
  Block,
  LibraryRunbook,
  RunbookContent,
  Tab,
} from "@/common/types";
import { generateId } from "@/utils/id";
import { getRunbookLabel } from "@/utils/runbook";
import { normalizeVariableSections } from "@/utils/variableSections";

import { withLibraryRunbook } from "./libraryState";
import {
  getActiveTab,
  getLibraryRunbook,
  getTabByRunbookId,
} from "./selectors";
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

/** The label a library runbook shows. */
export function libraryRunbookLabel(
  runbook: LibraryRunbook,
  blocks: Block[] | undefined,
): string {
  return runbook.named
    ? runbook.label
    : getRunbookLabel(blocks, runbook.filename);
}

/** Give a runbook `label` in the library and on its tab. */
export function labelRunbook(
  state: StoreState,
  runbookId: string,
  label: string,
  named: boolean,
): Pick<StoreState, "tabs" | "libraryRunbooks"> {
  const { tabs, libraryRunbooks } = state;
  const pinned = named || undefined;
  const runbook = getLibraryRunbook(state, runbookId);
  const tab = getTabByRunbookId(state, runbookId);

  return {
    tabs:
      tab && tab.label !== label
        ? tabs.map((t) => (t === tab ? { ...t, label } : t))
        : tabs,
    libraryRunbooks:
      runbook && (runbook.label !== label || runbook.named !== pinned)
        ? withLibraryRunbook(state, runbookId, (r) => ({
            ...r,
            label,
            named: pinned,
          })).libraryRunbooks
        : libraryRunbooks,
  };
}

/**
 * Recompute a tab's label from its blocks and mirror it into the
 * library runbook.
 */
export function relabelTab(
  state: StoreState,
  tab: Tab | null,
): {
  tabs: Tab[];
  libraryRunbooks: LibraryRunbook[];
} {
  if (!tab?.runbookId) {
    return { tabs: state.tabs, libraryRunbooks: state.libraryRunbooks };
  }

  const runbook = state.libraryRunbooks.find((r) => r.id === tab.runbookId);
  if (!runbook) {
    return { tabs: state.tabs, libraryRunbooks: state.libraryRunbooks };
  }

  const newLabel = libraryRunbookLabel(runbook, tab.blocks);
  if (newLabel === runbook.label && newLabel === tab.label) {
    return { tabs: state.tabs, libraryRunbooks: state.libraryRunbooks };
  }

  return {
    tabs: state.tabs.map((t) =>
      t.id === tab.id ? { ...t, label: newLabel } : t,
    ),
    libraryRunbooks: state.libraryRunbooks.map((r) =>
      r.id === runbook.id ? { ...r, label: newLabel } : r,
    ),
  };
}

export function relabelActive(state: StoreState): {
  tabs: Tab[];
  libraryRunbooks: LibraryRunbook[];
} {
  return relabelTab(state, getActiveTab(state));
}

/** `withActiveTab`, then relabel, since the edit may change the first block. */
export function withActiveTabRelabeled(
  state: StoreState,
  mutate: (tab: Tab) => Tab,
): {
  tabs: Tab[];
  libraryRunbooks: LibraryRunbook[];
} {
  const updated = withActiveTab(state, mutate);
  return { ...updated, ...relabelActive({ ...state, ...updated }) };
}
