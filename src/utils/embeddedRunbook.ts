import { RunbookBlockConfig } from "@/common/config";
import {
  BlockType,
  CloudProvider,
  EmbeddedRunbookStatus,
} from "@/common/enums";
import type {
  Block,
  CloudRunbookRef,
  EmbeddedRunbook,
  LibraryRunbook,
  RunbookBlock,
  Tab,
  Variable,
} from "@/common/types";

import { findTabByRunbookId } from "./tabs";
import { isEnumValue, isObject, isString } from "./typeGuards";

/** What a runbook block points at, and the key its content is cached under. */
export type EmbedSource = { key: string } & (
  | { local: LibraryRunbook; cloud?: never }
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
  libraryRunbooks: readonly LibraryRunbook[],
  block: Pick<RunbookBlock, "label" | "runbookId">,
): LibraryRunbook | null {
  const label = block.label.trim();
  let labeled: LibraryRunbook | null = null;

  for (const runbook of libraryRunbooks) {
    if (runbook.id === block.runbookId) {
      return runbook;
    }

    if (!labeled && label && runbook.label.trim() === label) {
      labeled = runbook;
    }
  }

  return labeled;
}

export function resolveEmbedSource(
  libraryRunbooks: readonly LibraryRunbook[],
  block: RunbookBlock,
): EmbedSource | null {
  const { cloud } = block;
  if (cloud) {
    return cloudPathSegments(cloud.path).length
      ? { key: cloudSourceKey(cloud), cloud }
      : null;
  }

  const local = resolveLocalRunbook(libraryRunbooks, block);
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
  { libraryRunbooks: readonly LibraryRunbook[]; source: EmbedSource | null }
>();

function cachedEmbedSource(
  libraryRunbooks: readonly LibraryRunbook[],
  block: RunbookBlock,
): EmbedSource | null {
  const cached = blockSources.get(block);
  if (cached?.libraryRunbooks === libraryRunbooks) {
    return cached.source;
  }

  const source = resolveEmbedSource(libraryRunbooks, block);
  blockSources.set(block, { libraryRunbooks, source });
  return source;
}

export function isEmbedBlockUnresolved(
  block: RunbookBlock,
  libraryRunbooks: readonly LibraryRunbook[],
  embeddedRunbooks: Readonly<Record<string, EmbeddedRunbook>>,
): boolean {
  const source = cachedEmbedSource(libraryRunbooks, block);
  const status = source ? embeddedRunbooks[source.key]?.status : undefined;
  return isEmbedUnresolved(block, source, status);
}

export function hasUnresolvedEmbeds(
  blocks: readonly RunbookBlock[],
  libraryRunbooks: readonly LibraryRunbook[],
  embeddedRunbooks: Readonly<Record<string, EmbeddedRunbook>>,
): boolean {
  return blocks.some((block) =>
    isEmbedBlockUnresolved(block, libraryRunbooks, embeddedRunbooks),
  );
}

/** The library runbook `block` embeds. */
export function embeddedRunbookId(
  block: Block,
  libraryRunbooks: readonly LibraryRunbook[],
  embeddedRunbooks: Readonly<Record<string, EmbeddedRunbook>>,
): string | undefined {
  if (block.type !== BlockType.RUNBOOK) {
    return undefined;
  }

  const source = cachedEmbedSource(libraryRunbooks, block);
  return source?.cloud
    ? embeddedRunbooks[source.key]?.runbookId
    : source?.local.id;
}

export interface EmbedLookup {
  libraryRunbooks: readonly LibraryRunbook[];
  embeddedRunbooks: Readonly<Record<string, EmbeddedRunbook>>;
  tabs: readonly Tab[];
}

/** The embedded runbook's variables. */
export function embeddedVariables(
  block: RunbookBlock,
  { libraryRunbooks, embeddedRunbooks, tabs }: EmbedLookup,
): Variable[] | null {
  const source = cachedEmbedSource(libraryRunbooks, block);
  if (!source) {
    return null;
  }

  const entry = embeddedRunbooks[source.key];
  const runbookId = source.local?.id ?? entry?.runbookId;
  const openTab = runbookId ? findTabByRunbookId(tabs, runbookId) : undefined;

  return openTab?.variables ?? entry?.content?.variables ?? null;
}

export function embedScopeId(scopeId: string, id: string): string {
  return [scopeId, id].join(RunbookBlockConfig.SCOPE_SEPARATOR);
}
