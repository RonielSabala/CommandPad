import { createContext, useContext } from "react";
import {
  createStore,
  useStore as useZustandStore,
  type StoreApi,
} from "zustand";

import {
  DEBOUNCE_SAVE_MS,
  DEFAULT_TAB_LABEL,
  FilePickerConfig,
  RunbookConfig,
  SidebarWidth,
  VariableSplit,
} from "@/common/config";
import {
  AppMode,
  BlockType,
  CloudExportStatus,
  CloudProvider,
  ExportFormat,
  MoveDirection,
  NoteStyle,
  SidebarPosition,
  SyncDestination,
  Theme,
  VariableField,
} from "@/common/enums";
import type {
  Block,
  RunbookContent,
  RunbookEntry,
  Tab,
  Variable,
} from "@/common/types";
import { detectLanguage, getMessages } from "@/i18n/messages";
import { Language } from "@/i18n/types";
import { getCloudClient, type CloudFile } from "@/services/cloud";
import { debounce } from "@/utils/debounce";
import {
  buildMarkdownExport,
  buildRunbookExportContent,
  runExport,
} from "@/utils/export";
import { generateId } from "@/utils/id";
import { openImportDialog } from "@/utils/importTrigger";
import { clamp } from "@/utils/number";
import {
  carryVariables,
  getVariableKey,
  renameAllVariableTokens,
  renameVariableTokens,
} from "@/utils/resolution";
import { getRunbookLabel } from "@/utils/runbook";

import * as persistence from "./persistence";
import {
  deleteRunbookContent,
  deleteRunbookDb,
  getRunbookContent,
  putRunbookContent,
} from "./runbookDb";

interface Dialog<T> {
  message: string;
  resolve: (value: T) => void;
}

interface ConfirmDialog extends Dialog<boolean> {
  title: string;
  confirmLabel: string;
  danger: boolean;
}

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  danger?: boolean;
}

export interface StoreState {
  // Data
  tabs: Tab[];
  activeTabId: string | null;
  runbookLibrary: RunbookEntry[];
  activeRunbookId: string | null;

  // UI
  mode: AppMode;
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  sidebarPosition: SidebarPosition;
  sidebarWidth: number;
  variableKeyRatio: number;
  minimapEnabled: boolean;
  minimapPosition: SidebarPosition;
  runbookSectionCollapsed: boolean;
  variablesSectionCollapsed: boolean;

  // Interaction / selection
  focusedRunbookId: string | null;
  selectedBlockIds: Set<string>;
  flashBlockIds: Set<string>;
  selectKeyHeld: boolean;
  linkKeyHeld: boolean;
  pendingFocusBlockId: string | null;
  pendingFocusVariableId: string | null;

  // Search
  runbookSearchQuery: string;
  variableSearchQuery: string;

  // Modals / dialogs
  exportModalOpen: boolean;
  cloudExportStatus: CloudExportStatus;
  cloudExportProvider: CloudProvider | null;
  pasteRunbookModalOpen: boolean;
  confirmDialog: ConfirmDialog | null;
  alertDialog: Dialog<void> | null;

  // Cloud sync (SharePoint / Google Drive)
  destinationModalOpen: boolean;
  cloudImportModalOpen: boolean;
  cloudProvider: CloudProvider;
  cloudSignedIn: boolean;
  cloudAccountLabel: string | null;
  cloudFiles: CloudFile[];
  cloudLoading: boolean;
  cloudError: string | null;

  // Remembered cloud-sync choices
  lastExportDestination: SyncDestination;
  lastExportFormat: ExportFormat;
  lastImportSource: SyncDestination;

  // Bootstrap
  initialized: boolean;

  // Actions
  bootstrap: () => Promise<void>;
  saveState: () => void;

  createNewTab: (
    label?: string,
    runbookId?: string | null,
  ) => Promise<Tab | undefined>;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  reorderTabs: (
    sourceId: string,
    targetId: string,
    insertAfter: boolean,
  ) => void;

  loadRunbookFromLibrary: (runbookId: string) => Promise<void>;
  removeRunbookFromLibrary: (id: string) => Promise<void>;
  addRunbookToLibrary: (
    content: RunbookContent,
    filename: string,
    rawFilename: string,
  ) => Promise<void>;
  importRunbooks: (files: File[]) => Promise<void>;
  importRunbookFromText: (text: string) => Promise<boolean>;
  reorderRunbooks: (sourceId: string, targetId: string) => void;
  setRunbookFocus: (id: string | null) => void;
  navigateRunbookList: (direction: MoveDirection) => void;

  addVariable: () => Promise<void>;
  removeVariable: (variableId: string) => void;
  updateVariable: (
    variableId: string,
    field: VariableField,
    value: string,
  ) => void;
  toggleVariableSecret: (variableId: string) => void;
  reorderVariables: (sourceId: string, targetId: string) => void;
  consumeVariableFocus: () => void;

  addBlock: (blockType: BlockType) => Promise<void>;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  updateBlockText: (blockId: string, text: string) => void;
  updateBlockStyle: (blockId: string, style: NoteStyle) => void;
  toggleCommandEditor: (blockId: string) => void;
  toggleAllCommandEditors: () => void;
  reorderBlocks: (sourceId: string, targetId: string) => void;
  copyBlocksToTab: (
    sourceTabId: string,
    targetTabId: string,
    blockIds: string[],
    beforeBlockId?: string,
  ) => void;
  clearFlash: (blockId: string) => void;
  consumeBlockFocus: () => void;

  setBlockSelected: (blockId: string, selected: boolean) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;

  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  toggleMinimap: () => void;
  toggleMinimapPosition: () => void;
  toggleSidebarPosition: () => void;
  setSidebarSize: (width: number) => void;
  resetSidebarSize: () => void;
  setVariableKeyRatio: (ratio: number) => void;
  resetVariableKeyRatio: () => void;
  toggleRunbookSection: () => void;
  toggleVariablesSection: () => void;

  setRunbookSearchQuery: (query: string) => void;
  setVariableSearchQuery: (query: string) => void;

  setSelectKeyHeld: (held: boolean) => void;
  setLinkKeyHeld: (held: boolean) => void;
  setScrollTop: (scrollTop: number) => void;
  clearUserInteraction: () => void;

