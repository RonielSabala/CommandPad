import { DEBOUNCE_SAVE_MS } from "@/common/config";
import { debounce } from "@/utils/debounce";
import { createContext, useContext } from "react";
import { createStore, useStore as useZustandStore } from "zustand";

import { createInitialState } from "./initialState";
import {
  createMemoryContentDb,
  NOOP_PERSISTENCE,
  REAL_CONTENT_DB,
  type AppStoreOptions,
  type StoreKit,
} from "./kit";
import * as persistence from "./persistence";
import { createStoreServices } from "./services";
import { createBlocksSlice } from "./slices/blocks";
import { createCloudFilesSlice } from "./slices/cloudFiles";
import { createCloudSessionSlice } from "./slices/cloudSession";
import { createCloudSyncSlice } from "./slices/cloudSync";
import { createDialogsSlice } from "./slices/dialogs";
import { createEmbedsSlice } from "./slices/embeds";
import { createInteractionSlice } from "./slices/interaction";
import { createLibrarySlice } from "./slices/library";
import { createLifecycleSlice } from "./slices/lifecycle";
import { createTabsSlice } from "./slices/tabs";
import { createTransferSlice } from "./slices/transfer";
import { createUiSlice } from "./slices/ui";
import { createVariableSectionsSlice } from "./slices/variableSections";
import { createVariablesSlice } from "./slices/variables";
import { createVaultSlice } from "./slices/vault";
import type { AppStoreApi, StoreState } from "./types";
import { uiStateSnapshot } from "./uiState";

export {
  countSelectedSections,
  countVariableTargets,
  getActiveTab,
  getRunbookEmbedView,
  getRunbookView,
  hasValuesToClear
} from "./selectors";
export { tabContent } from "./tabState";
export type { AppStoreApi, StoreState, VaultPassphrases } from "./types";

export function createAppStore(options: AppStoreOptions = {}): AppStoreApi {
  const { isDemo = false, contentSeed } = options;
  const persist = isDemo ? NOOP_PERSISTENCE : persistence;
  const contentDb = isDemo
    ? createMemoryContentDb(contentSeed)
    : REAL_CONTENT_DB;

  return createStore<StoreState>()((set, get) => {
    const debouncedSaveState = debounce(
      () => get().saveState(),
      DEBOUNCE_SAVE_MS,
    );

    const kit: StoreKit = {
      set,
      get,
      isDemo,
      persist,
      contentDb,
      debouncedSaveState,
      saveTabs: () => persist.saveTabsMeta(get().tabs, get().activeTabId),
      saveLibrary: () =>
        persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId),
      saveUi: () => persist.saveUiState(uiStateSnapshot(get())),
    };

    const services = createStoreServices(kit);
    return {
      ...createInitialState(),
      ...createLifecycleSlice(kit, services),
      ...createTabsSlice(kit, services),
      ...createLibrarySlice(kit, services),
      ...createCloudSyncSlice(kit, services),
      ...createEmbedsSlice(kit, services),
      ...createVariablesSlice(kit, services),
      ...createVariableSectionsSlice(kit),
      ...createBlocksSlice(kit, services),
      ...createInteractionSlice(kit),
      ...createUiSlice(kit),
      ...createTransferSlice(kit, services),
      ...createCloudSessionSlice(kit, services),
      ...createCloudFilesSlice(kit, services),
      ...createVaultSlice(kit, services),
      ...createDialogsSlice(kit),
    };
  });
}

const appStore = createAppStore();

const StoreContext = createContext<AppStoreApi>(appStore);

export const StoreProvider = StoreContext.Provider;

export function useStoreApi(): AppStoreApi {
  return useContext(StoreContext);
}

export function useStore<T>(selector: (state: StoreState) => T): T {
  return useZustandStore(useContext(StoreContext), selector);
}
