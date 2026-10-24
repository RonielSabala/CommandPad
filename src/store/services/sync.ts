import { RunbookSyncStatus } from "@/common/enums";
import type { RunbookContent, RunbookSync } from "@/common/types";
import { withoutKey } from "@/utils/collections";
import { buildRunbookSource } from "@/utils/runbookSource";

import type { StoreKit } from "@/store/kit";
import { withLibraryEntry } from "@/store/libraryState";
import { getLibraryEntry, getRunbookTab } from "@/store/selectors";
import { tabContent } from "@/store/tabState";

export function createSyncService(kit: StoreKit) {
  const { set, get, isDemo, saveLibrary } = kit;

  // What each linked runbook held when it last met its cloud file
  const syncedContent = new Map<string, string>();

  const setSyncStatus = (runbookId: string, status: RunbookSyncStatus) =>
    set((s) => ({
      runbookSyncStatus: { ...s.runbookSyncStatus, [runbookId]: status },
    }));

  const clearSyncStatus = (runbookId: string) =>
    set((s) =>
      runbookId in s.runbookSyncStatus
        ? { runbookSyncStatus: withoutKey(s.runbookSyncStatus, runbookId) }
        : {},
    );

  const forgetSyncState = (runbookId: string) => {
    syncedContent.delete(runbookId);
    clearSyncStatus(runbookId);
  };

  const getSyncLink = (runbookId: string): RunbookSync | undefined =>
    getLibraryEntry(get(), runbookId)?.sync;

  /** Rewrites a link that still exists, or creates one when `linking`. */
  const setSyncLink = (
    runbookId: string,
    sync: RunbookSync,
    linking = false,
  ) => {
    set((s) =>
      withLibraryEntry(s, runbookId, (item) =>
        linking || item.sync ? { ...item, sync } : item,
      ),
    );

    saveLibrary();
  };

  const setSyncPending = (
    runbookId: string,
    pending: boolean,
    link = getSyncLink(runbookId),
  ) => {
    if (link && (link.pending ?? false) !== pending) {
      setSyncLink(runbookId, { ...link, pending });
    }
  };

  const runbookJson = (content: RunbookContent) => buildRunbookSource(content);

  /** Flags a linked runbook whose content moved away from what its cloud file holds. */
  const trackCloudChanges = (runbookId: string, content: RunbookContent) => {
    const link = getSyncLink(runbookId);
    if (isDemo || !link) {
      return;
    }

    const json = runbookJson(content);
    const synced = syncedContent.get(runbookId);
    if (synced === undefined) {
      if (!link.pending) {
        syncedContent.set(runbookId, json);
      }

      return;
    }

    setSyncPending(runbookId, json !== synced, link);
  };

  const flagUnsavedCloudChanges = (runbookId: string) => {
    syncedContent.delete(runbookId);
    setSyncPending(runbookId, true);
  };

  /** Records that the cloud file holds `content`, as `sync` describes it. */
  const markRunbookSynced = (
    runbookId: string,
    content: RunbookContent,
    sync: RunbookSync,
    linking = false,
  ) => {
    syncedContent.set(runbookId, runbookJson(content));
    setSyncLink(runbookId, { ...sync, pending: false }, linking);
    clearSyncStatus(runbookId);

    // An edit made while the cloud was being reached is still unsaved
    const openTab = getRunbookTab(get(), runbookId);
    const tabMoved =
      openTab &&
      (openTab.blocks !== content.blocks ||
        openTab.variables !== content.variables ||
        openTab.variableSections !== content.variableSections);

    if (tabMoved) {
      trackCloudChanges(runbookId, tabContent(openTab));
    }
  };

  /** Points a runbook at a cloud file it was just written to or read from. */
  const linkRunbookToCloud = (
    runbookId: string,
    sync: RunbookSync,
    content: RunbookContent,
  ) => markRunbookSynced(runbookId, content, sync, true);

  return {
    syncedContent,
    setSyncStatus,
    clearSyncStatus,
    forgetSyncState,
    getSyncLink,
    setSyncLink,
    setSyncPending,
    runbookJson,
    trackCloudChanges,
    flagUnsavedCloudChanges,
    markRunbookSynced,
    linkRunbookToCloud,
  };
}

export type SyncService = ReturnType<typeof createSyncService>;
