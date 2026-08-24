import {
  createDefaultPanels,
  createDefaultScrollTop,
  PANEL_DEFINITIONS,
  StorageKey,
  VariableSplit,
} from "@/common/config";
import {
  AppMode,
  CloudProvider,
  ExportFormat,
  PanelId,
  PanelSide,
  RunbookView,
  SectionState,
  SyncDestination,
  Theme,
} from "@/common/enums";
import type {
  PanelState,
  RunbookEntry,
  RunbookSync,
  Tab,
  VaultRecord,
} from "@/common/types";
import { detectLanguage, isLanguage } from "@/i18n/messages";
import type { Language } from "@/i18n/types";
import type { CloudFolderRef } from "@/services/cloud";
import { clamp } from "@/utils/number";
import { isNumber, isObject, isString } from "@/utils/typeGuards";

const PANEL_IDS = Object.keys(PANEL_DEFINITIONS) as PanelId[];

function getSavedItemByKey(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? "null");
}

const isSyncDestination = (value: unknown): value is SyncDestination =>
  Object.values(SyncDestination).includes(value as SyncDestination);

const isExportFormat = (value: unknown): value is ExportFormat =>
  Object.values(ExportFormat).includes(value as ExportFormat);

const isRunbookView = (value: unknown): value is RunbookView =>
  Object.values(RunbookView).includes(value as RunbookView);

const toPanelSide = (value: unknown, fallback: PanelSide): PanelSide => {
  if (value === PanelSide.LEFT || value === PanelSide.RIGHT) {
    return value;
  }

  return fallback;
};

function serializePanels(panels: Record<PanelId, PanelState>) {
  const saved: Record<string, unknown> = {};

  for (const panelId of PANEL_IDS) {
    const panel = panels[panelId];
    saved[panelId] = {
      state: panel.collapsed ? SectionState.COLLAPSED : SectionState.EXPANDED,
      side: panel.side,
      width: panel.width,
    };
  }

  return saved;
}

function restorePanels(saved: unknown): Record<PanelId, PanelState> {
  const panels = createDefaultPanels();
  if (!isObject(saved)) {
    return panels;
  }

  for (const panelId of PANEL_IDS) {
    const entry = saved[panelId];
    if (!isObject(entry)) {
      continue;
    }

    const fallback = panels[panelId];
    panels[panelId] = {
      collapsed: entry.state === SectionState.COLLAPSED,
      side: toPanelSide(entry.side, fallback.side),
      width: isNumber(entry.width)
        ? Math.max(PANEL_DEFINITIONS[panelId].collapseSnap, entry.width)
        : fallback.width,
    };
  }

  return panels;
}

const isCloudFolderPath = (value: unknown): value is CloudFolderRef[] =>
  Array.isArray(value) &&
  value.every(
    (step) => isObject(step) && isString(step.id) && isString(step.name),
  );

// UI state

interface PersistedUiState {
  mode: AppMode;
  runbookView: RunbookView;
  theme: Theme;
  language: Language;
  spellcheckEnabled: boolean;
  panels: Record<PanelId, PanelState>;
  variableKeyRatio: number;
  minimapEnabled: boolean;
  minimapPosition: PanelSide;
  lastExportDestination: SyncDestination;
  lastExportFormat: ExportFormat;
  lastExportFilename: string;
  lastExportFilenameTabId: string | null;
  lastExportFolderPath: CloudFolderRef[];
  lastImportSource: SyncDestination;
}

export function saveUiState(ui: PersistedUiState): void {
  try {
    localStorage.setItem(
      StorageKey.UI_STATE,
      JSON.stringify({
        mode: ui.mode,
        runbookView: ui.runbookView,
        theme: ui.theme,
        language: ui.language,
        spellcheckEnabled: ui.spellcheckEnabled,
        panels: serializePanels(ui.panels),
        variableKeyRatio: ui.variableKeyRatio,
        minimapEnabled: ui.minimapEnabled,
        minimapPosition: ui.minimapPosition,
        lastExportDestination: ui.lastExportDestination,
        lastExportFormat: ui.lastExportFormat,
        lastExportFilename: ui.lastExportFilename,
        lastExportFilenameTabId: ui.lastExportFilenameTabId,
        lastExportFolderPath: ui.lastExportFolderPath,
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
      runbookView: isRunbookView(saved.runbookView)
        ? saved.runbookView
        : RunbookView.PREVIEW,
      theme: saved.theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK,
      language: isLanguage(saved.language) ? saved.language : detectLanguage(),
      spellcheckEnabled: saved.spellcheckEnabled === true,
      panels: restorePanels(saved.panels),
      ...(isNumber(saved.variableKeyRatio)
        ? {
            variableKeyRatio: clamp(
              saved.variableKeyRatio,
              VariableSplit.MIN,
              VariableSplit.MAX,
            ),
          }
        : {}),
      minimapEnabled: saved.minimapEnabled !== false,
      minimapPosition: toPanelSide(saved.minimapPosition, PanelSide.RIGHT),
      ...(isSyncDestination(saved.lastExportDestination)
        ? { lastExportDestination: saved.lastExportDestination }
        : {}),
      ...(isExportFormat(saved.lastExportFormat)
        ? { lastExportFormat: saved.lastExportFormat }
        : {}),
      ...(isString(saved.lastExportFilename)
        ? { lastExportFilename: saved.lastExportFilename }
        : {}),
      ...(isString(saved.lastExportFilenameTabId)
        ? { lastExportFilenameTabId: saved.lastExportFilenameTabId }
        : {}),
      ...(isCloudFolderPath(saved.lastExportFolderPath)
        ? { lastExportFolderPath: saved.lastExportFolderPath }
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
  tabOrder: { tabId: string; runbookId: string | null; scrollTop?: unknown }[];
}

export function restoreScrollTop(value: unknown): Record<RunbookView, number> {
  const scrollTop = createDefaultScrollTop();

  if (isObject(value)) {
    for (const view of Object.values(RunbookView)) {
      const saved = value[view];
      if (isNumber(saved)) {
        scrollTop[view] = saved;
      }
    }
  }

  return scrollTop;
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

const isRunbookSync = (value: unknown): value is RunbookSync =>
  isObject(value) &&
  Object.values(CloudProvider).includes(value.provider as CloudProvider) &&
  isString(value.filename) &&
  (isString(value.folderId) || value.folderId === null);

const isVaultRecord = (value: unknown): value is VaultRecord =>
  isObject(value) && isString(value.salt) && isString(value.verifier);

function restoreRunbookEntry(entry: RunbookEntry): RunbookEntry {
  return {
    ...entry,
    sync: isRunbookSync(entry.sync) ? entry.sync : undefined,
    secured: entry.secured === true,
    vault: isVaultRecord(entry.vault) ? entry.vault : undefined,
  };
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

    return {
      items: (saved.items ?? []).map(restoreRunbookEntry),
      activeId: saved.activeId ?? null,
    };
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
