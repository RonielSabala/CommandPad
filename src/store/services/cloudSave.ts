import { MimeType } from "@/common/config";
import {
  CloudProvider,
  ExportFormat,
  RunbookSyncStatus,
  SaveOutcome,
} from "@/common/enums";
import type { RunbookContent, RunbookSync } from "@/common/types";
import {
  clearCachedCloudEntries,
  getCloudClient,
  type CloudClient,
} from "@/services/cloud";
import { hasEncryptedSecrets } from "@/services/vault";
import { buildSecuredRunbookExportContent } from "@/utils/export";
import { sha256 } from "@/utils/hash";
import { getRunbookLabel } from "@/utils/runbook";
import { parseRunbookSource } from "@/utils/runbookSource";

import type { StoreKit } from "@/store/kit";
import { withLibraryEntry } from "@/store/libraryState";
import { getRunbookTab } from "@/store/selectors";
import { contentFields, relabelTab } from "@/store/tabState";
import type { CloudConflict } from "@/store/types";
import type { ContentService } from "./content";
import type { EmbedLoading } from "./embeds";
import type { SyncService } from "./sync";
import type { VaultFlows } from "./vault";

export function createCloudSave(
  kit: StoreKit,
  deps: SyncService & ContentService & VaultFlows & EmbedLoading,
) {
  const { set, isDemo, saveTabs, saveLibrary } = kit;
  const {
    syncedContent,
    setSyncStatus,
    clearSyncStatus,
    runbookJson,
    markRunbookSynced,
    writeRunbookContent,
    readRunbookContent,
    decryptImportedContent,
    readEmbeddedForExport,
  } = deps;

  /** Signs in unless already signed in. */
  const ensureSignedIn = async (client: CloudClient) => {
    await client.init();
    if (!client.isSignedIn()) {
      await client.signIn();
    }
  };

  let saveNoticeId = 0;

  const showSaveNotice = (
    outcome: SaveOutcome,
    provider: CloudProvider | null,
  ) => set({ saveNotice: { id: ++saveNoticeId, outcome, provider } });

  const savingRunbooks = new Set<string>();

  /** Replaces a runbook's content with what it settled on with the cloud. */
  const replaceRunbookContent = async (
    runbookId: string,
    content: RunbookContent,
  ) => {
    await writeRunbookContent(runbookId, content);

    set((s) => {
      const tab = getRunbookTab(s, runbookId);
      if (tab) {
        const replaced = { ...tab, ...contentFields(content) };
        return relabelTab(
          { ...s, tabs: s.tabs.map((t) => (t.id === tab.id ? replaced : t)) },
          replaced,
        );
      }

      return withLibraryEntry(s, runbookId, (item) => ({
        ...item,
        label: getRunbookLabel(content.blocks, item.filename),
      }));
    });

    saveTabs();
    saveLibrary();
  };

  /** The linked file's text and revision. */
  const readLinkedFile = async (client: CloudClient, link: RunbookSync) => {
    const file = (await client.listEntries(link.folderId)).find(
      (entry) => !entry.isFolder && entry.name === link.filename,
    );

    if (!file) {
      return null;
    }

    const text = await client.readFile(file);
    return { text, revision: sha256(text) };
  };

  const pushLinkedRunbook = async (
    client: CloudClient,
    runbookId: string,
    link: RunbookSync,
    content: RunbookContent,
  ) => {
    const text = await buildSecuredRunbookExportContent(
      ExportFormat.JSON,
      runbookId,
      content,
      readEmbeddedForExport,
    );

    await client.writeFile(link.filename, text, MimeType.JSON, link.folderId);
    clearCachedCloudEntries(link.provider);
    markRunbookSynced(runbookId, content, {
      ...link,
      revision: sha256(text),
    });

    return SaveOutcome.SAVED;
  };

  const promptCloudConflict = (
    conflict: Omit<CloudConflict, "error" | "resolve">,
  ) =>
    new Promise<RunbookContent | null>((resolve) =>
      set({
        cloudConflict: { ...conflict, error: null, resolve },
        saveNotice: null,
      }),
    );

  /**
   * Pushes local edits when nobody else saved since the two last met,
   * pulls the file when only it moved, and asks when both did. Null
   * when the user backed out.
   */
  const reconcileLinkedRunbook = async (
    client: CloudClient,
    runbookId: string,
    link: RunbookSync,
  ): Promise<SaveOutcome | null> => {
    const local = await readRunbookContent(runbookId);
    if (!local) {
      return null;
    }

    const remote = await readLinkedFile(client, link);
    if (!remote) {
      return pushLinkedRunbook(client, runbookId, link, local);
    }

    const synced: RunbookSync = { ...link, revision: remote.revision };
    const fileMoved = remote.revision !== link.revision;

    let cloud: RunbookContent | null = null;
    let cloudText = remote.text;

    if (fileMoved) {
      try {
        cloud = parseRunbookSource(remote.text, local);
      } catch {
        // Only the local copy can be kept
      }

      // A locked copy is compared as ciphertext
      if (cloud && !hasEncryptedSecrets(local)) {
        cloud = (await decryptImportedContent(cloud, link.filename)).content;
      }

      if (cloud) {
        cloudText = runbookJson(cloud);
      }
    }

    if (!fileMoved || cloudText === syncedContent.get(runbookId)) {
      if (link.pending) {
        return pushLinkedRunbook(client, runbookId, synced, local);
      }

      if (fileMoved) {
        markRunbookSynced(runbookId, local, synced);
      }

      return SaveOutcome.UP_TO_DATE;
    }

    const localText = runbookJson(local);
    if (cloud && cloudText === localText) {
      markRunbookSynced(runbookId, local, synced);
      return SaveOutcome.UP_TO_DATE;
    }

    const knowsSyncedState =
      link.revision !== undefined || syncedContent.has(runbookId);

    if (cloud && !link.pending && knowsSyncedState) {
      await replaceRunbookContent(runbookId, cloud);
      markRunbookSynced(runbookId, cloud, synced);

      return SaveOutcome.UPDATED;
    }

    const kept = await promptCloudConflict({
      runbookId,
      provider: link.provider,
      filename: link.filename,
      cloudText,
      localText,
      local,
    });

    if (!kept) {
      return null;
    }

    showSaveNotice(SaveOutcome.SAVING, link.provider);

    const keptText = runbookJson(kept);
    if (keptText !== localText) {
      await replaceRunbookContent(runbookId, kept);
    }

    if (cloud && keptText === cloudText) {
      markRunbookSynced(runbookId, kept, synced);
      return SaveOutcome.UPDATED;
    }

    return reconcileLinkedRunbook(client, runbookId, {
      ...synced,
      pending: true,
    });
  };

  const saveLinkedRunbook = async (id: string, link: RunbookSync) => {
    if (isDemo || savingRunbooks.has(id)) {
      return;
    }

    savingRunbooks.add(id);
    setSyncStatus(id, RunbookSyncStatus.SYNCING);
    showSaveNotice(SaveOutcome.SAVING, link.provider);
    const client = getCloudClient(link.provider);

    try {
      try {
        await ensureSignedIn(client);
      } catch (error) {
        console.error("Cloud save sign-in failed", error);
        setSyncStatus(id, RunbookSyncStatus.SIGNED_OUT);
        showSaveNotice(SaveOutcome.SIGNED_OUT, link.provider);
        return;
      }

      const outcome = await reconcileLinkedRunbook(client, id, link);
      clearSyncStatus(id);
      if (outcome) {
        showSaveNotice(outcome, link.provider);
      }
    } catch (error) {
      console.error("Cloud save failed", error);
      setSyncStatus(id, RunbookSyncStatus.ERROR);
      showSaveNotice(SaveOutcome.FAILED, link.provider);
    } finally {
      savingRunbooks.delete(id);
    }
  };

  return {
    ensureSignedIn,
    showSaveNotice,
    savingRunbooks,
    replaceRunbookContent,
    readLinkedFile,
    pushLinkedRunbook,
    promptCloudConflict,
    reconcileLinkedRunbook,
    saveLinkedRunbook,
  };
}

export type CloudSave = ReturnType<typeof createCloudSave>;
