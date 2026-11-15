import { ClampLines } from "@/common/editorConfig";
import { PanelId, PanelSide } from "@/common/enums";
import type { PanelState } from "@/common/types";
import { clamp } from "@/utils/number";

import type { StoreState } from "./types";

export function oppositeSide(side: PanelSide): PanelSide {
  return side === PanelSide.RIGHT ? PanelSide.LEFT : PanelSide.RIGHT;
}

export function toClampMaxLines(lines: number): number {
  return Math.round(clamp(lines, ClampLines.MIN, ClampLines.MAX));
}

/** Replace one panel's state. */
export function withPanel(
  state: StoreState,
  panelId: PanelId,
  patch: Partial<PanelState>,
): Pick<StoreState, "panels"> {
  return {
    panels: {
      ...state.panels,
      [panelId]: { ...state.panels[panelId], ...patch },
    },
  };
}

export function uiStateSnapshot(state: StoreState) {
  return {
    mode: state.mode,
    theme: state.theme,
    language: state.language,
    spellcheckEnabled: state.spellcheckEnabled,
    commandPromptEnabled: state.commandPromptEnabled,
    clampMaxLines: state.clampMaxLines,
    defaultCommandLanguage: state.defaultCommandLanguage,
    defaultVariableLanguage: state.defaultVariableLanguage,
    panels: state.panels,
    variableKeyRatio: state.variableKeyRatio,
    minimapEnabled: state.minimapEnabled,
    minimapPosition: state.minimapPosition,
    lastExportDestination: state.lastExportDestination,
    lastExportFormat: state.lastExportFormat,
    lastExportFilename: state.lastExportFilename,
    lastExportFilenameTabId: state.lastExportFilenameTabId,
    lastExportFolderPath: state.lastExportFolderPath,
    lastImportSource: state.lastImportSource,
  };
}

export function sidebarSectionsSnapshot(state: StoreState) {
  return {
    runbookSectionCollapsed: state.runbookSectionCollapsed,
    variablesSectionCollapsed: state.variablesSectionCollapsed,
  };
}
