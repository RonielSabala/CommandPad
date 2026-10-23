import {
  CloudSortColumn,
  DialogTone,
  HistoryDirection,
  RunbookSyncStatus,
  SortDirection,
} from "@/common/enums";
import { getMessages } from "@/i18n/messages";
import {
  clearCachedCloudEntries,
  getCloudClient,
  walkCloudTree,
} from "@/services/cloud";

import { ROOT_CLOUD_PATH } from "@/store/cloudPaths";
import type { StoreKit } from "@/store/kit";
import type { StoreServices } from "@/store/services";
import type { StoreState } from "@/store/types";

type CloudSessionActions = Pick<
  StoreState,
  | "startCloudBrowse"
  | "startCloudImportBrowse"
  | "returnToDestinationModal"
  | "closeCloudImportModal"
  | "signInToCloud"
  | "signOutOfCloud"
  | "refreshCloudEntries"
  | "openCloudFolder"
  | "navigateCloudToDepth"
  | "navigateCloudToPath"
  | "navigateCloudHistory"
  | "setCloudSearchQuery"
  | "toggleCloudSort"
  | "refreshCloudSearchEntries"
>;

export function createCloudSessionSlice(
  kit: StoreKit,
  services: StoreServices,
): CloudSessionActions {
  const { set, get } = kit;
  const {
    startCloudRequest,
    lastBrowsedCloudPath,
    startCloudSearchRequest,
    isCurrentCloudSearchRequest,
    clearedCloudSearch,
    clearedCloudListing,
    loadCloudEntries,
  } = services;

  return {
    startCloudBrowse: async (provider, path = ROOT_CLOUD_PATH) => {
      const startPath = lastBrowsedCloudPath.get(provider) ?? path;

      startCloudRequest();
      set({
        ...clearedCloudListing(),
        cloudProvider: provider,
        cloudError: null,
        cloudEntries: [],
        cloudSignedIn: false,
        cloudAccountLabel: null,
        cloudFileEditor: null,
        cloudLoading: true,
        cloudPath: startPath,
        cloudHistory: [startPath],
        cloudHistoryIndex: 0,
      });

      const client = getCloudClient(provider);
      try {
        await client.init();
      } finally {
        if (get().cloudProvider === provider) {
          set({
            cloudLoading: false,
            cloudSignedIn: client.isSignedIn(),
            cloudAccountLabel: client.getAccountLabel(),
          });
        }
      }

      if (client.isSignedIn() && get().cloudProvider === provider) {
        await loadCloudEntries();
      }
    },

    startCloudImportBrowse: async (provider) => {
      set({ cloudImportModalOpen: true });
      await get().startCloudBrowse(provider);
    },

    returnToDestinationModal: () =>
      set({ cloudImportModalOpen: false, destinationModalOpen: true }),

    closeCloudImportModal: () => set({ cloudImportModalOpen: false }),

    signInToCloud: async () => {
      const client = getCloudClient(get().cloudProvider);
      set({ cloudLoading: true, cloudError: null });
      try {
        await client.signIn();
        set({
          cloudSignedIn: client.isSignedIn(),
          cloudAccountLabel: client.getAccountLabel(),
        });
        await get().refreshCloudEntries();
      } catch (error) {
        console.error("Cloud sign-in failed", error);
        set({
          cloudError: getMessages(get().language).cloudModal.signInError,
        });
      } finally {
        set({ cloudLoading: false });
      }
    },

    signOutOfCloud: async () => {
      const t = getMessages(get().language);
      const confirmed = await get().confirm(t.dialogs.signOutCloudMessage, {
        title: t.dialogs.signOutCloudTitle,
        confirmLabel: t.dialogs.signOutCloudConfirm,
        tone: DialogTone.INFO,
      });

      if (!confirmed) {
        return;
      }

      const client = getCloudClient(get().cloudProvider);
      try {
        await client.signOut();
      } catch (error) {
        console.error("Cloud sign-out failed", error);
      }

      // Nothing walked under this account survives into the next one
      clearCachedCloudEntries(get().cloudProvider);
      lastBrowsedCloudPath.delete(get().cloudProvider);
      startCloudRequest();
      set((s) => ({
        ...clearedCloudListing(),
        runbookSyncStatus: {
          ...s.runbookSyncStatus,
          // Linked runbooks can no longer reach this provider until a new sign-in
          ...Object.fromEntries(
            s.runbookLibrary
              .filter((item) => item.sync?.provider === s.cloudProvider)
              .map((item) => [item.id, RunbookSyncStatus.SIGNED_OUT]),
          ),
        },
        cloudEntries: [],
        cloudError: null,
        cloudSignedIn: false,
        cloudAccountLabel: null,
        cloudFileEditor: null,
        cloudPath: ROOT_CLOUD_PATH,
        cloudHistory: [ROOT_CLOUD_PATH],
        cloudHistoryIndex: 0,
      }));
    },

    refreshCloudEntries: async () => {
      clearCachedCloudEntries(get().cloudProvider);
      await loadCloudEntries();
    },

    openCloudFolder: (folder) =>
      get().navigateCloudToPath([
        ...get().cloudPath,
        { id: folder.id, name: folder.name },
      ]),

    navigateCloudToDepth: (depth) =>
      get().navigateCloudToPath(get().cloudPath.slice(0, depth)),

    navigateCloudToPath: (path) => {
      // Browsing away from a history entry drops everything ahead of it
      const history = get().cloudHistory.slice(0, get().cloudHistoryIndex + 1);

      lastBrowsedCloudPath.set(get().cloudProvider, path);

      set({
        // Opening a folder from a search result lands you in that folder
        ...clearedCloudSearch(),
        cloudPath: path,
        cloudHistory: [...history, path],
        cloudHistoryIndex: history.length,
        cloudError: null,
        cloudEntries: [],
      });

      void loadCloudEntries();
    },

    navigateCloudHistory: (direction) => {
      const step = direction === HistoryDirection.BACK ? -1 : 1;
      const index = get().cloudHistoryIndex + step;
      const path = get().cloudHistory[index];

      if (!path) {
        return;
      }

      lastBrowsedCloudPath.set(get().cloudProvider, path);

      set({
        ...clearedCloudSearch(),
        cloudPath: path,
        cloudHistoryIndex: index,
        cloudError: null,
        cloudEntries: [],
      });
      void loadCloudEntries();
    },

    setCloudSearchQuery: (query) => {
      const previous = get().cloudSearchQuery;

      if (!query.trim()) {
        set({ ...clearedCloudSearch(), cloudSearchQuery: query });
        return;
      }

      set({ cloudSearchQuery: query });

      // The tree is walked once when a search starts, then filtered locally
      if (!previous.trim()) {
        void get().refreshCloudSearchEntries();
      }
    },

    toggleCloudSort: (column) => {
      const current = get().cloudSort;
      set({
        cloudSort: {
          column,
          direction:
            current.column === column
              ? current.direction === SortDirection.ASC
                ? SortDirection.DESC
                : SortDirection.ASC
              : column === CloudSortColumn.NAME
                ? SortDirection.ASC
                : SortDirection.DESC,
        },
      });
    },

    refreshCloudSearchEntries: async () => {
      const client = getCloudClient(get().cloudProvider);
      const requestId = startCloudSearchRequest();
      set({ cloudSearchLoading: true });

      try {
        const found = await walkCloudTree(client);
        if (isCurrentCloudSearchRequest(requestId)) {
          set({ cloudSearchEntries: found });
        }
      } catch (error) {
        console.error("Failed to search cloud entries", error);
        if (isCurrentCloudSearchRequest(requestId)) {
          set({
            cloudSearchEntries: [],
            cloudError: getMessages(get().language).cloudModal.genericError,
          });
        }
      } finally {
        if (isCurrentCloudSearchRequest(requestId)) {
          set({ cloudSearchLoading: false });
        }
      }
    },
  };
}
