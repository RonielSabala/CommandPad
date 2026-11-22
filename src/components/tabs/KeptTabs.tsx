import { KeptTabsConfig } from "@/common/config";
import { queueLazyMounts } from "@/components/common/codeEditor/useLazyMount";
import { getActiveTab, useStore } from "@/store/store";
import { useEffect, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import "./KeptTabs.css";
import { TabScopeContext, useViewScope } from "./tabScope";

/** The recently shown tab ids. */
function withRecentTab(
  recent: readonly string[],
  tabId: string,
  openIds: readonly string[],
): string[] {
  return [
    ...recent.filter((id) => id !== tabId && openIds.includes(id)),
    tabId,
  ].slice(-KeptTabsConfig.MAX);
}

/**
 * Renders the last few tabs its view showed and hides all but the view's
 * tab with their layout kept.
 */
export function KeptTabs({
  className,
  children,
}: {
  className?: string;
  children: (shown: boolean) => ReactNode;
}) {
  const { tabId, shown: viewShown } = useViewScope();
  const shownElsewhere = useStore((state) =>
    viewShown ? null : (getActiveTab(state)?.id ?? null),
  );
  const openIds = useStore(
    useShallow((state) => state.tabs.map((tab) => tab.id)),
  );

  const [recent, setRecent] = useState<readonly string[]>([]);
  let next = recent;

  if (tabId !== null && next.at(-1) !== tabId) {
    next = withRecentTab(next, tabId, openIds);
  }

  // A tab another view shows leaves
  if (shownElsewhere !== null && next.includes(shownElsewhere)) {
    next = next.filter((id) => id !== shownElsewhere);
  }

  if (next !== recent) {
    setRecent(next);
  }

  // Editors left pending in a hidden tab carry on mounting once it shows
  useEffect(queueLazyMounts, [tabId, viewShown]);

  return (
    <div className={className}>
      {openIds
        .filter((id) => recent.includes(id))
        .map((id) => (
          <div
            key={id}
            className={id === tabId ? undefined : "kept-tab-hidden"}
          >
            <TabScopeContext.Provider value={id}>
              {children(viewShown && id === tabId)}
            </TabScopeContext.Provider>
          </div>
        ))}
    </div>
  );
}
