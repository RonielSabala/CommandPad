import type { Tab } from "@/common/types";
import { getActiveTab, getTabById, useStore } from "@/store/store";
import { createContext, use, useContext } from "react";

interface ViewScope {
  readonly tabId: string | null;
  readonly shown: boolean;
}

/** The tab a kept list renders. */
export const TabScopeContext = createContext<string | null>(null);

/** A kept view's scope. */
export const ViewScopeContext = createContext<ViewScope | null>(null);

/** The scope of the view this subtree is in. */
export function useViewScope(): ViewScope {
  const scope = useContext(ViewScopeContext);
  const activeId = useStore((state) =>
    scope ? null : (getActiveTab(state)?.id ?? null),
  );

  return scope ?? { tabId: activeId, shown: true };
}

/** The tab this subtree renders, or what `select` reads off it. */
export function useScopedTab(): Tab | null;
export function useScopedTab<T>(select: (tab: Tab | null) => T): T;
export function useScopedTab<T>(
  select?: (tab: Tab | null) => T,
): T | Tab | null {
  // A row in a kept list never subscribes to its view's scope
  const tabId = useContext(TabScopeContext) ?? use(ViewScopeContext)?.tabId;

  return useStore((state) => {
    const tab =
      tabId === undefined
        ? getActiveTab(state)
        : (getTabById(state, tabId) ?? null);

    return select ? select(tab) : tab;
  });
}
