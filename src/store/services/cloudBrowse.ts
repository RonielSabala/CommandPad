import { CloudProvider } from "@/common/enums";
import { getMessages } from "@/i18n/messages";
import {
  getCachedCloudEntries,
  getCloudClient,
  setCachedCloudEntries,
  type CloudFolderRef,
  type PlacedCloudEntry,
} from "@/services/cloud";

import { currentFolderId } from "@/store/cloudPaths";
import type { StoreKit } from "@/store/kit";

export function createCloudBrowse(kit: StoreKit) {
  const { set, get } = kit;

  let cloudRequestId = 0;
  const startCloudRequest = () => ++cloudRequestId;
  const isCurrentCloudRequest = (id: number) => cloudRequestId === id;

  // Where the browser was left off per provider
  const lastBrowsedCloudPath = new Map<CloudProvider, CloudFolderRef[]>();

  let cloudSearchRequestId = 0;
  const startCloudSearchRequest = () => ++cloudSearchRequestId;
  const isCurrentCloudSearchRequest = (id: number) =>
    cloudSearchRequestId === id;

  const emptyCloudSelection = () => {
    const current = get().cloudSelectedEntries;
    return current.size === 0 ? current : new Map<string, PlacedCloudEntry>();
  };

  /** Drops the search and its results. */
  const clearedCloudSearch = () => {
    startCloudSearchRequest();
    return {
      cloudSearchQuery: "",
      cloudSearchEntries: [],
      cloudSearchLoading: false,
    };
  };

  const clearedCloudListing = () => ({
    ...clearedCloudSearch(),
    cloudSelectedEntries: emptyCloudSelection(),
  });

  /** Lists the open folder from the provider and caches what came back. */
  const fetchCloudEntries = async () => {
    const provider = get().cloudProvider;
    const folderId = currentFolderId(get().cloudPath);
    const requestId = startCloudRequest();

    set({ cloudLoading: true, cloudError: null });

    try {
      const entries = await getCloudClient(provider).listEntries(folderId);
      setCachedCloudEntries(provider, folderId, entries);

      if (isCurrentCloudRequest(requestId)) {
        set({ cloudEntries: entries });
      }
    } catch (error) {
      console.error("Failed to list cloud entries", error);
      if (isCurrentCloudRequest(requestId)) {
        set({
          cloudEntries: [],
          cloudError: getMessages(get().language).cloudModal.genericError,
        });
      }
    } finally {
      if (isCurrentCloudRequest(requestId)) {
        set({ cloudLoading: false });
      }
    }
  };

  const loadCloudEntries = async () => {
    const cached = getCachedCloudEntries(
      get().cloudProvider,
      currentFolderId(get().cloudPath),
    );

    if (cached) {
      startCloudRequest();
      set({ cloudEntries: cached, cloudLoading: false, cloudError: null });
    } else {
      await fetchCloudEntries();
    }

    if (get().cloudSearchQuery.trim()) {
      await get().refreshCloudSearchEntries();
    }
  };

  return {
    startCloudRequest,
    isCurrentCloudRequest,
    lastBrowsedCloudPath,
    startCloudSearchRequest,
    isCurrentCloudSearchRequest,
    emptyCloudSelection,
    clearedCloudSearch,
    clearedCloudListing,
    fetchCloudEntries,
    loadCloudEntries,
  };
}

export type CloudBrowse = ReturnType<typeof createCloudBrowse>;
