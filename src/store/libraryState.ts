import type { LibraryFolder, RunbookEntry, Tab } from "@/common/types";
import { findTabById } from "@/utils/tabs";

import type { StoreState } from "./types";

/** Replace one runbook library entry. */
export function withLibraryEntry(
  state: StoreState,
  runbookId: string,
  patch: (entry: RunbookEntry) => RunbookEntry,
): Pick<StoreState, "runbookLibrary"> {
  return {
    runbookLibrary: state.runbookLibrary.map((runbook) =>
      runbook.id === runbookId ? patch(runbook) : runbook,
    ),
  };
}

/** Replace one library folder. */
export function withLibraryFolder(
  state: StoreState,
  folderId: string,
  patch: (folder: LibraryFolder) => LibraryFolder,
): Pick<StoreState, "libraryFolders"> {
  return {
    libraryFolders: state.libraryFolders.map((folder) =>
      folder.id === folderId ? patch(folder) : folder,
    ),
  };
}

/** The survivor that takes the place of the removed item `id`. */
function nearestSurvivor<T extends { id: string }>(
  items: readonly T[],
  survivors: readonly T[],
  id: string | null,
  isRemoved: (item: T) => boolean,
): T | undefined {
  let survivorsBefore = 0;

  for (const item of items) {
    if (item.id === id) {
      break;
    }

    if (!isRemoved(item)) {
      survivorsBefore++;
    }
  }

  return survivors[Math.min(survivorsBefore, survivors.length - 1)];
}

/** Drop runbooks from the library and close their tabs. */
export function withoutRunbooks(
  state: StoreState,
  runbookIds: ReadonlySet<string>,
): Pick<
  StoreState,
  | "tabs"
  | "activeTabId"
  | "activeRunbookId"
  | "runbookLibrary"
  | "focusedRunbookId"
> {
  const isRemoved = (runbook: RunbookEntry) => runbookIds.has(runbook.id);
  const isClosed = (tab: Tab) =>
    tab.runbookId !== null && runbookIds.has(tab.runbookId);

  const runbookLibrary = state.runbookLibrary.filter((r) => !isRemoved(r));
  const tabs = state.tabs.some(isClosed)
    ? state.tabs.filter((tab) => !isClosed(tab))
    : state.tabs;

  const activeTab =
    findTabById(tabs, state.activeTabId) ??
    (tabs === state.tabs
      ? undefined
      : nearestSurvivor(state.tabs, tabs, state.activeTabId, isClosed));

  const focused = state.focusedRunbookId;
  const focusedRunbookId =
    focused !== null && runbookIds.has(focused)
      ? (nearestSurvivor(
          state.runbookLibrary,
          runbookLibrary,
          focused,
          isRemoved,
        )?.id ?? null)
      : focused;

  return {
    tabs,
    activeTabId: activeTab?.id ?? null,
    activeRunbookId: activeTab?.runbookId ?? null,
    runbookLibrary,
    focusedRunbookId,
  };
}
