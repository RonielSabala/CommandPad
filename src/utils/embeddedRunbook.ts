import { RunbookBlockConfig } from "@/common/config";
import { CloudProvider, EmbeddedRunbookStatus } from "@/common/enums";
import type {
  CloudRunbookRef,
  EmbeddedRunbook,
  RunbookBlock,
  RunbookEntry,
} from "@/common/types";

import { isEnumValue, isObject, isString } from "./typeGuards";

/** What a runbook block points at, and the key its content is cached under. */
export type EmbedSource = { key: string } & (
  | { local: RunbookEntry; cloud?: never }
  | { cloud: CloudRunbookRef; local?: never }
);

export function isCloudRunbookRef(value: unknown): value is CloudRunbookRef {
  return (
    isObject(value) &&
    isEnumValue(CloudProvider, value.provider) &&
    isString(value.path)
  );
}

export function cloudPathSegments(path: string): string[] {
  return path
    .split(RunbookBlockConfig.PATH_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function localSourceKey(runbookId: string): string {
  return [RunbookBlockConfig.LOCAL_SOURCE, runbookId].join(
    RunbookBlockConfig.KEY_SEPARATOR,
  );
}

export function cloudSourceKey(ref: CloudRunbookRef): string {
  return [
    RunbookBlockConfig.CLOUD_SOURCE,
    ref.provider,
    cloudPathSegments(ref.path).join(RunbookBlockConfig.PATH_SEPARATOR),
  ].join(RunbookBlockConfig.KEY_SEPARATOR);
}

export function resolveLocalRunbook(
  library: readonly RunbookEntry[],
  block: Pick<RunbookBlock, "label" | "runbookId">,
): RunbookEntry | null {
  const label = block.label.trim();
  let labeled: RunbookEntry | null = null;

  for (const entry of library) {
    if (entry.id === block.runbookId) {
      return entry;
    }

    if (!labeled && label && entry.label.trim() === label) {
      labeled = entry;
    }
  }

  return labeled;
}

export function resolveEmbedSource(
  library: readonly RunbookEntry[],
  block: RunbookBlock,
): EmbedSource | null {
  const { cloud } = block;
  if (cloud) {
    return cloudPathSegments(cloud.path).length
      ? { key: cloudSourceKey(cloud), cloud }
      : null;
  }

  const local = resolveLocalRunbook(library, block);
  return local ? { key: localSourceKey(local.id), local } : null;
}

export function isEmbedUnresolved(
  block: RunbookBlock,
  source: EmbedSource | null,
  status: EmbeddedRunbookStatus | undefined,
): boolean {
  return block.cloud
    ? status === EmbeddedRunbookStatus.MISSING
    : !source && !!block.label.trim();
}

/** Each block's last source. */
const blockSources = new WeakMap<
  RunbookBlock,
  { library: readonly RunbookEntry[]; source: EmbedSource | null }
>();

function cachedEmbedSource(
  library: readonly RunbookEntry[],
  block: RunbookBlock,
): EmbedSource | null {
  const cached = blockSources.get(block);
  if (cached?.library === library) {
    return cached.source;
  }

  const source = resolveEmbedSource(library, block);
  blockSources.set(block, { library, source });
  return source;
}

export function hasUnresolvedEmbeds(
  blocks: readonly RunbookBlock[],
  library: readonly RunbookEntry[],
  embeddedRunbooks: Readonly<Record<string, EmbeddedRunbook>>,
): boolean {
  return blocks.some((block) => {
    const source = cachedEmbedSource(library, block);
    const status = source ? embeddedRunbooks[source.key]?.status : undefined;
    return isEmbedUnresolved(block, source, status);
  });
}

export function embedScopeId(scopeId: string, id: string): string {
  return [scopeId, id].join(RunbookBlockConfig.SCOPE_SEPARATOR);
}
