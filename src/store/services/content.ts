import { CloudProvider } from "@/common/enums";
import type {
  RunbookContent,
  RunbookStats,
  RunbookSync,
  Tab,
} from "@/common/types";
import type { CloudFileLocation } from "@/services/cloud";
import { holdsSecrets } from "@/services/vault";
import { localSourceKey } from "@/utils/embeddedRunbook";

import type { StoreKit } from "@/store/kit";
import { getRunbookTab } from "@/store/selectors";
import { tabContent } from "@/store/tabState";
import type { EmbedState } from "./embeds";
import type { SyncService } from "./sync";
import type { VaultRecords } from "./vault";

export function createContentService(
  kit: StoreKit,
  deps: SyncService & EmbedState & VaultRecords,
) {
  const { get, contentDb } = kit;
  const { trackCloudChanges, invalidateEmbed, markRunbookSecured } = deps;

  const storedStats = new Map<string, Promise<RunbookStats | null>>();
  const tabStats = new WeakMap<Tab, RunbookStats>();

  const writeRunbookContent = async (
    runbookId: string,
    content: RunbookContent,
  ) => {
    await contentDb.put(runbookId, content);
    markRunbookSecured(runbookId, holdsSecrets(content));
    storedStats.delete(runbookId);
    invalidateEmbed(localSourceKey(runbookId));
  };

  const cloudFileSync = (
    provider: CloudProvider,
    { file, folderId }: CloudFileLocation,
  ): RunbookSync => ({ provider, filename: file.name, folderId });

  const runbookLinkedTo = (link: RunbookSync) =>
    get().runbookLibrary.find(
      (item) =>
        item.sync?.provider === link.provider &&
        item.sync.filename === link.filename &&
        item.sync.folderId === link.folderId,
    )?.id;

  /** The runbook's content as the tab holds it, else as the DB holds it. */
  const readRunbookContent = async (runbookId: string) => {
    const openTab = getRunbookTab(get(), runbookId);
    return openTab ? tabContent(openTab) : await contentDb.get(runbookId);
  };

  /** Writes a tab's content outside the debounced save, in the background. */
  const persistTabContent = (runbookId: string, tab: Tab) => {
    const content = tabContent(tab);
    writeRunbookContent(runbookId, content).catch((error) =>
      console.warn("Failed to persist runbook content:", error),
    );

    trackCloudChanges(runbookId, content);
  };

  return {
    storedStats,
    tabStats,
    writeRunbookContent,
    persistTabContent,
    cloudFileSync,
    runbookLinkedTo,
    readRunbookContent,
  };
}

export type ContentService = ReturnType<typeof createContentService>;
