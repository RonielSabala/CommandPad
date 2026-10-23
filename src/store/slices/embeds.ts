import { EmbeddedRunbookStatus, VaultField, VaultPrompt } from "@/common/enums";
import type { EmbeddedRunbook } from "@/common/types";
import {
  clearCachedCloudEntries,
  getCloudClient,
  listCloudFolder,
  resolveCloudFile,
} from "@/services/cloud";
import { recordFromCiphertext, unlockVault } from "@/services/vault";
import { sha256 } from "@/utils/hash";
import { getRunbookStats, parseRunbookSource } from "@/utils/runbookSource";

import type { StoreKit } from "@/store/kit";
import { getActiveTab, getRunbookEmbedView } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import { tabContent, withActiveTab } from "@/store/tabState";
import type { StoreState } from "@/store/types";

type EmbedsActions = Pick<
  StoreState,
  | "readRunbookStats"
  | "loadEmbeddedRunbook"
  | "refreshEmbeddedRunbook"
  | "openEmbeddedRunbook"
  | "setRunbookEmbedView"
  | "setEmbeddedSectionFolded"
  | "unlockEmbeddedRunbook"
  | "signInForEmbeddedRunbooks"
  | "listEmbeddableCloudFolder"
>;

export function createEmbedsSlice(
  kit: StoreKit,
  services: StoreServices,
): EmbedsActions {
  const { set, get, isDemo, persist, contentDb } = kit;
  const {
    embedRequests,
    nextEmbedRequestId,
    setEmbeddedRunbook,
    invalidateEmbed,
    getVaultRecord,
    storedStats,
    tabStats,
    cloudFileSync,
    runbookLinkedTo,
    promptVault,
    unlockVaultWith,
    decryptLoadedEmbeds,
    readImportedContent,
    addCloudRunbook,
    emptyEmbed,
    fetchLocalEmbed,
    fetchCloudEmbed,
    ensureSignedIn,
  } = services;

  return {
    readRunbookStats: (runbookId) => {
      const openTab = get().tabs.find((t) => t.runbookId === runbookId);
      if (openTab) {
        let stats = tabStats.get(openTab);
        if (!stats) {
          stats = getRunbookStats(tabContent(openTab));
          tabStats.set(openTab, stats);
        }

        return Promise.resolve(stats);
      }

      let stats = storedStats.get(runbookId);
      if (stats) {
        return stats;
      }

      stats = contentDb
        .get(runbookId)
        .then((content) => (content ? getRunbookStats(content) : null))
        .catch((error) => {
          storedStats.delete(runbookId);
          console.warn("Failed to measure runbook:", runbookId, error);
          return null;
        });

      storedStats.set(runbookId, stats);
      return stats;
    },

    loadEmbeddedRunbook: async (source) => {
      const { key } = source;
      const current = get().embeddedRunbooks[key];

      if (embedRequests.has(key) || (current && !current.stale)) {
        return;
      }

      const requestId = nextEmbedRequestId();
      embedRequests.set(key, requestId);

      if (!current) {
        setEmbeddedRunbook(key, emptyEmbed(EmbeddedRunbookStatus.LOADING));
      }

      let entry: EmbeddedRunbook;
      try {
        entry = source.cloud
          ? await fetchCloudEmbed(source.cloud, current?.content ?? null)
          : await fetchLocalEmbed(source.local.id);
      } catch (error) {
        console.error("Failed to load embedded runbook", key, error);
        entry = emptyEmbed(EmbeddedRunbookStatus.ERROR);
      }

      if (embedRequests.get(key) === requestId) {
        embedRequests.delete(key);
        setEmbeddedRunbook(key, entry);
      }
    },

    refreshEmbeddedRunbook: async (source) => {
      if (source.cloud) {
        clearCachedCloudEntries(source.cloud.provider);
      }

      invalidateEmbed(source.key);
      await get().loadEmbeddedRunbook(source);
    },

    /** Opens the embedded runbook in a tab. */
    openEmbeddedRunbook: async (source) => {
      if (source.local) {
        await get().loadRunbookFromLibrary(source.local.id);
        return;
      }

      const { key, cloud } = source;
      const client = getCloudClient(cloud.provider);
      if (isDemo || !client.isConfigured()) {
        return;
      }

      try {
        await ensureSignedIn(client);

        const located = await resolveCloudFile(client, cloud.path);
        if (!located) {
          await get().refreshEmbeddedRunbook(source);
          return;
        }

        const link = cloudFileSync(cloud.provider, located);
        const linked = runbookLinkedTo(link);
        if (linked) {
          await get().loadRunbookFromLibrary(linked);
          return;
        }

        // The ids the embed already holds
        const previous = get().embeddedRunbooks[key]?.content ?? undefined;
        const text = await client.readFile(located.file);
        const content = parseRunbookSource(text, previous);
        const opened = await addCloudRunbook(
          located.file.name,
          await readImportedContent(content),
          { ...link, revision: sha256(text) },
        );

        if (!opened) {
          return;
        }

        const runbookId = runbookLinkedTo(link);
        if (!runbookId) {
          return;
        }

        const entry = get().embeddedRunbooks[key];
        if (entry) {
          setEmbeddedRunbook(key, { ...entry, runbookId });
        }

        await get().loadRunbookFromLibrary(runbookId);
      } catch (error) {
        console.error("Failed to open the embedded runbook", key, error);
      }
    },

    setRunbookEmbedView: (blockId, view) => {
      const active = getActiveTab(get());
      if (!active || getRunbookEmbedView(active, blockId) === view) {
        return;
      }

      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          embedViews: { ...tab.embedViews, [blockId]: view },
        })),
      );

      persist.saveTabsMeta(get().tabs, get().activeTabId);
    },

    setEmbeddedSectionFolded: (foldKey, folded) =>
      set((s) => ({
        embeddedSectionFolds: {
          ...s.embeddedSectionFolds,
          [foldKey]: folded,
        },
      })),

    unlockEmbeddedRunbook: async (source) => {
      if (source.local) {
        const runbookId = source.local.id;
        if (
          getVaultRecord(runbookId) &&
          (await promptVault(VaultPrompt.UNLOCK, unlockVaultWith(runbookId)))
        ) {
          await get().refreshEmbeddedRunbook(source);
        }

        return;
      }

      const { key, cloud } = source;
      const content = get().embeddedRunbooks[key]?.content;
      const record = content ? recordFromCiphertext(content) : null;

      if (!content || !record) {
        return;
      }

      const unlocked = await promptVault(
        VaultPrompt.UNLOCK,
        (passphrases) =>
          unlockVault(key, passphrases[VaultField.CURRENT], record),
        cloud.path,
      );

      if (unlocked) {
        await decryptLoadedEmbeds();
      }
    },

    signInForEmbeddedRunbooks: async (provider) => {
      try {
        await ensureSignedIn(getCloudClient(provider));
      } catch (error) {
        console.error("Cloud sign-in failed", error);
        return;
      }

      for (const [key, entry] of Object.entries(get().embeddedRunbooks)) {
        if (entry.status === EmbeddedRunbookStatus.SIGNED_OUT) {
          invalidateEmbed(key);
        }
      }
    },

    listEmbeddableCloudFolder: async (provider, path) => {
      const client = getCloudClient(provider);
      if (isDemo || !client.isConfigured()) {
        return null;
      }

      try {
        await client.init();
        return client.isSignedIn() ? await listCloudFolder(client, path) : null;
      } catch (error) {
        console.error("Failed to list cloud folder", path, error);
        return null;
      }
    },
  };
}
