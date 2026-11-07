import { AppMode, DialogTone } from "@/common/enums";
import type { Tab } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { lockVault } from "@/services/vault";
import { findTabById } from "@/utils/tabs";

import type { StoreKit } from "@/store/kit";
import * as persistence from "@/store/persistence";
import { deleteRunbookDb } from "@/store/runbookDb";
import { getActiveTab } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import { contentFields, tabContent } from "@/store/tabState";
import type { StoreState } from "@/store/types";

type LifecycleActions = Pick<
  StoreState,
  "saveState" | "bootstrap" | "clearRunbookLibrary" | "clearAllData"
>;

export function createLifecycleSlice(
  kit: StoreKit,
  services: StoreServices,
): LifecycleActions {
  const { set, get, isDemo, contentDb, saveTabs, saveLibrary, saveUi } = kit;
  const {
    trackCloudChanges,
    refreshVaultStatus,
    persistTabContent,
    promptUnlockForActiveTab,
    resetWorkspace,
  } = services;

  let bootstrapped = false;

  return {
    saveState: () => {
      const state = get();
      if (!state.initialized) {
        return;
      }

      saveTabs();
      saveLibrary();
      saveUi();

      const active = getActiveTab(state);
      if (active?.runbookId) {
        persistTabContent(active.runbookId, active);
      }
    },

    bootstrap: async () => {
      if (bootstrapped) {
        return;
      }
      bootstrapped = true;

      const ui = persistence.loadUiState();
      const library = persistence.loadRunbookLibrary(
        getMessages(ui?.language ?? get().language),
      );
      const sections = persistence.loadSidebarSections();
      const meta = persistence.loadTabsMeta();

      const activeTabMeta = meta
        ? (meta.tabOrder.find((tab) => tab.tabId === meta.activeTabId) ??
          meta.tabOrder[0])
        : undefined;

      const initialActiveRunbookId =
        activeTabMeta?.runbookId ?? library?.activeId ?? null;

      set({
        ...(ui ?? {}),
        ...(library
          ? {
              libraryFolders: library.folders,
              libraryRunbooks: library.runbooks,
            }
          : {}),
        activeRunbookId: initialActiveRunbookId,
        ...(sections ?? {}),
      });

      try {
        if (meta) {
          const currentRunbooks = get().libraryRunbooks;
          const loadedTabs: Tab[] = [];

          for (const {
            tabId,
            runbookId,
            view,
            scrollTop,
            embedViews,
          } of meta.tabOrder) {
            const runbook = currentRunbooks.find((r) => r.id === runbookId);
            if (!runbook || runbookId === null) {
              continue;
            }

            const content = await contentDb.get(runbookId);
            if (!content) {
              continue;
            }

            loadedTabs.push({
              id: tabId,
              label: runbook.label,
              runbookId,
              ...contentFields(content),
              view: persistence.restoreRunbookView(view),
              embedViews: persistence.restoreEmbedViews(embedViews),
              scrollTop: persistence.restoreScrollTop(scrollTop),
            });
          }

          if (loadedTabs.length > 0) {
            const activeId =
              meta.activeTabId &&
              loadedTabs.some((t) => t.id === meta.activeTabId)
                ? meta.activeTabId
                : loadedTabs[0].id;

            const activeTab = findTabById(loadedTabs, activeId);
            set({
              tabs: loadedTabs,
              activeTabId: activeId,
              activeRunbookId: activeTab?.runbookId ?? null,
            });
          }
        }
      } catch (error) {
        console.warn("Failed to rehydrate tabs:", error);
      }

      set({ initialized: true });
      refreshVaultStatus();
      await promptUnlockForActiveTab();

      for (const tab of get().tabs) {
        if (tab.runbookId) {
          trackCloudChanges(tab.runbookId, tabContent(tab));
        }
      }
    },

    clearRunbookLibrary: async () => {
      if (get().mode === AppMode.READ) {
        return;
      }

      set({ selectKeyHeld: false });
      const t = getMessages(get().language);
      const confirmed = await get().confirm(t.dialogs.clearLibraryMessage, {
        title: t.dialogs.clearLibraryTitle,
        confirmLabel: t.dialogs.clearLibraryConfirm,
        tone: DialogTone.DANGER,
      });

      if (!confirmed) {
        return;
      }

      // Drops runbook content only
      if (!isDemo) {
        await deleteRunbookDb();
        persistence.clearStoredRunbooks();
      }

      resetWorkspace();
    },

    clearAllData: async () => {
      set({ selectKeyHeld: false });
      const t = getMessages(get().language);
      const confirmed = await get().confirm(t.dialogs.resetMessage, {
        title: t.dialogs.resetTitle,
        confirmLabel: t.dialogs.resetConfirm,
        tone: DialogTone.DANGER,
      });

      if (!confirmed) {
        return false;
      }

      // Never let a demo store wipe the user's real data
      if (!isDemo) {
        await deleteRunbookDb();
        localStorage.clear();
        sessionStorage.clear();

        lockVault();
        set({ vaultStatus: {} });
      }

      resetWorkspace();
      return true;
    },
  };
}
