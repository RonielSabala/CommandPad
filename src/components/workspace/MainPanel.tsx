import { CssClass } from "@/common/constants/css";
import { RunbookView } from "@/common/enums";
import { ViewScopeContext } from "@/components/tabs/tabScope";
import { RunbookVariables } from "@/components/variables/RunbookVariables";
import { VariablesViewContext } from "@/components/variables/variablesViewContext";
import { getActiveTab, getRunbookView, useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useMemo, useState, type ComponentType } from "react";

import { TabsBar } from "../tabs/TabsBar";

import "./MainPanel.css";
import { RunbookPreview } from "./RunbookPreview";
import { RunbookSource } from "./RunbookSource";

type ViewTabs = Partial<Record<RunbookView, string | null>>;

const RUNBOOK_VIEWS: Record<RunbookView, ComponentType> = {
  [RunbookView.SOURCE]: RunbookSource,
  [RunbookView.PREVIEW]: RunbookPreview,
  [RunbookView.VARIABLES]: RunbookVariables,
};

const VIEW_ORDER = Object.values(RunbookView);

/** Each visited view's tab once `view` shows `tabId`. */
function withViewTab(
  viewTabs: ViewTabs,
  view: RunbookView,
  tabId: string | null,
): ViewTabs {
  const next = { ...viewTabs, [view]: tabId };

  for (const other of VIEW_ORDER) {
    if (other !== view && next[other] === tabId) {
      next[other] = null;
    }
  }

  return next;
}

/** A visited view, kept mounted. */
const KeptView = memo(function KeptView({
  view,
  tabId,
  shown,
}: {
  view: RunbookView;
  tabId: string | null;
  shown: boolean;
}) {
  const scope = useMemo(() => ({ tabId, shown }), [tabId, shown]);
  const View = RUNBOOK_VIEWS[view];

  return (
    <div
      className={classNames("runbook-view", !shown && "runbook-view-hidden")}
    >
      <ViewScopeContext.Provider value={scope}>
        <View />
      </ViewScopeContext.Provider>
    </div>
  );
});

export function MainPanel() {
  const activeId = useStore((state) => getActiveTab(state)?.id ?? null);
  const shownView = useStore(getRunbookView);
  const [viewTabs, setViewTabs] = useState<ViewTabs>({});

  if (viewTabs[shownView] !== activeId) {
    setViewTabs(withViewTab(viewTabs, shownView, activeId));
  }

  return (
    <main id="main-panel" className={CssClass.PANEL_CARD}>
      <TabsBar />
      <VariablesViewContext.Provider value>
        <div className="runbook-views">
          {VIEW_ORDER.filter((view) => view in viewTabs).map((view) => (
            <KeptView
              key={view}
              view={view}
              tabId={viewTabs[view] ?? null}
              shown={view === shownView}
            />
          ))}
        </div>
      </VariablesViewContext.Provider>
    </main>
  );
}
