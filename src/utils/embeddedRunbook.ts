import { RunbookBlockConfig } from "@/common/config";
import { CloudProvider } from "@/common/enums";
import type {
  CloudRunbookRef,
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

  return (
    library.find((entry) => entry.id === block.runbookId) ??
    (label ? library.find((entry) => entry.label.trim() === label) : null) ??
    null
  );
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

export function embedScopeId(scopeId: string, id: string): string {
  return [scopeId, id].join(RunbookBlockConfig.SCOPE_SEPARATOR);
}
