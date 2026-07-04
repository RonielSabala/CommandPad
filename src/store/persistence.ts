import { RunbookConfig, StorageKey } from "@/common/config";
import { AppMode, SectionState, SidebarPosition, Theme } from "@/common/enums";
import type { RunbookEntry, Tab } from "@/common/types";

export interface PersistedUiState {
  mode: AppMode;
  sidebarCollapsed: boolean;
  sidebarPosition: SidebarPosition;
  scrollTop: number;
  theme: Theme;
}

export function saveUiState(ui: PersistedUiState): void {
  try {
    localStorage.setItem(
      StorageKey.STATE,
      JSON.stringify({
        mode: ui.mode,
        sidebar: ui.sidebarCollapsed
          ? SectionState.COLLAPSED
          : SectionState.EXPANDED,
        sidebarPosition: ui.sidebarPosition,
        scrollTop: ui.scrollTop,
        theme: ui.theme,
      }),
    );
  } catch (error) {
    console.warn("Failed to save UI state:", error);
  }
}

export function loadUiState(): Partial<PersistedUiState> | null {
  try {
    const saved = JSON.parse(localStorage.getItem(StorageKey.STATE) ?? "null");
    if (!saved) {
      return null;
    }

    return {
      mode: saved.mode === AppMode.READ ? AppMode.READ : AppMode.EDIT,
      sidebarCollapsed: saved.sidebar === SectionState.COLLAPSED,
      sidebarPosition:
        saved.sidebarPosition === SidebarPosition.RIGHT
          ? SidebarPosition.RIGHT
          : SidebarPosition.LEFT,
      scrollTop: saved.scrollTop ?? 0,
      theme: saved.theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK,
    };
  } catch (error) {
    console.warn("Failed to load UI state:", error);
    return null;
  }
}

export interface PersistedTabsMeta {
  tabOrder: { tabId: string; runbookId: string | null }[];
  activeTabId: string | null;
}

export function saveTabsMeta(tabs: Tab[], activeTabId: string | null): void {
  try {
    localStorage.setItem(
      StorageKey.TABS,
      JSON.stringify({
        tabOrder: tabs.map((t) => ({ tabId: t.id, runbookId: t.runbookId })),
        activeTabId,
      }),
    );
  } catch (error) {
    console.warn("Failed to save tabs:", error);
  }
}

export function loadTabsMeta(): PersistedTabsMeta | null {
  try {
    const saved = JSON.parse(localStorage.getItem(StorageKey.TABS) ?? "null");
    if (!saved?.tabOrder?.length) {
      return null;
    }
    return saved;
  } catch (error) {
    console.warn("Failed to load tabs:", error);
    return null;
  }
}

export function saveRunbookLibrary(
  items: RunbookEntry[],
  activeId: string | null,
): void {
  try {
    localStorage.setItem(
      RunbookConfig.LIBRARY_STORAGE_KEY,
      JSON.stringify({ items, activeId }),
    );
  } catch (error) {
    console.warn("Failed to save runbook library:", error);
  }
}

export function loadRunbookLibrary(): {
  items: RunbookEntry[];
  activeId: string | null;
} | null {
  try {
    const saved = JSON.parse(
      localStorage.getItem(RunbookConfig.LIBRARY_STORAGE_KEY) ?? "null",
    );
    if (!saved) {
      return null;
    }
    return { items: saved.items ?? [], activeId: saved.activeId ?? null };
  } catch (error) {
    console.warn("Failed to load runbook library:", error);
    return null;
  }
}

export interface PersistedSections {
  runbookSectionCollapsed: boolean;
  variablesSectionCollapsed: boolean;
}

export function saveSidebarSections(sections: PersistedSections): void {
  try {
    localStorage.setItem(
      RunbookConfig.SECTIONS_STORAGE_KEY,
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
    const saved = JSON.parse(
      localStorage.getItem(RunbookConfig.SECTIONS_STORAGE_KEY) ?? "null",
    );
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
