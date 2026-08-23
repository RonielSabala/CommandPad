import { RunbookView } from "@/common/enums";
import { RunbookVariables } from "@/components/variables/RunbookVariables";
import { getActiveTab, useStore } from "@/store/store";
import type { ComponentType } from "react";

import { TabsBar } from "../tabs/TabsBar";
import "./MainPanel.css";
import { RunbookPreview } from "./RunbookPreview";
import { RunbookSource } from "./RunbookSource";

const RUNBOOK_VIEWS: Record<RunbookView, ComponentType> = {
  [RunbookView.SOURCE]: RunbookSource,
  [RunbookView.PREVIEW]: RunbookPreview,
  [RunbookView.VARIABLES]: RunbookVariables,
};

export function MainPanel() {
  const view = useStore((state) =>
    getActiveTab(state) === null ? RunbookView.PREVIEW : state.runbookView,
  );

  const View = RUNBOOK_VIEWS[view];

  return (
    <main id="main-panel">
      <TabsBar />
      <View />
    </main>
  );
}
