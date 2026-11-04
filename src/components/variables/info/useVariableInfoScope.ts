import type { Tab } from "@/common/types";
import { getActiveTab, useStore } from "@/store/store";
import {
  getTabSecretKeys,
  getTabVariableMap,
  type VariableMap,
} from "@/utils/resolution";

export interface VariableInfoScope {
  tab: Tab;
  variableMap: VariableMap;
  secretKeys: ReadonlySet<string>;
}

/** The active tab and how its variables resolve. */
export function useVariableInfoScope(): VariableInfoScope | null {
  const tab = useStore(getActiveTab);

  return tab
    ? {
        tab,
        variableMap: getTabVariableMap(tab.variables),
        secretKeys: getTabSecretKeys(tab.variables),
      }
    : null;
}
