import { DEFAULT_TAB_LABEL } from "@/common/config";
import { AppMode, EmbeddedRunbookStatus } from "@/common/enums";
import type { RunbookEntry } from "@/common/types";
import { generateId } from "@/utils/id";
import { withFolderExpanded } from "@/utils/libraryTree";
import { findTabById, findTabByRunbookId } from "@/utils/tabs";

import type { StoreKit } from "@/store/kit";
import { getActiveTab } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import { createTabObject, tabContent } from "@/store/tabState";
import type { StoreState } from "@/store/types";

type TabsActions = Pick<
  StoreState,
  "createNewTab" | "switchTab" | "closeTab" | "closeTabs" | "reorderTabs"
>;

export function createTabsSlice(
  kit: StoreKit,
  services: StoreServices,
): TabsActions {
  const { set, get, saveTabs, saveLibrary } = kit;
  const {
    embedRequests,
    setEmbeddedRunbook,
    embedsReadingRunbook,
    writeRunbookContent,
    declinedVaultSetup,
  } = services;

  return {
    createNewTab: async (folderId) => {
      if (get().mode === AppMode.READ) {
        return;
      }

      const runbookId = generateId();
      const tab = createTabObject(DEFAULT_TAB_LABEL, runbookId);
      const runbook: RunbookEntry = {
        id: runbookId,
        label: DEFAULT_TAB_LABEL,
        filename: "",
        folderId,
      };

      set((s) => ({
        tabs: [...s.tabs, tab],
        activeTabId: tab.id,
        runbookLibrary: [...s.runbookLibrary, runbook],
        libraryFolders: withFolderExpanded(s.libraryFolders, folderId),
        activeRunbookId: runbookId,
        focusedRunbookId: null,
      }));

      await writeRunbookContent(runbookId, tabContent(null));
      saveLibrary();
      saveTabs();
    },

    switchTab: (tabId) => {
      if (get().activeTabId === tabId) {
        return;
      }

      set((s) => ({
        activeTabId: tabId,
        activeRunbookId:
          getActiveTab({ ...s, activeTabId: tabId })?.runbookId ?? null,
        selectKeyHeld: false,
      }));

      saveTabs();
    },

    closeTab: (tabId) => {
      get().closeTabs([tabId]);
    },

    closeTabs: (tabIds) => {
      const state = get();
      const closing = new Set(tabIds);
      const closed = state.tabs.filter((t) => closing.has(t.id));

      if (closed.length === 0) {
        return;
      }

      const tabs = state.tabs.filter((t) => !closing.has(t.id));
      let activeTabId = state.activeTabId;

      // Keep the active tab, or fall back to its closest surviving neighbor
      if (tabs.length === 0) {
        activeTabId = null;
      } else if (activeTabId !== null && closing.has(activeTabId)) {
        const idx = state.tabs.findIndex((t) => t.id === activeTabId);
        const after = state.tabs.slice(idx).find((t) => !closing.has(t.id));
        const before = state.tabs
          .slice(0, idx)
          .reverse()
          .find((t) => !closing.has(t.id));

        activeTabId = (after ?? before ?? tabs[0]).id;
      }

      for (const tab of closed) {
        if (tab.runbookId && !findTabByRunbookId(tabs, tab.runbookId)) {
          declinedVaultSetup.delete(tab.runbookId);

          // Update the embed runbook blocks that read this tab
          for (const [key, entry] of embedsReadingRunbook(tab.runbookId)) {
            embedRequests.delete(key);
            setEmbeddedRunbook(key, {
              status: EmbeddedRunbookStatus.READY,
              content: tabContent(tab),
              ...(entry.runbookId ? { runbookId: entry.runbookId } : {}),
            });
          }
        }
      }

      set({
        tabs,
        activeTabId,
        activeRunbookId: findTabById(tabs, activeTabId)?.runbookId ?? null,
      });

      saveTabs();
    },

    reorderTabs: (sourceId, targetId, insertAfter) => {
      const tabs = [...get().tabs];
      const srcIdx = tabs.findIndex((t) => t.id === sourceId);
      if (srcIdx < 0) {
        return;
      }

      const [dragged] = tabs.splice(srcIdx, 1);
      let dstIdx = tabs.findIndex((t) => t.id === targetId);
      if (insertAfter) {
        dstIdx++;
      }

      tabs.splice(dstIdx, 0, dragged);

      set({ tabs });
      saveTabs();
    },
  };
}