  openExportModal: () => void;
  closeExportModal: () => void;
  resetCloudExportStatus: () => void;
  openPasteRunbookModal: () => void;
  closePasteRunbookModal: () => void;
  exportRunbook: (
    destination: SyncDestination,
    format: ExportFormat,
    filename: string,
  ) => Promise<void>;
  copyRunbookMarkdown: () => Promise<void>;

  beginImport: () => void;
  openDestinationModal: () => void;
  closeDestinationModal: () => void;
  chooseDestination: (destination: SyncDestination) => void;
  startCloudImportBrowse: (provider: CloudProvider) => Promise<void>;
  returnToDestinationModal: () => void;
  closeCloudImportModal: () => void;
  signInToCloud: () => Promise<void>;
  signOutOfCloud: () => Promise<void>;
  refreshCloudFiles: () => Promise<void>;
  importRunbookFromCloud: (file: CloudFile) => Promise<void>;

  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;
  alert: (message: string) => Promise<void>;
  resolveAlert: () => void;
  clearRunbookLibrary: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

/** Resolve the active tab, mirroring the original `activeTab()` fallback. */
export function getActiveTab(state: StoreState): Tab | null {
  return (
    state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0] ?? null
  );
}

function uiStateSnapshot(state: StoreState) {
  return {
    mode: state.mode,
    theme: state.theme,
    language: state.language,
    sidebarCollapsed: state.sidebarCollapsed,
    sidebarPosition: state.sidebarPosition,
    sidebarWidth: state.sidebarWidth,
    variableKeyRatio: state.variableKeyRatio,
    minimapEnabled: state.minimapEnabled,
    minimapPosition: state.minimapPosition,
    lastExportDestination: state.lastExportDestination,
    lastExportFormat: state.lastExportFormat,
    lastImportSource: state.lastImportSource,
  };
}

function createTabObject(
  label = DEFAULT_TAB_LABEL,
  runbookId: string | null = null,
): Tab {
  return {
    id: generateId(),
    label,
    runbookId,
    variables: [],
    blocks: [],
    scrollTop: 0,
  };
}

/**
 * Parse raw JSON text into a `RunbookContent`, filling missing ids.
 * Throws when the JSON is malformed or lacks `variables`/`blocks`.
 */
function parseRunbookContent(raw: string): RunbookContent {
  const parsed = JSON.parse(raw);
  if (!parsed.variables || !parsed.blocks) {
    throw new Error("Invalid format");
  }

  return {
    variables: (parsed.variables as Variable[]).map((variable) => ({
      ...variable,
      id: variable.id || generateId(),
    })),
    blocks: (parsed.blocks as Block[]).map((block) => ({
      ...block,
      id: block.id || generateId(),
    })),
  };
}

/** Immutably replace the active tab via `mutate`. */
function withActiveTab(
  state: StoreState,
  mutate: (tab: Tab) => Tab,
): { tabs: Tab[] } {
  const active = getActiveTab(state);
  if (!active) {
    return { tabs: state.tabs };
  }
  return { tabs: state.tabs.map((t) => (t.id === active.id ? mutate(t) : t)) };
}

/**
 * Recompute a tab's label from its blocks and mirror it into the runbook
 * library entry. Returns the same references when nothing changed so the
 * tabs bar / runbook list don't re-render needlessly.
 */
function relabelTab(
  state: StoreState,
  tab: Tab | null,
): {
  tabs: Tab[];
  runbookLibrary: RunbookEntry[];
} {
  if (!tab?.runbookId) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  const entry = state.runbookLibrary.find((item) => item.id === tab.runbookId);
  if (!entry) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  const newLabel = getRunbookLabel(
    tab.blocks,
    entry.filename || RunbookConfig.DEFAULT_LABEL,
  );
  if (newLabel === entry.label && newLabel === tab.label) {
    return { tabs: state.tabs, runbookLibrary: state.runbookLibrary };
  }

  return {
    tabs: state.tabs.map((t) =>
      t.id === tab.id ? { ...t, label: newLabel } : t,
    ),
    runbookLibrary: state.runbookLibrary.map((item) =>
      item.id === entry.id ? { ...item, label: newLabel } : item,
    ),
  };
}

function relabelActive(state: StoreState): {
  tabs: Tab[];
  runbookLibrary: RunbookEntry[];
} {
  return relabelTab(state, getActiveTab(state));
}

export type AppStoreApi = StoreApi<StoreState>;

export interface AppStoreOptions {
  isDemo?: boolean;
  /** Pre-seeded runbook content for demo stores, keyed by runbook id */
  contentSeed?: Record<string, RunbookContent>;
}

type PersistenceWrites = Pick<
  typeof persistence,
  "saveTabsMeta" | "saveRunbookLibrary" | "saveUiState" | "saveSidebarSections"
>;

const NOOP_PERSISTENCE: PersistenceWrites = {
  saveTabsMeta: () => {},
  saveRunbookLibrary: () => {},
  saveUiState: () => {},
  saveSidebarSections: () => {},
};

