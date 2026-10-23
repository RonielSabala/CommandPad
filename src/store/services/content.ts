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

import type { EmbedState } from "./embeds";
import type { VaultRecords } from "./vault";
import type { StoreKit } from "@/store/kit";
import { tabContent } from "@/store/tabState";

export function createContentService(
  kit: StoreKit,
  deps: EmbedState & VaultRecords,
) {
  const { get, contentDb } = kit;
  const { invalidateEmbed, markRunbookSecured } = deps;

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
    const openTab = get().tabs.find((t) => t.runbookId === runbookId);
    return openTab ? tabContent(openTab) : await contentDb.get(runbookId);
  };

  return {
    storedStats,
    tabStats,
    writeRunbookContent,
    cloudFileSync,
    runbookLinkedTo,
    readRunbookContent,
  };
}

export type ContentService = ReturnType<typeof createContentService>;
