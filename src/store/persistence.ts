import { StorageKey, VariableSplit } from "@/common/config";
import {
  AppMode,
  ExportFormat,
  SectionState,
  SidebarPosition,
  SyncDestination,
  Theme,
} from "@/common/enums";
import type { RunbookEntry, Tab } from "@/common/types";
import { detectLanguage, isLanguage } from "@/i18n/messages";
import type { Language } from "@/i18n/types";
import { clamp } from "@/utils/number";

function getSavedItemByKey(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? "null");
}

const isSyncDestination = (value: unknown): value is SyncDestination =>
  Object.values(SyncDestination).includes(value as SyncDestination);

const isExportFormat = (value: unknown): value is ExportFormat =>
  Object.values(ExportFormat).includes(value as ExportFormat);

// UI state

interface PersistedUiState {
  mode: AppMode;
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  sidebarPosition: SidebarPosition;
  sidebarWidth: number;
  variableKeyRatio: number;
  minimapEnabled: boolean;
  minimapPosition: SidebarPosition;
  lastExportDestination: SyncDestination;
  lastExportFormat: ExportFormat;
  lastImportSource: SyncDestination;
}

export function saveUiState(ui: PersistedUiState): void {
  try {
    localStorage.setItem(
      StorageKey.UI_STATE,
      JSON.stringify({
        mode: ui.mode,
        theme: ui.theme,
        language: ui.language,
        sidebarCollapsed: ui.sidebarCollapsed
          ? SectionState.COLLAPSED
          : SectionState.EXPANDED,
        sidebarPosition: ui.sidebarPosition,
        sidebarWidth: ui.sidebarWidth,
        variableKeyRatio: ui.variableKeyRatio,
        minimapEnabled: ui.minimapEnabled,
        minimapPosition: ui.minimapPosition,
        lastExportDestination: ui.lastExportDestination,
        lastExportFormat: ui.lastExportFormat,
        lastImportSource: ui.lastImportSource,
      }),
    );
  } catch (error) {
    console.warn("Failed to save UI state:", error);
  }
}

export function loadUiState(): Partial<PersistedUiState> | null {
  try {
    const saved = getSavedItemByKey(StorageKey.UI_STATE);
    if (!saved) {
      return null;
    }

    return {
      mode: saved.mode === AppMode.READ ? AppMode.READ : AppMode.EDIT,
      theme: saved.theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK,
      language: isLanguage(saved.language) ? saved.language : detectLanguage(),
      sidebarCollapsed: saved.sidebarCollapsed === SectionState.COLLAPSED,
      sidebarPosition:
        saved.sidebarPosition === SidebarPosition.RIGHT
          ? SidebarPosition.RIGHT
          : SidebarPosition.LEFT,
      ...(typeof saved.sidebarWidth === "number"
        ? { sidebarWidth: saved.sidebarWidth }
        : {}),
      ...(typeof saved.variableKeyRatio === "number"
        ? {
            variableKeyRatio: clamp(
              saved.variableKeyRatio,
              VariableSplit.MIN,
              VariableSplit.MAX,
            ),
          }
        : {}),
      minimapEnabled: saved.minimapEnabled !== false,
      minimapPosition:
        saved.minimapPosition === SidebarPosition.LEFT
          ? SidebarPosition.LEFT
          : SidebarPosition.RIGHT,
      ...(isSyncDestination(saved.lastExportDestination)
        ? { lastExportDestination: saved.lastExportDestination }
        : {}),
      ...(isExportFormat(saved.lastExportFormat)
        ? { lastExportFormat: saved.lastExportFormat }
        : {}),
      ...(isSyncDestination(saved.lastImportSource)
        ? { lastImportSource: saved.lastImportSource }
        : {}),
    };
  } catch (error) {
    console.warn("Failed to load UI state:", error);
    return null;
  }
}

// Tabs

interface PersistedTabs {
  activeTabId: string | null;
  tabOrder: { tabId: string; runbookId: string | null; scrollTop?: number }[];
}

export function saveTabsMeta(tabs: Tab[], activeTabId: string | null): void {
  try {
    localStorage.setItem(
      StorageKey.TABS,
      JSON.stringify({
        activeTabId,
        tabOrder: tabs.map((tab) => ({
          tabId: tab.id,
          runbookId: tab.runbookId,
          scrollTop: tab.scrollTop,
        })),
      }),
    );
  } catch (error) {
    console.warn("Failed to save tabs:", error);
  }
}

export function loadTabsMeta(): PersistedTabs | null {
  try {
    const saved = getSavedItemByKey(StorageKey.TABS);
    if (!saved?.tabOrder?.length) {
      return null;
    }

    return saved;
  } catch (error) {
    console.warn("Failed to load tabs:", error);
    return null;
  }
}

// Runbooks

interface PersistedRunbooks {
  items: RunbookEntry[];
  activeId: string | null;
}

export function saveRunbookLibrary(
  items: RunbookEntry[],
  activeId: string | null,
): void {
  try {
    localStorage.setItem(
      StorageKey.RUNBOOK_LIBRARY,
      JSON.stringify({ items, activeId }),
    );
  } catch (error) {
    console.warn("Failed to save runbook library:", error);
  }
}

export function loadRunbookLibrary(): PersistedRunbooks | null {
  try {
    const saved = getSavedItemByKey(StorageKey.RUNBOOK_LIBRARY);
    if (!saved) {
      return null;
    }

    return { items: saved.items ?? [], activeId: saved.activeId ?? null };
  } catch (error) {
    console.warn("Failed to load runbook library:", error);
    return null;
  }
}

export function clearStoredRunbooks(): void {
  try {
    localStorage.removeItem(StorageKey.TABS);
    localStorage.removeItem(StorageKey.RUNBOOK_LIBRARY);
  } catch (error) {
    console.warn("Failed to clear stored runbooks:", error);
  }
}

// Sidebar sections

export interface PersistedSections {
  runbookSectionCollapsed: boolean;
  variablesSectionCollapsed: boolean;
}

export function saveSidebarSections(sections: PersistedSections): void {
  try {
    localStorage.setItem(
      StorageKey.SIDEBAR_SECTIONS,
      JSON.stringify({
        runbooks: sections.runbookSectionCollapsed
          ? SectionState.COLLAPSED
          : SectionState.EXPANDED,
        variables: sections.variablesSectionCollapsed
          ? SectionState.COLLAPSED
          : SectionState.EXPANDED,
      }),
    );
  } catch (error) {
    console.warn("Failed to save sidebar section state:", error);
  }
}

export function loadSidebarSections(): PersistedSections | null {
  try {
    const saved = getSavedItemByKey(StorageKey.SIDEBAR_SECTIONS);
    if (!saved) {
      return null;
    }

    return {
      runbookSectionCollapsed: saved.runbooks === SectionState.COLLAPSED,
      variablesSectionCollapsed: saved.variables === SectionState.COLLAPSED,
    };
  } catch (error) {
    console.warn("Failed to load sidebar section state:", error);
    return null;
  }
}