interface ContentDb {
  get: (id: string) => Promise<RunbookContent | null>;
  put: (id: string, content: RunbookContent) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

const REAL_CONTENT_DB: ContentDb = {
  get: getRunbookContent,
  put: putRunbookContent,
  delete: deleteRunbookContent,
};

function createMemoryContentDb(
  seed: Record<string, RunbookContent> = {},
): ContentDb {
  const contents = new Map(Object.entries(seed));
  return {
    get: async (id) => contents.get(id) ?? null,
    put: async (id, content) => {
      contents.set(id, content);
    },
    delete: async (id) => {
      contents.delete(id);
    },
  };
}

export function createAppStore(options: AppStoreOptions = {}): AppStoreApi {
  const { isDemo = false, contentSeed } = options;
  const persist = isDemo ? NOOP_PERSISTENCE : persistence;
  const contentDb = isDemo
    ? createMemoryContentDb(contentSeed)
    : REAL_CONTENT_DB;

  let bootstrapped = false;

  return createStore<StoreState>()((set, get) => {
    const debouncedSaveState = debounce(
      () => get().saveState(),
      DEBOUNCE_SAVE_MS,
    );

    return {
      tabs: [],
      activeTabId: null,
      runbookLibrary: [],
      activeRunbookId: null,

      mode: AppMode.EDIT,
      theme: Theme.DARK,
      language: detectLanguage(),
      sidebarCollapsed: false,
      sidebarPosition: SidebarPosition.LEFT,
      sidebarWidth: SidebarWidth.DEFAULT,
      variableKeyRatio: VariableSplit.DEFAULT,
      minimapEnabled: true,
      minimapPosition: SidebarPosition.RIGHT,
      runbookSectionCollapsed: false,
      variablesSectionCollapsed: false,

      focusedRunbookId: null,
      selectedBlockIds: new Set(),
      flashBlockIds: new Set(),
      selectKeyHeld: false,
      linkKeyHeld: false,
      pendingFocusBlockId: null,
      pendingFocusVariableId: null,

      runbookSearchQuery: "",
      variableSearchQuery: "",

      exportModalOpen: false,
      cloudExportStatus: CloudExportStatus.IDLE,
      cloudExportProvider: null,
      pasteRunbookModalOpen: false,
      confirmDialog: null,
      alertDialog: null,

      destinationModalOpen: false,
      cloudImportModalOpen: false,
      cloudProvider: CloudProvider.SHAREPOINT,
      cloudSignedIn: false,
      cloudAccountLabel: null,
      cloudFiles: [],
      cloudLoading: false,
      cloudError: null,

      lastExportDestination: SyncDestination.LOCAL,
      lastExportFormat: ExportFormat.JSON,
      lastImportSource: SyncDestination.LOCAL,

      initialized: false,

      // --- Persistence ---

      saveState: () => {
        const state = get();
        if (!state.initialized) {
          return;
        }

        persist.saveTabsMeta(state.tabs, state.activeTabId);
        persist.saveRunbookLibrary(state.runbookLibrary, state.activeRunbookId);
        persist.saveUiState(uiStateSnapshot(state));

        const active = getActiveTab(state);
        if (active?.runbookId) {
          contentDb
            .put(active.runbookId, {
              variables: active.variables,
              blocks: active.blocks,
            })
            .catch((error) =>
              console.warn("Failed to persist runbook content:", error),
            );
        }
      },

      bootstrap: async () => {
        if (bootstrapped) {
          return;
        }
        bootstrapped = true;

        const ui = persistence.loadUiState();
        const library = persistence.loadRunbookLibrary();
        const sections = persistence.loadSidebarSections();
        const meta = persistence.loadTabsMeta();

        const activeTabMeta = meta
          ? (meta.tabOrder.find((tab) => tab.tabId === meta.activeTabId) ??
            meta.tabOrder[0])
          : undefined;

        const initialActiveRunbookId =
          activeTabMeta?.runbookId ?? library?.activeId ?? null;

        set({
          ...(ui ?? {}),
          ...(library ? { runbookLibrary: library.items } : {}),
          activeRunbookId: initialActiveRunbookId,
          ...(sections ?? {}),
        });

        try {
          if (meta) {
            const currentLibrary = get().runbookLibrary;
            const loadedTabs: Tab[] = [];

            for (const { tabId, runbookId, scrollTop } of meta.tabOrder) {
              const entry = currentLibrary.find((r) => r.id === runbookId);
              if (!entry || runbookId === null) {
                continue;
              }
              const content = await contentDb.get(runbookId);
              if (!content) {
                continue;
              }
              loadedTabs.push({
                id: tabId,
                label: entry.label,
                runbookId,
                variables: content.variables ?? [],
                blocks: content.blocks ?? [],
                scrollTop: scrollTop ?? 0,
              });
            }

            if (loadedTabs.length > 0) {
              const activeId =
                meta.activeTabId &&
                loadedTabs.some((t) => t.id === meta.activeTabId)
                  ? meta.activeTabId
                  : loadedTabs[0].id;
              const activeTab = loadedTabs.find((t) => t.id === activeId);
              set({
                tabs: loadedTabs,
                activeTabId: activeId,
                activeRunbookId: activeTab?.runbookId ?? null,
              });
            }
          }
        } catch (error) {
          console.warn("Failed to rehydrate tabs:", error);
        }

        set({ initialized: true });
      },

      // --- Tabs ---

      createNewTab: async (label, runbookId) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }

        if (runbookId) {
          const existingTab = state.tabs.find((t) => t.runbookId === runbookId);
          if (existingTab) {
            get().switchTab(existingTab.id);
            return existingTab;
          }
        }

        const resolvedLabel = label ?? DEFAULT_TAB_LABEL;
        const tab = createTabObject(resolvedLabel, runbookId ?? null);

        if (!runbookId) {
          const newRunbookId = generateId();
          tab.runbookId = newRunbookId;
          const entry: RunbookEntry = {
            id: newRunbookId,
            label: resolvedLabel,
            filename: "",
          };

          set((s) => ({
            tabs: [...s.tabs, tab],
            activeTabId: tab.id,
            runbookLibrary: [...s.runbookLibrary, entry],
            activeRunbookId: newRunbookId,
            focusedRunbookId: null,
          }));

          await contentDb.put(newRunbookId, { variables: [], blocks: [] });
          persist.saveRunbookLibrary(
            get().runbookLibrary,
            get().activeRunbookId,
          );
        } else {
          set((s) => ({
            tabs: [...s.tabs, tab],
            activeTabId: tab.id,
            focusedRunbookId: null,
          }));
        }

        persist.saveTabsMeta(get().tabs, get().activeTabId);
        return tab;
      },

      switchTab: (tabId) => {
        if (get().activeTabId === tabId) {
          return;
        }
        set((s) => ({
          activeTabId: tabId,
          activeRunbookId:
            getActiveTab({ ...s, activeTabId: tabId })?.runbookId ?? null,
          selectKeyHeld: false,
        }));
        persist.saveTabsMeta(get().tabs, get().activeTabId);
      },

      closeTab: (tabId) => {
        const state = get();
        let idx = state.tabs.findIndex((t) => t.id === tabId);
        if (idx < 0) {
          return;
        }

        const tabs = state.tabs.filter((t) => t.id !== tabId);
        let activeTabId = state.activeTabId;

        if (tabs.length === 0) {
          activeTabId = null;
        } else if (state.activeTabId === tabId) {
          idx = Math.min(idx, tabs.length - 1);
          activeTabId = tabs[idx].id;
        }

        const activeRunbookId =
          tabs.find((t) => t.id === activeTabId)?.runbookId ?? null;
        set({ tabs, activeTabId, activeRunbookId });
        persist.saveTabsMeta(tabs, activeTabId);
      },

      reorderTabs: (sourceId, targetId, insertAfter) => {
        const tabs = [...get().tabs];
        const srcIdx = tabs.findIndex((t) => t.id === sourceId);
        if (srcIdx < 0) {
          return;
        }

        const [dragged] = tabs.splice(srcIdx, 1);
        let dstIdx = tabs.findIndex((t) => t.id === targetId);
        if (insertAfter) {
          dstIdx++;
        }
        tabs.splice(dstIdx, 0, dragged);

        set({ tabs });
        persist.saveTabsMeta(tabs, get().activeTabId);
      },

      // --- Runbook library ---

      loadRunbookFromLibrary: async (runbookId) => {
        const content = await contentDb.get(runbookId);
        if (!content) {
          return;
        }

        const state = get();
        const existingTab = state.tabs.find((t) => t.runbookId === runbookId);
        if (existingTab) {
          get().switchTab(existingTab.id);
          return;
        }

        const runbook = state.runbookLibrary.find((r) => r.id === runbookId);
        const label = runbook?.label ?? DEFAULT_TAB_LABEL;
        const tab = createTabObject(label, runbookId);
        tab.variables = content.variables ?? [];
        tab.blocks = content.blocks ?? [];

        set((s) => ({
          tabs: [...s.tabs, tab],
          activeTabId: tab.id,
          activeRunbookId: runbookId,
        }));

        persist.saveTabsMeta(get().tabs, get().activeTabId);
        persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
      },

      removeRunbookFromLibrary: async (id) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }

        await contentDb.delete(id);

        const runbookLibrary = state.runbookLibrary.filter(
          (item) => item.id !== id,
        );
        let tabs = state.tabs;
        let activeTabId = state.activeTabId;

        let tabIdx = state.tabs.findIndex((t) => t.runbookId === id);
        if (tabIdx >= 0) {
          tabs = state.tabs.filter((t) => t.runbookId !== id);
          if (tabs.length === 0) {
            activeTabId = null;
          } else if (
            state.activeTabId === state.tabs[tabIdx]?.id ||
            !tabs.find((t) => t.id === activeTabId)
          ) {
            tabIdx = Math.min(tabIdx, tabs.length - 1);
            activeTabId = tabs[tabIdx].id;
          }
        }

        const activeRunbookId =
          tabs.find((t) => t.id === activeTabId)?.runbookId ?? null;

        let focusedRunbookId = state.focusedRunbookId;
        if (focusedRunbookId === id) {
          const removedIdx = state.runbookLibrary.findIndex(
            (item) => item.id === id,
          );

          focusedRunbookId =
            runbookLibrary.length === 0
              ? null
              : runbookLibrary[Math.min(removedIdx, runbookLibrary.length - 1)]
                  .id;
        }

        set({
          tabs,
          activeTabId,
          activeRunbookId,
          runbookLibrary,
          focusedRunbookId,
        });
        persist.saveTabsMeta(tabs, activeTabId);
        persist.saveRunbookLibrary(runbookLibrary, activeRunbookId);
      },

