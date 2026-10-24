import type { StoreKit } from "@/store/kit";
import { createCloudBrowse } from "./cloudBrowse";
import { createCloudSave } from "./cloudSave";
import { createContentService } from "./content";
import { createEmbedLoading, createEmbedState } from "./embeds";
import { createSyncService } from "./sync";
import { createVaultFlows, createVaultRecords } from "./vault";

/** Every private helper the slices share, built in dependency order. */
export function createStoreServices(kit: StoreKit) {
  const sync = createSyncService(kit);
  const embedState = createEmbedState(kit);
  const vaultRecords = createVaultRecords(kit);
  const content = createContentService(kit, {
    ...sync,
    ...embedState,
    ...vaultRecords,
  });
  const vaultFlows = createVaultFlows(kit, {
    ...sync,
    ...embedState,
    ...vaultRecords,
    ...content,
  });
  const embedLoading = createEmbedLoading(kit, { ...content });
  const cloudSave = createCloudSave(kit, {
    ...sync,
    ...content,
    ...vaultFlows,
    ...embedLoading,
  });
  const cloudBrowse = createCloudBrowse(kit);

  const { set } = kit;
  const { syncedContent } = sync;
  const { embedRequests } = embedState;
  const { declinedVaultSetup } = vaultFlows;

  /** Empties the workspace, after its stored runbooks are gone. */
  const resetWorkspace = () => {
    syncedContent.clear();
    declinedVaultSetup.clear();
    embedRequests.clear();

    set({
      tabs: [],
      activeTabId: null,
      activeRunbookId: null,
      runbookLibrary: [],
      runbookSyncStatus: {},
      embeddedRunbooks: {},
      embeddedSectionFolds: {},
      runbookSearchQuery: "",
      variableSearchQuery: "",
      selectedBlockIds: new Set(),
      selectedVariableIds: new Set(),
      focusedRunbookId: null,
    });
  };

  return {
    ...sync,
    ...embedState,
    ...vaultRecords,
    ...content,
    ...vaultFlows,
    ...embedLoading,
    ...cloudSave,
    ...cloudBrowse,
    resetWorkspace,
  };
}

export type StoreServices = ReturnType<typeof createStoreServices>;
