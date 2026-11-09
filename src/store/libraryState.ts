import { DialogTone } from "@/common/enums";
import type { LibraryFolder, LibraryRunbook, Tab } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import type { Messages } from "@/i18n/types";
import {
  uniqueRunbookLabel,
  visibleRunbooks,
  withFolderExpanded,
} from "@/utils/libraryTree";
import { findTabById } from "@/utils/tabs";

import { getLibraryRunbook } from "./selectors";
import type { StoreState } from "./types";

/** `label`, numbered if a runbook in `folderId` already shows it. */
export function uniqueLabelIn(
  state: StoreState,
  folderId: string | undefined,
  label: string,
  exceptId?: string,
): string {
  return uniqueRunbookLabel(
    state.libraryRunbooks,
    folderId,
    label,
    getMessages(state.language),
    exceptId,
  );
}

/** Offer the numbered name `message` proposes, calling `accept` if taken. */
export function offerNumberedName(
  state: StoreState,
  message: (t: Messages) => string,
  accept: () => void,
): void {
  const t = getMessages(state.language);

  void state
    .confirm(message(t), {
      title: t.dialogs.nameTakenTitle,
      confirmLabel: t.dialogs.nameTakenConfirm,
      tone: DialogTone.INFO,
    })
    .then((accepted) => accepted && accept());
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

/** Replace one library runbook. */
export function withLibraryRunbook(
  state: StoreState,
  runbookId: string,
  patch: (runbook: LibraryRunbook) => LibraryRunbook,
): Pick<StoreState, "libraryRunbooks"> {
  return {
    libraryRunbooks: state.libraryRunbooks.map((runbook) =>
      runbook.id === runbookId ? patch(runbook) : runbook,
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

/** Where runbook focus lands once the runbooks are gone. */
function focusAfterRemoval(
  state: StoreState,
  runbookIds: ReadonlySet<string>,
): string | null {
  const focused = state.focusedRunbookId;
  if (focused === null || !runbookIds.has(focused)) {
    return focused;
  }

  const visible = visibleRunbooks(
    state.libraryFolders,
    state.libraryRunbooks,
    state.runbookSearchQuery,
  );

  if (!visible.some((runbook) => runbook.id === focused)) {
    return null;
  }

  const isRemoved = (runbook: LibraryRunbook) => runbookIds.has(runbook.id);
  const survivors = visible.filter((runbook) => !isRemoved(runbook));

  return nearestSurvivor(visible, survivors, focused, isRemoved)?.id ?? null;
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
  | "libraryFolders"
  | "libraryRunbooks"
  | "focusedRunbookId"
> {
  const isRemoved = (r: LibraryRunbook) => runbookIds.has(r.id);
  const isClosed = (tab: Tab) =>
    tab.runbookId !== null && runbookIds.has(tab.runbookId);

  const libraryRunbooks = state.libraryRunbooks.filter(
    (runbook) => !isRemoved(runbook),
  );
  const tabs = state.tabs.some(isClosed)
    ? state.tabs.filter((tab) => !isClosed(tab))
    : state.tabs;

  const activeTab =
    findTabById(tabs, state.activeTabId) ??
    (tabs === state.tabs
      ? undefined
      : nearestSurvivor(state.tabs, tabs, state.activeTabId, isClosed));

  const activeTabId = activeTab?.id ?? null;
  const activeRunbookId = activeTab?.runbookId ?? null;
  const revealedFolderId =
    activeRunbookId && activeTabId !== state.activeTabId
      ? getLibraryRunbook(state, activeRunbookId)?.folderId
      : undefined;

  return {
    tabs,
    activeTabId,
    activeRunbookId,
    libraryFolders: withFolderExpanded(state.libraryFolders, revealedFolderId),
    libraryRunbooks,
    focusedRunbookId: focusAfterRemoval(state, runbookIds),
  };
}