      addRunbookToLibrary: async (content, filename, rawFilename) => {
        const label = getRunbookLabel(
          content.blocks,
          filename || RunbookConfig.DEFAULT_LABEL,
        );
        const state = get();
        const existing = state.runbookLibrary.find(
          (item) => item.label === label || item.filename === filename,
        );

        if (existing) {
          const existingName = existing.label || existing.filename;
          const t = getMessages(get().language);
          const confirmed = await get().confirm(
            t.dialogs.overwriteMessage(rawFilename, existingName),
            {
              title: t.dialogs.overwriteTitle,
              confirmLabel: t.dialogs.overwriteConfirm,
              danger: true,
            },
          );

          if (!confirmed) {
            return;
          }

          await contentDb.put(existing.id, content);
          set((s) => ({
            runbookLibrary: s.runbookLibrary.map((item) =>
              item.id === existing.id
                ? { ...item, label, filename: filename || "" }
                : item,
            ),
            tabs: s.tabs.map((t) =>
              t.runbookId === existing.id
                ? {
                    ...t,
                    variables: content.variables ?? [],
                    blocks: content.blocks ?? [],
                  }
                : t,
            ),
          }));
          persist.saveRunbookLibrary(
            get().runbookLibrary,
            get().activeRunbookId,
          );
          if (existing.id === get().activeRunbookId) {
            persist.saveTabsMeta(get().tabs, get().activeTabId);
          }
          return;
        }

        const newId = generateId();
        await contentDb.put(newId, content);
        set((s) => ({
          runbookLibrary: [
            ...s.runbookLibrary,
            { id: newId, label, filename: filename || "" },
          ],
        }));

        if (get().activeRunbookId) {
          persist.saveRunbookLibrary(
            get().runbookLibrary,
            get().activeRunbookId,
          );
          return;
        }

        await get().loadRunbookFromLibrary(newId);
      },

