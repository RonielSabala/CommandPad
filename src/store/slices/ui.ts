import { PANEL_DEFINITIONS, VariableSplit } from "@/common/config";
import { AppMode, PanelSide, RunbookView, Theme } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { clamp } from "@/utils/number";
import { buildRunbookSource, parseRunbookSource } from "@/utils/runbookSource";

import type { StoreKit } from "@/store/kit";
import { getActiveTab } from "@/store/selectors";
import { tabContent, withActiveTab, relabelActive } from "@/store/tabState";
import type { StoreState } from "@/store/types";
import { withPanel, uiStateSnapshot } from "@/store/uiState";

type UiActions = Pick<
  StoreState,
  | "setAppMode"
  | "toggleAppMode"
  | "toggleRunbookView"
  | "applyRunbookSource"
  | "toggleTheme"
  | "toggleSpellcheck"
  | "setLanguage"
  | "toggleMinimap"
  | "toggleMinimapPosition"
  | "togglePanel"
  | "togglePanelSide"
  | "setPanelWidth"
  | "resetPanelWidth"
  | "setVariableKeyRatio"
  | "resetVariableKeyRatio"
  | "toggleRunbookSection"
  | "toggleVariablesSection"
  | "setRunbookSearchQuery"
  | "setVariableSearchQuery"
>;

export function createUiSlice(kit: StoreKit): UiActions {
  const { set, get, persist, debouncedSaveState } = kit;

  return {
    setAppMode: (mode) => {
      set({ mode });
      get().saveState();
    },

    toggleAppMode: () => {
      const wasRead = get().mode === AppMode.READ;
      if (!wasRead) {
        get().clearUserInteraction();
      }
      get().setAppMode(wasRead ? AppMode.EDIT : AppMode.READ);
    },

    toggleRunbookView: (view) => {
      if (!getActiveTab(get())) {
        return;
      }

      get().clearUserInteraction();
      set((s) =>
        withActiveTab(s, (tab) => ({
          ...tab,
          view: tab.view === view ? RunbookView.PREVIEW : view,
        })),
      );

      persist.saveTabsMeta(get().tabs, get().activeTabId);
    },

    applyRunbookSource: (text) => {
      const state = get();
      const active = getActiveTab(state);
      if (state.mode === AppMode.READ || !active) {
        return null;
      }

      let content: RunbookContent;
      try {
        content = parseRunbookSource(text, tabContent(active));
      } catch {
        return null;
      }

      set((s) => {
        const updated = withActiveTab(s, (tab) => ({ ...tab, ...content }));
        return { ...updated, ...relabelActive({ ...s, ...updated }) };
      });

      debouncedSaveState();
      return buildRunbookSource(content);
    },

    toggleTheme: () => {
      set((s) => ({
        theme: s.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
      }));

      persist.saveUiState(uiStateSnapshot(get()));
    },

    toggleSpellcheck: () => {
      set((s) => ({ spellcheckEnabled: !s.spellcheckEnabled }));
      persist.saveUiState(uiStateSnapshot(get()));
    },

    setLanguage: (language) => {
      if (get().language === language) {
        return;
      }

      set({ language });
      persist.saveUiState(uiStateSnapshot(get()));
    },

    toggleMinimap: () => {
      set((s) => ({ minimapEnabled: !s.minimapEnabled }));
      get().saveState();
    },

    toggleMinimapPosition: () => {
      set((s) => ({
        minimapPosition:
          s.minimapPosition === PanelSide.RIGHT
            ? PanelSide.LEFT
            : PanelSide.RIGHT,
      }));
      get().saveState();
    },

    togglePanel: (panelId) => {
      set((s) => {
        const panel = s.panels[panelId];
        return withPanel(s, panelId, {
          collapsed: !panel.collapsed,
          width: panel.collapsed
            ? PANEL_DEFINITIONS[panelId].defaultWidth
            : panel.width,
        });
      });

      get().saveState();
    },

    togglePanelSide: (panelId) => {
      set((s) =>
        withPanel(s, panelId, {
          side:
            s.panels[panelId].side === PanelSide.RIGHT
              ? PanelSide.LEFT
              : PanelSide.RIGHT,
        }),
      );

      get().saveState();
    },

    setPanelWidth: (panelId, width) => {
      const definition = PANEL_DEFINITIONS[panelId];
      const shouldCollapse = width < definition.collapseSnap;
      const max = Math.floor(window.innerWidth * definition.maxScreenFraction);

      set((s) =>
        withPanel(s, panelId, {
          collapsed: shouldCollapse,
          width: shouldCollapse
            ? definition.defaultWidth
            : Math.min(max, Math.round(width)),
        }),
      );

      debouncedSaveState();
    },

    resetPanelWidth: (panelId) => {
      set((s) =>
        withPanel(s, panelId, {
          width: PANEL_DEFINITIONS[panelId].defaultWidth,
        }),
      );

      get().saveState();
    },

    setVariableKeyRatio: (ratio: number) => {
      set({
        variableKeyRatio: clamp(ratio, VariableSplit.MIN, VariableSplit.MAX),
      });
      debouncedSaveState();
    },

    resetVariableKeyRatio: () => {
      set({ variableKeyRatio: VariableSplit.DEFAULT });
      get().saveState();
    },

    toggleRunbookSection: () => {
      set((s) => ({ runbookSectionCollapsed: !s.runbookSectionCollapsed }));
      const state = get();
      persist.saveSidebarSections({
        runbookSectionCollapsed: state.runbookSectionCollapsed,
        variablesSectionCollapsed: state.variablesSectionCollapsed,
      });
    },

    toggleVariablesSection: () => {
      set((s) => ({
        variablesSectionCollapsed: !s.variablesSectionCollapsed,
      }));
      const state = get();
      persist.saveSidebarSections({
        runbookSectionCollapsed: state.runbookSectionCollapsed,
        variablesSectionCollapsed: state.variablesSectionCollapsed,
      });
    },

    setRunbookSearchQuery: (query) => set({ runbookSearchQuery: query }),
    setVariableSearchQuery: (query) => set({ variableSearchQuery: query }),
  };
}
