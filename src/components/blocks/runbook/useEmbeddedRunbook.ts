import { RunbookBlockConfig } from "@/common/config";
import type { EmbeddedRunbookStatus } from "@/common/enums";
import type { RunbookBlock, RunbookContent, Variable } from "@/common/types";
import { hasEncryptedSecrets } from "@/services/vault";
import { tabContent, useStore } from "@/store/store";
import { resolveEmbedSource, type EmbedSource } from "@/utils/embeddedRunbook";
import {
  applyOverrides,
  getSecretKeys,
  getVariableMap,
  overrideScope,
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
  secretKeys: Set<string>;
  locked: boolean;
  circular: boolean;
  tooDeep: boolean;
  refreshing: boolean;
  nestedTrail: readonly string[];
}

const NO_VARIABLES: Variable[] = [];

export function useEmbeddedRunbook(
  block: RunbookBlock,
  { variableMap, secretKeys }: OverrideHost,
  trail: readonly string[],
): EmbeddedRunbookState {
  const library = useStore((state) => state.runbookLibrary);
  const loadEmbeddedRunbook = useStore((state) => state.loadEmbeddedRunbook);
  const source = useMemo(
    () => resolveEmbedSource(library, block),
    [library, block],
  );

  const key = source?.key ?? null;
  const entry = useStore((state) =>
    key ? state.embeddedRunbooks[key] : undefined,
  );

  const runbookId = source?.local?.id ?? entry?.runbookId;
  const openTab = useStore((state) =>
    runbookId
      ? (state.tabs.find((tab) => tab.runbookId === runbookId) ?? null)
      : null,
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
      content
        ? applyOverrides(content.variables, overrides, secretKeys)
        : NO_VARIABLES,
    [content, overrides, secretKeys],
  );

  // Only an override reads the host
  const overrideHost = overrides ? variableMap : null;
  const embeddedMap = useMemo(
    () =>
      getVariableMap(
        variables,
        overrideHost
          ? overrideScope(variables, overrides, overrideHost)
          : undefined,
      ),
    [variables, overrides, overrideHost],
  );
  const embeddedSecrets = useMemo(() => getSecretKeys(variables), [variables]);

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