      importRunbooks: async (files) => {
        let failedCount = 0;

        const readFile = (file: File) =>
          new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = async (loadEvent) => {
              try {
                const content = parseRunbookContent(
                  String(loadEvent.target?.result),
                );
                await get().addRunbookToLibrary(
                  content,
                  file.name.replace(/\.json$/i, ""),
                  file.name,
                );
              } catch {
                failedCount += 1;
              }
              resolve();
            };
            reader.onerror = () => {
              failedCount += 1;
              resolve();
            };
            reader.readAsText(file);
          });

        for (const file of files) {
          await readFile(file);
        }

        if (failedCount < files.length) {
          set({ lastImportSource: SyncDestination.LOCAL });
          persist.saveUiState(uiStateSnapshot(get()));
        }

        if (failedCount > 0) {
          await get().alert(
            getMessages(get().language).dialogs.importFailed(failedCount),
          );
        }
      },

      importRunbookFromText: async (text) => {
        let content: RunbookContent;
        try {
          content = parseRunbookContent(text);
        } catch {
          return false;
        }

        await get().addRunbookToLibrary(
          content,
          generateId(),
          getMessages(get().language).dialogs.pastedRunbook,
        );
        return true;
      },

      reorderRunbooks: (sourceId, targetId) => {
        const items = [...get().runbookLibrary];
        const sourceIndex = items.findIndex((item) => item.id === sourceId);
        const targetIndex = items.findIndex((item) => item.id === targetId);
        if (sourceIndex < 0 || targetIndex < 0) {
          return;
        }

        const [removed] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, removed);

        set({ runbookLibrary: items });
        persist.saveRunbookLibrary(items, get().activeRunbookId);
      },

      setRunbookFocus: (id) => set({ focusedRunbookId: id }),

      navigateRunbookList: (direction) => {
        const { runbookLibrary, focusedRunbookId } = get();
        if (runbookLibrary.length === 0) {
          return;
        }

        const count = runbookLibrary.length;
        const currentIndex = runbookLibrary.findIndex(
          (item) => item.id === focusedRunbookId,
        );

        let nextIndex: number;
        if (currentIndex < 0) {
          nextIndex = direction === MoveDirection.DOWN ? 0 : count - 1;
        } else {
          nextIndex =
            direction === MoveDirection.DOWN
              ? (currentIndex + 1) % count
              : (currentIndex - 1 + count) % count;
        }

        const nextId = runbookLibrary[nextIndex].id;
        set({ focusedRunbookId: nextId });
        void get().loadRunbookFromLibrary(nextId);
      },

      // --- Variables ---

      addVariable: async () => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }
        if (state.tabs.length === 0) {
          await get().createNewTab();
        }

        const newVariable: Variable = { id: generateId(), key: "", value: "" };
        set((s) => ({
          ...withActiveTab(s, (tab) => ({
            ...tab,
            variables: [...tab.variables, newVariable],
          })),
          pendingFocusVariableId: newVariable.id,
        }));
        get().saveState();
      },

      removeVariable: (variableId) => {
        if (get().mode === AppMode.READ) {
          return;
        }
        set((s) =>
          withActiveTab(s, (tab) => ({
            ...tab,
            variables: tab.variables.filter((v) => v.id !== variableId),
          })),
        );
        get().saveState();
      },

      updateVariable: (variableId, field, value) => {
        set((s) =>
          withActiveTab(s, (tab) => {
            const target = tab.variables.find((v) => v.id === variableId);
            if (!target) {
              return tab;
            }

            let blocks = tab.blocks;
            let variables = tab.variables;

            if (field === VariableField.KEY) {
              const oldKey = getVariableKey(target);
              const newKey = value.trim();

              if (oldKey && newKey && oldKey !== newKey) {
                const renameTokens = (text: string) =>
                  renameVariableTokens(text, oldKey, newKey);

                blocks = tab.blocks.map((b) => {
                  if (b.type !== BlockType.COMMAND) {
                    return b;
                  }

                  const text = renameTokens(b.text);
                  return text === b.text ? b : { ...b, text };
                });

                variables = tab.variables.map((v) => {
                  if (v.id === variableId) {
                    return v;
                  }

                  const value = renameTokens(v.value);
                  return value === v.value ? v : { ...v, value };
                });
              }
            }

            variables = variables.map((v) =>
              v.id === variableId ? { ...v, [field]: value } : v,
            );
            return { ...tab, blocks, variables };
          }),
        );

        debouncedSaveState();
      },

      toggleVariableSecret: (variableId) => {
        set((s) =>
          withActiveTab(s, (tab) => ({
            ...tab,
            variables: tab.variables.map((v) =>
              v.id === variableId ? { ...v, secret: !v.secret } : v,
            ),
          })),
        );
        get().saveState();
      },

      reorderVariables: (sourceId, targetId) => {
        set((s) =>
          withActiveTab(s, (tab) => {
            const variables = [...tab.variables];
            const sourceIndex = variables.findIndex((v) => v.id === sourceId);
            const targetIndex = variables.findIndex((v) => v.id === targetId);
            if (sourceIndex < 0 || targetIndex < 0) {
              return tab;
            }
            const [removed] = variables.splice(sourceIndex, 1);
            variables.splice(targetIndex, 0, removed);
            return { ...tab, variables };
          }),
        );
        get().saveState();
      },

      consumeVariableFocus: () => set({ pendingFocusVariableId: null }),

      // --- Blocks ---

      addBlock: async (blockType) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }
        if (state.tabs.length === 0) {
          await get().createNewTab();
        }

        let newBlock: Block;
        if (blockType === BlockType.COMMAND) {
          newBlock = { id: generateId(), type: BlockType.COMMAND, text: "" };
        } else if (blockType === BlockType.NOTE) {
          newBlock = {
            id: generateId(),
            type: BlockType.NOTE,
            text: "",
            style: NoteStyle.BODY,
          };
        } else {
          newBlock = { id: generateId(), type: BlockType.DIVIDER };
        }

        set((s) => ({
          ...withActiveTab(s, (tab) => ({
            ...tab,
            blocks: [...tab.blocks, newBlock],
          })),
          pendingFocusBlockId: newBlock.id,
        }));
        get().saveState();
      },

      removeBlock: (blockId) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }

        const isSelected =
          state.selectedBlockIds.size > 0 &&
          state.selectedBlockIds.has(blockId);

        const idsToRemove = isSelected
          ? new Set(state.selectedBlockIds)
          : new Set([blockId]);

        set((s) => ({
          ...withActiveTab(s, (tab) => ({
            ...tab,
            blocks: tab.blocks.filter((b) => !idsToRemove.has(b.id)),
          })),
          selectedBlockIds: isSelected ? new Set() : s.selectedBlockIds,
        }));
        get().saveState();
      },

      duplicateBlock: (blockId) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }

        const active = getActiveTab(state);
        if (!active) {
          return;
        }

        const idsToDuplicate =
          state.selectedBlockIds.size > 0 && state.selectedBlockIds.has(blockId)
            ? [...state.selectedBlockIds].sort(
                (a, b) =>
                  active.blocks.findIndex((bl) => bl.id === a) -
                  active.blocks.findIndex((bl) => bl.id === b),
              )
            : [blockId];

        const lastId = idsToDuplicate[idsToDuplicate.length - 1];
        const lastIndex = active.blocks.findIndex((b) => b.id === lastId);

        const duplicated = idsToDuplicate
          .map((id) => {
            const source = active.blocks.find((b) => b.id === id);
            return source ? { ...source, id: generateId() } : null;
          })
          .filter((b): b is Block => b !== null);

        set((s) => ({
          ...withActiveTab(s, (tab) => {
            const blocks = [...tab.blocks];
            blocks.splice(lastIndex + 1, 0, ...duplicated);
            return { ...tab, blocks };
          }),
          flashBlockIds: new Set(duplicated.map((b) => b.id)),
          pendingFocusBlockId: duplicated[duplicated.length - 1]?.id ?? null,
        }));
        get().saveState();
      },

      copyBlocksToTab: (sourceTabId, targetTabId, blockIds, beforeBlockId) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }

        const source = state.tabs.find((t) => t.id === sourceTabId);
        const target = state.tabs.find((t) => t.id === targetTabId);
        if (!source || !target || source.id === target.id) {
          return;
        }

        // Copy in source document order, regardless of selection order
        const ordered = source.blocks.filter((b) => blockIds.includes(b.id));
        if (ordered.length === 0) {
          return;
        }

        // Carry over referenced variables
        const { variables: carriedVariables, renames } = carryVariables(
          ordered,
          source.variables,
          target.variables,
        );

        const copies = ordered.map((b) =>
          b.type === BlockType.COMMAND
            ? {
                ...b,
                id: generateId(),
                text: renameAllVariableTokens(b.text, renames),
              }
            : { ...b, id: generateId() },
        );

        set((s) => {
          const tabs = s.tabs.map((t) => {
            if (t.id !== targetTabId) {
              return t;
            }

            // Insert before the given block, or append at the end
            const blocks = [...t.blocks];
            const beforeIndex = beforeBlockId
              ? blocks.findIndex((b) => b.id === beforeBlockId)
              : -1;

            blocks.splice(
              beforeIndex >= 0 ? beforeIndex : blocks.length,
              0,
              ...copies,
            );

            return {
              ...t,
              blocks,
              variables: [...t.variables, ...carriedVariables],
            };
          });

          const next = { ...s, tabs };
          return {
            ...relabelTab(next, tabs.find((t) => t.id === targetTabId) ?? null),
            flashBlockIds: new Set(copies.map((b) => b.id)),
          };
        });

        // The target may not be the active tab, so persist its content explicitly
        const updated = get().tabs.find((t) => t.id === targetTabId);
        if (updated?.runbookId) {
          contentDb
            .put(updated.runbookId, {
              variables: updated.variables,
              blocks: updated.blocks,
            })
            .catch((error) =>
              console.warn("Failed to persist runbook content:", error),
            );
        }

        get().saveState();
      },

      updateBlockText: (blockId, text) => {
        if (get().mode === AppMode.READ) {
          return;
        }

        set((s) => {
          const updated = withActiveTab(s, (tab) => ({
            ...tab,
            blocks: tab.blocks.map((b) =>
              b.id === blockId ? { ...b, text } : b,
            ),
          }));
          return { ...updated, ...relabelActive({ ...s, ...updated }) };
        });

        debouncedSaveState();
      },

      updateBlockStyle: (blockId, style) => {
        if (get().mode === AppMode.READ) {
          return;
        }
        set((s) =>
          withActiveTab(s, (tab) => ({
            ...tab,
            blocks: tab.blocks.map((b) =>
              b.id === blockId && b.type === BlockType.NOTE
                ? { ...b, style }
                : b,
            ),
          })),
        );

        get().saveState();
      },

      toggleCommandEditor: (blockId) => {
        if (get().mode === AppMode.READ) {
          return;
        }
        set((s) =>
          withActiveTab(s, (tab) => ({
            ...tab,
            blocks: tab.blocks.map((b) =>
              b.id === blockId && b.type === BlockType.COMMAND
                ? { ...b, editorCollapsed: !b.editorCollapsed }
                : b,
            ),
          })),
        );
        get().saveState();
      },

      toggleAllCommandEditors: () => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }
        const active = getActiveTab(state);
        if (!active) {
          return;
        }

        const allCollapsed = active.blocks
          .filter((b) => b.type === BlockType.COMMAND)
          .every(
            (b) =>
              (b as { editorCollapsed?: boolean }).editorCollapsed === true,
          );
        const newState = !allCollapsed;

        set((s) =>
          withActiveTab(s, (tab) => ({
            ...tab,
            blocks: tab.blocks.map((b) =>
              b.type === BlockType.COMMAND
                ? { ...b, editorCollapsed: newState }
                : b,
            ),
          })),
        );
        get().saveState();
      },

      reorderBlocks: (sourceId, targetId) => {
        const state = get();
        if (state.mode === AppMode.READ || sourceId === targetId) {
          return;
        }
        const active = getActiveTab(state);
        if (!active) {
          return;
        }

        const movingIds =
          state.selectedBlockIds.size > 0 &&
          state.selectedBlockIds.has(sourceId)
            ? [...state.selectedBlockIds]
            : [sourceId];

        const targetIndex = active.blocks.findIndex((b) => b.id === targetId);
        const sourceIndex = active.blocks.findIndex((b) => b.id === sourceId);
        if (sourceIndex < 0 || targetIndex < 0) {
          return;
        }

        const movingBlocks = movingIds
          .map((id) => active.blocks.find((b) => b.id === id))
          .filter((b): b is Block => b !== undefined)
          .sort((a, b) => active.blocks.indexOf(a) - active.blocks.indexOf(b));

        set((s) =>
          withActiveTab(s, (tab) => {
            const remaining = tab.blocks.filter(
              (b) => !movingIds.includes(b.id),
            );
            const newTargetIndex = remaining.findIndex(
              (b) => b.id === targetId,
            );
            const insertIndex =
              sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
            remaining.splice(insertIndex, 0, ...movingBlocks);
            return { ...tab, blocks: remaining };
          }),
        );
        get().saveState();
      },

      clearFlash: (blockId) =>
        set((s) => {
          if (!s.flashBlockIds.has(blockId)) {
            return {};
          }
          const flashBlockIds = new Set(s.flashBlockIds);
          flashBlockIds.delete(blockId);
          return { flashBlockIds };
        }),

      consumeBlockFocus: () => set({ pendingFocusBlockId: null }),

      // --- Selection ---

      setBlockSelected: (blockId, selected) =>
        set((s) => {
          const selectedBlockIds = new Set(s.selectedBlockIds);
          if (selected) {
            selectedBlockIds.add(blockId);
          } else {
            selectedBlockIds.delete(blockId);
          }
          return { selectedBlockIds };
        }),

      toggleBlockSelection: (blockId) =>
        get().setBlockSelected(blockId, !get().selectedBlockIds.has(blockId)),

      clearBlockSelection: () => {
        if (get().selectedBlockIds.size === 0) {
          return;
        }
        set({ selectedBlockIds: new Set() });
      },

      // --- Mode / theme / sidebar ---

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

      toggleTheme: () => {
        set((s) => ({
          theme: s.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
        }));
        persist.saveUiState(uiStateSnapshot(get()));
      },

      setLanguage: (language) => {
        if (get().language === language) {
          return;
        }
        set({ language });
        persist.saveUiState(uiStateSnapshot(get()));
      },

      toggleSidebar: () => {
        set((s) => ({
          sidebarCollapsed: !s.sidebarCollapsed,
          sidebarWidth: s.sidebarCollapsed
            ? SidebarWidth.DEFAULT
            : s.sidebarWidth,
        }));
        get().saveState();
      },

      toggleMinimap: () => {
        set((s) => ({ minimapEnabled: !s.minimapEnabled }));
        get().saveState();
      },

      toggleMinimapPosition: () => {
        set((s) => ({
          minimapPosition:
            s.minimapPosition === SidebarPosition.RIGHT
              ? SidebarPosition.LEFT
              : SidebarPosition.RIGHT,
        }));
        get().saveState();
      },

      toggleSidebarPosition: () => {
        set((s) => ({
          sidebarPosition:
            s.sidebarPosition === SidebarPosition.RIGHT
              ? SidebarPosition.LEFT
              : SidebarPosition.RIGHT,
        }));
        get().saveState();
      },

      setSidebarSize: (width: number) => {
        const shouldCollapse = width < SidebarWidth.COLLAPSE_SNAP;
        const max = Math.floor(
          window.innerWidth * SidebarWidth.MAX_SCREEN_FRACTION,
        );

        set({
          sidebarCollapsed: shouldCollapse,
          sidebarWidth: shouldCollapse
            ? SidebarWidth.DEFAULT
            : Math.min(max, Math.round(width)),
        });
        debouncedSaveState();
      },

      resetSidebarSize: () => {
        set({ sidebarWidth: SidebarWidth.DEFAULT });
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

      // --- Search ---

      setRunbookSearchQuery: (query) => set({ runbookSearchQuery: query }),
      setVariableSearchQuery: (query) => set({ variableSearchQuery: query }),

      // --- Interaction ---

      setSelectKeyHeld: (held) => set({ selectKeyHeld: held }),
      setLinkKeyHeld: (held) => set({ linkKeyHeld: held }),
      setScrollTop: (scrollTop) => {
        set((s) => withActiveTab(s, (tab) => ({ ...tab, scrollTop })));
        persist.saveTabsMeta(get().tabs, get().activeTabId);
      },

      clearUserInteraction: () =>
        set({
          selectKeyHeld: false,
          linkKeyHeld: false,
          selectedBlockIds: new Set(),
          focusedRunbookId: null,
        }),

      // --- Modals / export ---

      openExportModal: () =>
        set({
          exportModalOpen: true,
          cloudExportStatus: CloudExportStatus.IDLE,
        }),
      closeExportModal: () => set({ exportModalOpen: false }),
      resetCloudExportStatus: () =>
        set({ cloudExportStatus: CloudExportStatus.IDLE }),
      openPasteRunbookModal: () => set({ pasteRunbookModalOpen: true }),
      closePasteRunbookModal: () => set({ pasteRunbookModalOpen: false }),

      exportRunbook: async (destination, format, filename) => {
        set({
          lastExportDestination: destination,
          lastExportFormat: format,
        });

        persist.saveUiState(uiStateSnapshot(get()));

        const active = getActiveTab(get());
        const content = {
          variables: active?.variables ?? [],
          blocks: active?.blocks ?? [],
        };

        const fullName = `${filename}.${format}`;

        // Local export
        if (destination === SyncDestination.LOCAL) {
          set({ exportModalOpen: false });
          await runExport(format, content, fullName);
          return;
        }

        // Cloud export
        set({
          cloudExportStatus: CloudExportStatus.UPLOADING,
          cloudExportProvider: destination,
        });

        const client = getCloudClient(destination);
        try {
          await client.init();
          if (!client.isSignedIn()) {
            await client.signIn();
          }

          await client.writeFile(
            fullName,
            buildRunbookExportContent(format, content),
            FilePickerConfig[format].mimeType,
          );

          set({ cloudExportStatus: CloudExportStatus.SUCCESS });
        } catch (error) {
          console.error("Cloud export failed", error);
          set({ cloudExportStatus: CloudExportStatus.ERROR });
        }
      },

      // --- Cloud sync ---

      beginImport: () => {
        if (get().mode === AppMode.READ) {
          return;
        }

        const source = get().lastImportSource;
        if (source === SyncDestination.LOCAL) {
          get().openDestinationModal();
          return;
        }

        void get().startCloudImportBrowse(source);
      },

      openDestinationModal: () => {
        if (get().mode === AppMode.READ) {
          return;
        }

        set({ destinationModalOpen: true });
      },
      closeDestinationModal: () => set({ destinationModalOpen: false }),

      chooseDestination: (destination) => {
        set({ destinationModalOpen: false });

        if (destination === SyncDestination.LOCAL) {
          openImportDialog();
          return;
        }

        void get().startCloudImportBrowse(destination);
      },

      startCloudImportBrowse: async (provider) => {
        set({
          cloudProvider: provider,
          cloudImportModalOpen: true,
          cloudError: null,
          cloudFiles: [],
          cloudSignedIn: false,
          cloudAccountLabel: null,
          cloudLoading: true,
        });

        const client = getCloudClient(provider);
        try {
          await client.init();
        } finally {
          if (get().cloudProvider === provider) {
            set({
              cloudLoading: false,
              cloudSignedIn: client.isSignedIn(),
              cloudAccountLabel: client.getAccountLabel(),
            });
          }
        }

        if (
          client.isSignedIn() &&
          get().cloudProvider === provider &&
          get().cloudImportModalOpen
        ) {
          await get().refreshCloudFiles();
        }
      },

      returnToDestinationModal: () =>
        set({ cloudImportModalOpen: false, destinationModalOpen: true }),

      closeCloudImportModal: () => set({ cloudImportModalOpen: false }),

      signInToCloud: async () => {
        const client = getCloudClient(get().cloudProvider);
        set({ cloudLoading: true, cloudError: null });
        try {
          await client.signIn();
          set({
            cloudSignedIn: client.isSignedIn(),
            cloudAccountLabel: client.getAccountLabel(),
          });
          if (get().cloudImportModalOpen) {
            await get().refreshCloudFiles();
          }
        } catch (error) {
          console.error("Cloud sign-in failed", error);
          set({
            cloudError: getMessages(get().language).cloudModal.signInError,
          });
        } finally {
          set({ cloudLoading: false });
        }
      },

      signOutOfCloud: async () => {
        const client = getCloudClient(get().cloudProvider);
        try {
          await client.signOut();
        } catch (error) {
          console.error("Cloud sign-out failed", error);
        }
        set({
          cloudFiles: [],
          cloudError: null,
          cloudSignedIn: false,
          cloudAccountLabel: null,
        });
      },

      refreshCloudFiles: async () => {
        const client = getCloudClient(get().cloudProvider);
        set({ cloudLoading: true, cloudError: null });
        try {
          const files = await client.listFiles();
          set({ cloudFiles: files });
        } catch (error) {
          console.error("Failed to list cloud files", error);
          set({
            cloudError: getMessages(get().language).cloudModal.genericError,
          });
        } finally {
          set({ cloudLoading: false });
        }
      },

      importRunbookFromCloud: async (file) => {
        const client = getCloudClient(get().cloudProvider);
        const t = getMessages(get().language);

        set({ cloudLoading: true, cloudError: null });
        let text: string;
        try {
          text = await client.readFile(file);
        } catch (error) {
          console.error("Cloud file read failed", error);
          set({ cloudLoading: false, cloudError: t.cloudModal.genericError });
          return;
        }

        let content: RunbookContent;
        try {
          content = parseRunbookContent(text);
        } catch {
          set({
            cloudLoading: false,
            cloudError: t.cloudModal.invalidFileError,
          });
          return;
        }

        set({ cloudLoading: false });
        const baseName = file.name.replace(
          new RegExp(`\\.${ExportFormat.JSON}$`, "i"),
          "",
        );

        await get().addRunbookToLibrary(content, baseName, file.name);
        set({
          cloudImportModalOpen: false,
          lastImportSource: get().cloudProvider,
        });

        persist.saveUiState(uiStateSnapshot(get()));
      },

      copyRunbookMarkdown: async () => {
        const active = getActiveTab(get());
        const text = buildMarkdownExport({
          variables: active?.variables ?? [],
          blocks: active?.blocks ?? [],
        });

        await navigator.clipboard.writeText(text);
      },

      // --- Dialogs ---

      confirm: (message, options) => {
        // Demo stores have no modals mounted; treat every confirm as accepted
        if (isDemo) {
          return Promise.resolve(true);
        }

        return new Promise<boolean>((resolve) => {
          const defaultLabel = getMessages(get().language).confirm.defaultTitle;
          set({
            confirmDialog: {
              message,
              resolve,
              title: options?.title ?? defaultLabel,
              confirmLabel: options?.confirmLabel ?? defaultLabel,
              danger: options?.danger ?? false,
            },
          });
        });
      },
      resolveConfirm: (result) => {
        get().confirmDialog?.resolve(result);
        set({ confirmDialog: null });
      },
      alert: (message) => {
        if (isDemo) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) =>
          set({ alertDialog: { message, resolve } }),
        );
      },
      resolveAlert: () => {
        get().alertDialog?.resolve();
        set({ alertDialog: null });
      },

      clearRunbookLibrary: async () => {
        if (get().mode === AppMode.READ) {
          return;
        }

        set({ selectKeyHeld: false });
        const t = getMessages(get().language);
        const confirmed = await get().confirm(t.dialogs.clearLibraryMessage, {
          title: t.dialogs.clearLibraryTitle,
          confirmLabel: t.dialogs.clearLibraryConfirm,
          danger: true,
        });

        if (!confirmed) {
          return;
        }

        // Drops runbook content only
        if (!isDemo) {
          await deleteRunbookDb();
          persistence.clearStoredRunbooks();
        }

        set({
          tabs: [],
          activeTabId: null,
          activeRunbookId: null,
          runbookLibrary: [],
          runbookSearchQuery: "",
          variableSearchQuery: "",
          selectedBlockIds: new Set(),
          focusedRunbookId: null,
        });
      },

      clearAllData: async () => {
        set({ selectKeyHeld: false });
        const t = getMessages(get().language);
        const confirmed = await get().confirm(t.dialogs.resetMessage, {
          title: t.dialogs.resetTitle,
          confirmLabel: t.dialogs.resetConfirm,
          danger: true,
        });
        if (!confirmed) {
          return;
        }

        // Never let a demo store wipe the user's real data
        if (!isDemo) {
          await deleteRunbookDb();
          localStorage.clear();
        }

        set({
          tabs: [],
          activeTabId: null,
          activeRunbookId: null,
          runbookLibrary: [],
          runbookSearchQuery: "",
          variableSearchQuery: "",
          selectedBlockIds: new Set(),
          focusedRunbookId: null,
        });
      },
    };
  });
}

export const appStore = createAppStore();

const StoreContext = createContext<AppStoreApi>(appStore);

export const StoreProvider = StoreContext.Provider;

export function useStoreApi(): AppStoreApi {
  return useContext(StoreContext);
}

export function useStore<T>(selector: (state: StoreState) => T): T {
  return useZustandStore(useContext(StoreContext), selector);
}
