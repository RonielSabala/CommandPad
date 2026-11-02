import type { Tab } from "@/common/types";
import { getTabVariableMap } from "@/hooks/useTabUnresolved";
import { getActiveTab, useStore } from "@/store/store";
import { getSecretKeys, type VariableMap } from "@/utils/resolution";
import { useMemo } from "react";

export interface VariableInfoScope {
  tab: Tab;
  variableMap: VariableMap;
  secretKeys: Set<string>;
}

/** The active tab and how its variables resolve. */
export function useVariableInfoScope(): VariableInfoScope | null {
  const tab = useStore((state) => getActiveTab(state) ?? null);
  const variables = tab?.variables;
  const secretKeys = useMemo(() => getSecretKeys(variables ?? []), [variables]);

  return tab
    ? { tab, variableMap: getTabVariableMap(tab.variables), secretKeys }
    : null;
}
