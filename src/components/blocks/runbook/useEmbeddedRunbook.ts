import { RunbookBlockConfig } from "@/common/config";
import type { EmbeddedRunbookStatus } from "@/common/enums";
import type { RunbookBlock, RunbookContent, Variable } from "@/common/types";
import { hasEncryptedSecrets } from "@/services/vault";
import {
  EMPTY_VARIABLES,
  getActiveRunbookId,
  getTabByRunbookId,
  tabContent,
  useStore,
} from "@/store/store";
import {
  localSourceKey,
  resolveEmbedSource,
  type EmbedSource,
} from "@/utils/embeddedRunbook";
import {
  applyOverrides,
  getOverriddenVariableMap,
  getTabVariableMap,
  overriddenSecretKeys,
  type OverrideHost,
  type VariableMap,
} from "@/utils/resolution";
import { useEffect, useMemo } from "react";

/** Everything a runbook block knows about the runbook it embeds. */
export interface EmbeddedRunbookState {
  source: EmbedSource | null;
  status: EmbeddedRunbookStatus | undefined;
  isOpen: boolean;
  content: RunbookContent | null;
  variables: Variable[];
  variableMap: VariableMap;
  secretKeys: ReadonlySet<string>;
  locked: boolean;
  circular: boolean;
  tooDeep: boolean;
  refreshing: boolean;
  nestedTrail: readonly string[];
}

const NO_TRAIL: readonly string[] = [];

export function useEmbeddedRunbook(
  block: RunbookBlock,
  { variableMap, secretKeys }: OverrideHost,
  trail: readonly string[],
): EmbeddedRunbookState {
  const runbooks = useStore((state) => state.libraryRunbooks);
  const loadEmbeddedRunbook = useStore((state) => state.loadEmbeddedRunbook);
  const source = useMemo(
    () => resolveEmbedSource(runbooks, block),
    [runbooks, block],
  );

  const key = source?.key ?? null;
  const entry = useStore((state) =>
    key ? state.embeddedRunbooks[key] : undefined,
  );

  const runbookId = source?.local?.id ?? entry?.runbookId;
  const openTab = useStore((state) =>
    runbookId ? (getTabByRunbookId(state, runbookId) ?? null) : null,
  );

  const circular = key !== null && trail.includes(key);
  const tooDeep = trail.length > RunbookBlockConfig.MAX_DEPTH;
  const due = !openTab && !circular && !tooDeep && (!entry || !!entry.stale);

  useEffect(() => {
    if (source && due) {
      void loadEmbeddedRunbook(source);
    }
  }, [source, due, loadEmbeddedRunbook]);

  const { overrides } = block;
  const content = useMemo(
    () => (openTab ? tabContent(openTab) : (entry?.content ?? null)),
    [openTab, entry],
  );
  const variables = useMemo(
    () =>
      content ? applyOverrides(content.variables, overrides) : EMPTY_VARIABLES,
    [content, overrides],
  );

  const ownVariables = content?.variables ?? EMPTY_VARIABLES;
  const embeddedMap = overrides
    ? getOverriddenVariableMap(ownVariables, overrides, variableMap)
    : getTabVariableMap(ownVariables);

  const embeddedSecrets = useMemo(
    () =>
      overriddenSecretKeys(ownVariables, overrides, embeddedMap, secretKeys),
    [ownVariables, overrides, embeddedMap, secretKeys],
  );

  const locked = useMemo(
    () => !!content && hasEncryptedSecrets(content),
    [content],
  );

  const nestedTrail = useMemo(
    () => (key ? [...trail, key] : trail),
    [trail, key],
  );

  return {
    source,
    status: entry?.status,
    isOpen: !!openTab,
    content,
    variables,
    variableMap: embeddedMap,
    secretKeys: embeddedSecrets,
    locked,
    circular,
    tooDeep,
    refreshing: !openTab && !!entry?.stale,
    nestedTrail,
  };
}

/** What a runbook block in the active tab embeds. */
export function useTabEmbed(
  block: RunbookBlock,
  variableMap: VariableMap,
  secretKeys: ReadonlySet<string>,
): { host: OverrideHost; embed: EmbeddedRunbookState } {
  const hostRunbookId = useStore(getActiveRunbookId);

  const host = useMemo(
    () => ({ variableMap, secretKeys }),
    [variableMap, secretKeys],
  );
  const trail = useMemo(
    () => (hostRunbookId ? [localSourceKey(hostRunbookId)] : NO_TRAIL),
    [hostRunbookId],
  );

  return { host, embed: useEmbeddedRunbook(block, host, trail) };
}
