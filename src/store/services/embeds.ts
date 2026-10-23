import { EmbeddedRunbookStatus } from "@/common/enums";
import type {
  CloudRunbookRef,
  EmbeddedRunbook,
  RunbookContent,
} from "@/common/types";
import { getCloudClient, resolveCloudFile } from "@/services/cloud";
import {
  decryptContentWithOpenVaults,
  hasEncryptedSecrets,
} from "@/services/vault";
import { localSourceKey, resolveEmbedSource } from "@/utils/embeddedRunbook";
import type { EmbeddedReader } from "@/utils/export";
import { parseRunbookSource } from "@/utils/runbookSource";

import type { ContentService } from "./content";
import type { StoreKit } from "@/store/kit";

export function createEmbedState(kit: StoreKit) {
  const { set, get } = kit;

  // The load a key is waiting on, so an invalidated one can't land late
  const embedRequests = new Map<string, number>();
  let embedRequestId = 0;
  const nextEmbedRequestId = () => ++embedRequestId;

  const setEmbeddedRunbook = (key: string, entry: EmbeddedRunbook | null) =>
    set((s) => {
      if (!entry && !(key in s.embeddedRunbooks)) {
        return {};
      }

      const embeddedRunbooks = { ...s.embeddedRunbooks };
      if (entry) {
        embeddedRunbooks[key] = entry;
      } else {
        delete embeddedRunbooks[key];
      }

      return { embeddedRunbooks };
    });

  /** Every embed reading a runbook. */
  const embedsReadingRunbook = (runbookId: string) =>
    Object.entries(get().embeddedRunbooks).filter(
      ([key, entry]) =>
        key === localSourceKey(runbookId) || entry.runbookId === runbookId,
    );

  /** Marks what an embed loaded as due a reload. */
  const invalidateEmbed = (key: string) => {
    embedRequests.delete(key);

    const entry = get().embeddedRunbooks[key];
    if (entry?.stale) {
      return;
    }

    setEmbeddedRunbook(key, entry?.content ? { ...entry, stale: true } : null);
  };

  return {
    embedRequests,
    nextEmbedRequestId,
    setEmbeddedRunbook,
    embedsReadingRunbook,
    invalidateEmbed,
  };
}

export type EmbedState = ReturnType<typeof createEmbedState>;

export function createEmbedLoading(kit: StoreKit, deps: ContentService) {
  const { get, isDemo } = kit;
  const { cloudFileSync, runbookLinkedTo, readRunbookContent } = deps;

  /** Loaded content. */
  const readyEmbed = async (
    content: RunbookContent,
  ): Promise<EmbeddedRunbook> => ({
    status: EmbeddedRunbookStatus.READY,
    content: hasEncryptedSecrets(content)
      ? (await decryptContentWithOpenVaults(content)).content
      : content,
  });

  const emptyEmbed = (status: EmbeddedRunbookStatus): EmbeddedRunbook => ({
    status,
    content: null,
  });

  const fetchLocalEmbed = async (runbookId: string) => {
    const content = await readRunbookContent(runbookId);
    return content
      ? readyEmbed(content)
      : emptyEmbed(EmbeddedRunbookStatus.MISSING);
  };

  const fetchCloudEmbed = async (
    ref: CloudRunbookRef,
    previous: RunbookContent | null,
  ) => {
    const client = getCloudClient(ref.provider);
    if (isDemo || !client.isConfigured()) {
      return emptyEmbed(EmbeddedRunbookStatus.ERROR);
    }

    await client.init();
    if (!client.isSignedIn()) {
      return emptyEmbed(EmbeddedRunbookStatus.SIGNED_OUT);
    }

    const located = await resolveCloudFile(client, ref.path);
    if (!located) {
      return emptyEmbed(EmbeddedRunbookStatus.MISSING);
    }

    const entry = await readyEmbed(
      parseRunbookSource(
        await client.readFile(located.file),
        previous ?? undefined,
      ),
    );

    const runbookId = runbookLinkedTo(cloudFileSync(ref.provider, located));
    return runbookId ? { ...entry, runbookId } : entry;
  };

  const readEmbeddedForExport: EmbeddedReader = async (block) => {
    const source = resolveEmbedSource(get().runbookLibrary, block);
    if (!source) {
      return null;
    }

    const cached = get().embeddedRunbooks[source.key]?.content;
    try {
      const { content } = source.cloud
        ? cached
          ? { content: cached }
          : await fetchCloudEmbed(source.cloud, null)
        : await fetchLocalEmbed(source.local.id);

      return content
        ? {
            key: source.key,
            scope: source.local?.id ?? source.key,
            content,
          }
        : null;
    } catch (error) {
      console.error("Failed to read embedded runbook", source.key, error);
      return null;
    }
  };

  return {
    readyEmbed,
    emptyEmbed,
    fetchLocalEmbed,
    fetchCloudEmbed,
    readEmbeddedForExport,
  };
}

export type EmbedLoading = ReturnType<typeof createEmbedLoading>;
