import {
  createBlock,
  getBlockLabelText,
  mapBlockCommandTexts,
  normalizeBlock,
} from "@/blocks";
import {
  CloudSyncConfig,
  createDefaultPanels,
  DEBOUNCE_CLOUD_SYNC_MS,
  DEBOUNCE_SAVE_MS,
  DEFAULT_TAB_LABEL,
  FilePickerConfig,
  MimeType,
  PANEL_DEFINITIONS,
  RunbookConfig,
  VariableSplit,
  ZIP_EXTENSION,
} from "@/common/config";
import {
  AppMode,
  BlockType,
  CloudExportStatus,
  CloudProvider,
  CloudSortColumn,
  CommandSurface,
  DialogTone,
  ExportFormat,
  HistoryDirection,
  InsertPosition,
  MoveDirection,
  PanelId,
  PanelSide,
  RunbookSyncStatus,
  SortDirection,
  SyncDestination,
  Theme,
  VariableField,
} from "@/common/enums";
import type {
  Block,
  BlockInsertAnchor,
  BlockOfType,
  PanelState,
  RunbookContent,
  RunbookEntry,
  RunbookSync,
  Tab,
  Variable,
} from "@/common/types";
import { detectLanguage, getMessages } from "@/i18n/messages";
import { Language } from "@/i18n/types";
import {
  buildCloudEntriesZip,
  buildCloudFolderZip,
  buildDuplicateName,
  clearCachedCloudEntries,
  copyCloudEntry,
  DEFAULT_CLOUD_SORT,
  getCachedCloudEntries,
  getCloudClient,
  setCachedCloudEntries,
  walkCloudTree,
  type CloudEntry,
  type CloudFolderRef,
  type CloudSort,
  type PlacedCloudEntry,
} from "@/services/cloud";
import { debounce } from "@/utils/debounce";
import { downloadBlob } from "@/utils/download";
import {
  buildMarkdownExport,
  buildRunbookExportContent,
  getExportBasename,
  runExport,
  stripJsonExtension,
  withJsonExtension,
} from "@/utils/export";
import { generateId } from "@/utils/id";
import { openImportDialog } from "@/utils/importTrigger";
import { clamp } from "@/utils/number";
import {
  carryVariables,
  getVariableKey,
  renameAllCommandTokens,
  renameCommandTokens,
  renameValueTokens,
  uniqueCopyKey,
} from "@/utils/resolution";
import { displayLabel, getRunbookLabel } from "@/utils/runbook";
import { buildDuplicateName as nextDuplicateName } from "@/utils/string";
import { createContext, useContext } from "react";
import {
  createStore,
  useStore as useZustandStore,
  type StoreApi,
} from "zustand";
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

interface AlertDialog extends Dialog<void> {
  title: string;
  tone: DialogTone;
}

interface AlertOptions {
  title?: string;
  tone?: DialogTone;
}

interface ConfirmDialog extends Dialog<boolean> {
  title: string;
  confirmLabel: string;
  tone: DialogTone;
}

interface ConfirmOptions extends AlertOptions {
  confirmLabel?: string;
}

export interface CloudFileEditor {
  file: CloudEntry;
  folderPath: CloudFolderRef[];
  folderId: string | null;
  original: string;
  text: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface StoreState {
  // Data
  tabs: Tab[];
  activeTabId: string | null;
  runbookLibrary: RunbookEntry[];
  activeRunbookId: string | null;
  runbookSyncStatus: Record<string, RunbookSyncStatus>;

  // UI
  mode: AppMode;
  theme: Theme;
  language: Language;
  spellcheckEnabled: boolean;
  panels: Record<PanelId, PanelState>;
  variableKeyRatio: number;
  minimapEnabled: boolean;
  minimapPosition: PanelSide;
  runbookSectionCollapsed: boolean;
  variablesSectionCollapsed: boolean;

  // Interaction / selection
  focusedRunbookId: string | null;
  selectedBlockIds: Set<string>;
  flashBlockIds: Set<string>;
  expandedCommandSurfaces: Record<CommandSurface, Set<string>>;
  selectKeyHeld: boolean;
  linkKeyHeld: boolean;
  pendingFocusBlockId: string | null;
  pendingFocusVariableId: string | null;
  imageViewerBlockId: string | null;

  // Search
  runbookSearchQuery: string;
  variableSearchQuery: string;

  // Modals / dialogs
  exportModalOpen: boolean;
  cloudExportStatus: CloudExportStatus;
  cloudExportProvider: CloudProvider | null;
  pasteRunbookModalOpen: boolean;
  confirmDialog: ConfirmDialog | null;
  alertDialog: AlertDialog | null;

  // Cloud sync
  destinationModalOpen: boolean;
  cloudImportModalOpen: boolean;
  cloudProvider: CloudProvider;
  cloudSignedIn: boolean;
  cloudAccountLabel: string | null;
  cloudEntries: CloudEntry[];
  cloudLoading: boolean;
  cloudError: string | null;
  cloudFileEditor: CloudFileEditor | null;
  cloudSelectedEntries: Map<string, PlacedCloudEntry>;

  // Cloud folder navigation
  cloudPath: CloudFolderRef[];
  cloudHistory: CloudFolderRef[][];
  cloudHistoryIndex: number;

  // Cloud search
  cloudSearchQuery: string;
  cloudSearchEntries: PlacedCloudEntry[];
  cloudSearchLoading: boolean;

  // Cloud list sorting
  cloudSort: CloudSort;

  // Remembered cloud-sync choices
  lastExportDestination: SyncDestination;
  lastExportFormat: ExportFormat;
  lastExportFilename: string;
  lastExportFilenameTabId: string | null;
  lastExportFolderPath: CloudFolderRef[];
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
  duplicateRunbook: (id: string) => Promise<void>;
  addRunbookToLibrary: (
    content: RunbookContent,
    filename: string,
    rawFilename: string,
    sync?: RunbookSync,
    openInTab?: boolean,
  ) => Promise<boolean>;
  syncRunbookNow: (id: string) => Promise<void>;
  unlinkRunbookSync: (id: string) => void;
  importRunbooks: (files: File[]) => Promise<void>;
  importRunbookFromText: (text: string) => Promise<boolean>;
  reorderRunbooks: (sourceId: string, targetId: string) => void;
  setRunbookFocus: (id: string | null) => void;
  navigateRunbookList: (direction: MoveDirection) => void;

  addVariable: () => Promise<void>;
  removeVariable: (variableId: string) => void;
  duplicateVariable: (variableId: string) => void;
  updateVariable: (
    variableId: string,
    field: VariableField,
    value: string,
  ) => void;
  toggleVariableSecret: (variableId: string) => void;
  reorderVariables: (sourceId: string, targetId: string) => void;
  consumeVariableFocus: () => void;

  addBlock: (blockType: BlockType, anchor?: BlockInsertAnchor) => Promise<void>;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  updateBlock: <T extends BlockType>(
    blockId: string,
    type: T,
    patch: Partial<Omit<BlockOfType<T>, "id" | "type">>,
  ) => void;
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
  toggleCommandSurfaceExpanded: (
    blockId: string,
    surface: CommandSurface,
  ) => void;
  openImageViewer: (blockId: string) => void;
  closeImageViewer: () => void;

  setBlockSelected: (blockId: string, selected: boolean) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;

  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
  toggleTheme: () => void;
  toggleSpellcheck: () => void;
  setLanguage: (language: Language) => void;
  toggleMinimap: () => void;
  toggleMinimapPosition: () => void;
  togglePanel: (panelId: PanelId) => void;
  togglePanelSide: (panelId: PanelId) => void;
  setPanelWidth: (panelId: PanelId, width: number) => void;
  resetPanelWidth: (panelId: PanelId) => void;
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
  setExportDestination: (destination: SyncDestination) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportFilename: (filename: string) => void;
  setExportFolderPath: (path: CloudFolderRef[]) => void;
  openPasteRunbookModal: () => void;
  closePasteRunbookModal: () => void;
  exportRunbook: (
    destination: SyncDestination,
    format: ExportFormat,
    filename: string,
    folderId: string | null,
  ) => Promise<void>;
  copyRunbookMarkdown: () => Promise<void>;

  beginImport: () => void;
  openDestinationModal: () => void;
  closeDestinationModal: () => void;
  chooseDestination: (destination: SyncDestination) => void;
  startCloudBrowse: (
    provider: CloudProvider,
    path?: CloudFolderRef[],
  ) => Promise<void>;
  startCloudImportBrowse: (provider: CloudProvider) => Promise<void>;
  returnToDestinationModal: () => void;
  closeCloudImportModal: () => void;
  signInToCloud: () => Promise<void>;
  signOutOfCloud: () => Promise<void>;
  refreshCloudEntries: () => Promise<void>;
  openCloudFolder: (folder: CloudEntry) => void;
  navigateCloudHistory: (direction: HistoryDirection) => void;
  navigateCloudToDepth: (depth: number) => void;
  navigateCloudToPath: (path: CloudFolderRef[]) => void;
  setCloudSearchQuery: (query: string) => void;
  toggleCloudSort: (column: CloudSortColumn) => void;
  refreshCloudSearchEntries: () => Promise<void>;
  createCloudFolder: (name: string) => Promise<void>;
  setCloudSelection: (entries: CloudEntry[]) => void;
  toggleCloudSelected: (entry: CloudEntry) => void;
  clearCloudSelection: () => void;
  importRunbooksFromCloud: (files: CloudEntry[]) => Promise<void>;
  renameCloudEntry: (entry: CloudEntry, basename: string) => Promise<void>;
  openCloudFileEditor: (file: CloudEntry) => Promise<void>;
  setCloudFileEditorText: (text: string) => void;
  saveCloudFileEditor: () => Promise<void>;
  closeCloudFileEditor: () => Promise<void>;
  duplicateCloudEntries: (entries: CloudEntry[]) => Promise<void>;
  downloadCloudEntries: (entries: CloudEntry[]) => Promise<void>;
  deleteCloudEntries: (entries: CloudEntry[]) => Promise<void>;

  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  resolveAlert: () => void;
  clearRunbookLibrary: () => Promise<void>;
  clearAllData: () => Promise<boolean>;
}

const ROOT_CLOUD_PATH: CloudFolderRef[] = [];

function currentFolderId(path: CloudFolderRef[]): string | null {
  return path.at(-1)?.id ?? null;
}

/** The search result an entry came from, or null when browsing a folder. */
function cloudSearchMatch(
  state: StoreState,
  entry: CloudEntry,
): PlacedCloudEntry | null {
  return (
    state.cloudSearchEntries.find((result) => result.entry.id === entry.id) ??
    null
  );
}

/** The path to the folder holding `entry`. */
function parentFolderPath(
  state: StoreState,
  entry: CloudEntry,
): CloudFolderRef[] {
  return (
    state.cloudSelectedEntries.get(entry.id)?.path ??
    cloudSearchMatch(state, entry)?.path ??
    state.cloudPath
  );
}

/** The folder holding `entry`, whether it was listed or found by search. */
function parentFolderId(state: StoreState, entry: CloudEntry): string | null {
  return currentFolderId(parentFolderPath(state, entry));
}

/** The listing of the folder holding `entry`. */
function siblingEntries(state: StoreState, entry: CloudEntry): CloudEntry[] {
  const folderId = currentFolderId(parentFolderPath(state, entry));
  if (folderId === currentFolderId(state.cloudPath)) {
    return state.cloudEntries;
  }

  const walked = state.cloudSearchEntries.filter(
    (result) => currentFolderId(result.path) === folderId,
  );

  // A folder a search walked, else whatever browsing it last cached
  return walked.length > 0
    ? walked.map((result) => result.entry)
    : (getCachedCloudEntries(state.cloudProvider, folderId) ?? []);
}

/** Resolve the active tab, mirroring the original `activeTab()` fallback. */
export function getActiveTab(state: StoreState): Tab | null {
  return (
    state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0] ?? null
  );
}

/** Replace one panel's state. */
function withPanel(
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

function uiStateSnapshot(state: StoreState) {
  return {
    mode: state.mode,
    theme: state.theme,
    language: state.language,
    spellcheckEnabled: state.spellcheckEnabled,
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
    blocks: (parsed.blocks as unknown[])
      .map(normalizeBlock)
      .filter((block): block is Block => block !== null),
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

    // --- Cloud sync ---

    /** Runbook id -> the JSON waiting to go up */
    const queuedSyncContent = new Map<string, string>();
    /** Runbook id -> the JSON last written to the cloud, to skip no-op pushes */
    const pushedSyncContent = new Map<string, string>();

    const setSyncStatus = (runbookId: string, status: RunbookSyncStatus) =>
      set((s) => ({
        runbookSyncStatus: { ...s.runbookSyncStatus, [runbookId]: status },
      }));

    const forgetSyncState = (runbookId: string) => {
      queuedSyncContent.delete(runbookId);
      pushedSyncContent.delete(runbookId);
      set((s) => {
        if (!(runbookId in s.runbookSyncStatus)) {
          return {};
        }
        const runbookSyncStatus = { ...s.runbookSyncStatus };
        delete runbookSyncStatus[runbookId];
        return { runbookSyncStatus };
      });
    };

    const getSyncLink = (runbookId: string): RunbookSync | undefined =>
      get().runbookLibrary.find((item) => item.id === runbookId)?.sync;

    const runbookJson = (content: RunbookContent) =>
      buildRunbookExportContent(ExportFormat.JSON, content);

    /** Records content the cloud already holds, so nothing is pushed back. */
    const markRunbookSynced = (runbookId: string, content: RunbookContent) => {
      queuedSyncContent.delete(runbookId);
      pushedSyncContent.set(runbookId, runbookJson(content));
      setSyncStatus(runbookId, RunbookSyncStatus.SYNCED);
    };

    /**
     * Writes everything queued, one file at a time. Two passes never overlap,
     * so concurrent writes can't land on the same file out of order; whatever
     * gets queued mid-pass is picked up before the pass ends. Never signs in on
     * its own — see `syncRunbookNow`.
     */
    let syncPassRunning = false;
    const flushQueuedSyncs = async () => {
      if (syncPassRunning) {
        return;
      }
      syncPassRunning = true;

      try {
        while (queuedSyncContent.size > 0) {
          const [runbookId, json] = [...queuedSyncContent][0];
          queuedSyncContent.delete(runbookId);

          const link = getSyncLink(runbookId);
          if (!link) {
            continue;
          }

          const client = getCloudClient(link.provider);
          try {
            await client.init();
            if (!client.isSignedIn()) {
              setSyncStatus(runbookId, RunbookSyncStatus.SIGNED_OUT);
              continue;
            }

            await client.writeFile(
              link.filename,
              json,
              MimeType.JSON,
              link.folderId,
            );
          } catch (error) {
            console.error("Cloud sync failed", error);
            setSyncStatus(runbookId, RunbookSyncStatus.ERROR);
            continue;
          }

          pushedSyncContent.set(runbookId, json);
          // The file's size and modified date just changed under any cached listing
          clearCachedCloudEntries(link.provider);
          setSyncStatus(runbookId, RunbookSyncStatus.SYNCED);
        }
      } finally {
        syncPassRunning = false;
      }
    };

    const debouncedFlushSyncs = debounce(
      () => void flushQueuedSyncs(),
      DEBOUNCE_CLOUD_SYNC_MS,
    );

    /**
     * Schedules a push for a linked runbook whose content actually moved.
     * Called from every path that persists content, so linked runbooks stay
     * current without an explicit export.
     */
    const queueCloudSync = (runbookId: string, content: RunbookContent) => {
      if (isDemo || !getSyncLink(runbookId)) {
        return;
      }

      const json = runbookJson(content);
      if (pushedSyncContent.get(runbookId) === json) {
        return;
      }

      queuedSyncContent.set(runbookId, json);
      setSyncStatus(runbookId, RunbookSyncStatus.SYNCING);
      debouncedFlushSyncs();
    };

    /** Points a runbook at a cloud file it was just written to or read from. */
    const linkRunbookToCloud = (
      runbookId: string,
      sync: RunbookSync,
      content: RunbookContent,
    ) => {
      set((s) => ({
        runbookLibrary: s.runbookLibrary.map((item) =>
          item.id === runbookId ? { ...item, sync } : item,
        ),
      }));

      markRunbookSynced(runbookId, content);
      persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
    };

    /** The runbook's content as the tab holds it, else as the DB holds it. */
    const readRunbookContent = async (runbookId: string) => {
      const openTab = get().tabs.find((t) => t.runbookId === runbookId);
      return openTab
        ? { variables: openTab.variables, blocks: openTab.blocks }
        : await contentDb.get(runbookId);
    };

    let cloudRequestId = 0;
    const startCloudRequest = () => ++cloudRequestId;
    const isCurrentCloudRequest = (id: number) => cloudRequestId === id;

    // Where the browser was left off per provider
    const lastBrowsedCloudPath = new Map<CloudProvider, CloudFolderRef[]>();

    let cloudSearchRequestId = 0;
    const startCloudSearchRequest = () => ++cloudSearchRequestId;
    const isCurrentCloudSearchRequest = (id: number) =>
      cloudSearchRequestId === id;

    const emptyCloudSelection = () => {
      const current = get().cloudSelectedEntries;
      return current.size === 0 ? current : new Map<string, PlacedCloudEntry>();
    };

    /** Drops the search and its results. */
    const clearedCloudSearch = () => {
      startCloudSearchRequest();
      return {
        cloudSearchQuery: "",
        cloudSearchEntries: [],
        cloudSearchLoading: false,
      };
    };

    const clearedCloudListing = () => ({
      ...clearedCloudSearch(),
      cloudSelectedEntries: emptyCloudSelection(),
    });

    /** Lists the open folder from the provider and caches what came back. */
    const fetchCloudEntries = async () => {
      const provider = get().cloudProvider;
      const folderId = currentFolderId(get().cloudPath);
      const requestId = startCloudRequest();

      set({ cloudLoading: true, cloudError: null });

      try {
        const entries = await getCloudClient(provider).listEntries(folderId);
        setCachedCloudEntries(provider, folderId, entries);

        if (isCurrentCloudRequest(requestId)) {
          set({ cloudEntries: entries });
        }
      } catch (error) {
        console.error("Failed to list cloud entries", error);
        if (isCurrentCloudRequest(requestId)) {
          set({
            cloudEntries: [],
            cloudError: getMessages(get().language).cloudModal.genericError,
          });
        }
      } finally {
        if (isCurrentCloudRequest(requestId)) {
          set({ cloudLoading: false });
        }
      }
    };

    const loadCloudEntries = async () => {
      const cached = getCachedCloudEntries(
        get().cloudProvider,
        currentFolderId(get().cloudPath),
      );

      if (cached) {
        startCloudRequest();
        set({ cloudEntries: cached, cloudLoading: false, cloudError: null });
      } else {
        await fetchCloudEntries();
      }

      if (get().cloudSearchQuery.trim()) {
        await get().refreshCloudSearchEntries();
      }
    };

    return {
      tabs: [],
      activeTabId: null,
      runbookLibrary: [],
      activeRunbookId: null,
      runbookSyncStatus: {},

      mode: AppMode.EDIT,
      theme: Theme.DARK,
      language: detectLanguage(),
      spellcheckEnabled: true,
      panels: createDefaultPanels(),
      variableKeyRatio: VariableSplit.DEFAULT,
      minimapEnabled: true,
      minimapPosition: PanelSide.RIGHT,
      runbookSectionCollapsed: false,
      variablesSectionCollapsed: false,

      focusedRunbookId: null,
      selectedBlockIds: new Set(),
      flashBlockIds: new Set(),
      expandedCommandSurfaces: {
        [CommandSurface.PREVIEW]: new Set(),
        [CommandSurface.EDITOR]: new Set(),
      },
      selectKeyHeld: false,
      linkKeyHeld: false,
      pendingFocusBlockId: null,
      pendingFocusVariableId: null,
      imageViewerBlockId: null,

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
      cloudEntries: [],
      cloudLoading: false,
      cloudError: null,
      cloudFileEditor: null,
      cloudSelectedEntries: new Map(),

      cloudPath: ROOT_CLOUD_PATH,
      cloudHistory: [ROOT_CLOUD_PATH],
      cloudHistoryIndex: 0,

      cloudSearchQuery: "",
      cloudSearchEntries: [],
      cloudSearchLoading: false,

      cloudSort: DEFAULT_CLOUD_SORT,

      lastExportDestination: SyncDestination.LOCAL,
      lastExportFormat: ExportFormat.JSON,
      lastExportFilename: "",
      lastExportFilenameTabId: null,
      lastExportFolderPath: ROOT_CLOUD_PATH,
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
          const content = {
            variables: active.variables,
            blocks: active.blocks,
          };

          contentDb
            .put(active.runbookId, content)
            .catch((error) =>
              console.warn("Failed to persist runbook content:", error),
            );
          queueCloudSync(active.runbookId, content);
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

        // An edit made just before the last close may never have reached the
        // cloud, so every linked tab gets one catch-up push on load
        for (const tab of get().tabs) {
          if (tab.runbookId) {
            queueCloudSync(tab.runbookId, {
              variables: tab.variables,
              blocks: tab.blocks,
            });
          }
        }
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

        const openTab = state.tabs.find((t) => t.runbookId === id);
        const content = openTab ?? (await contentDb.get(id));
        const isEmpty =
          (content?.blocks.length ?? 0) === 0 &&
          (content?.variables.length ?? 0) === 0;

        const runbook = state.runbookLibrary.find((item) => item.id === id);

        // A synced runbook still exists in the cloud, so removing it loses nothing
        if (!isEmpty && !runbook?.sync) {
          const t = getMessages(get().language);
          const confirmed = await get().confirm(
            t.dialogs.deleteRunbookMessage(
              displayLabel(runbook?.label ?? "", t),
            ),
            {
              title: t.dialogs.deleteRunbookTitle,
              confirmLabel: t.dialogs.deleteRunbookConfirm,
              tone: DialogTone.DANGER,
            },
          );

          if (!confirmed) {
            return;
          }
        }

        // Removing the entry leans on the cloud copy being current, so let any
        // edit still waiting on the debounce land before the local copy goes
        if (queuedSyncContent.has(id)) {
          await flushQueuedSyncs();
        }

        await contentDb.delete(id);
        forgetSyncState(id);

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

      duplicateRunbook: async (id) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }

        const sourceIndex = state.runbookLibrary.findIndex(
          (item) => item.id === id,
        );

        if (sourceIndex < 0) {
          return;
        }

        const source = state.runbookLibrary[sourceIndex];
        const openTab = state.tabs.find((t) => t.runbookId === id);
        const content = openTab
          ? { variables: openTab.variables, blocks: openTab.blocks }
          : await contentDb.get(id);

        if (!content) {
          return;
        }

        const copy: RunbookContent = {
          variables: content.variables.map((variable) => ({
            ...variable,
            id: generateId(),
          })),
          blocks: content.blocks.map((block) => ({
            ...block,
            id: generateId(),
          })),
        };

        const library = get().runbookLibrary;
        const takenLabels = new Set(library.map((item) => item.label));
        const takenFilenames = new Set(library.map((item) => item.filename));

        // Base the copy's name on what the row actually shows
        const label = nextDuplicateName(
          displayLabel(source.label, getMessages(get().language)),
          (candidate) => takenLabels.has(candidate),
        );
        const filename = source.filename
          ? nextDuplicateName(source.filename, (candidate) =>
              takenFilenames.has(candidate),
            )
          : "";

        const newId = generateId();
        await contentDb.put(newId, copy);

        set((s) => {
          const runbookLibrary = [...s.runbookLibrary];
          const insertAt =
            runbookLibrary.findIndex((item) => item.id === id) + 1;
          runbookLibrary.splice(insertAt, 0, { id: newId, label, filename });

          return { runbookLibrary };
        });

        persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
      },

      addRunbookToLibrary: async (
        content,
        filename,
        rawFilename,
        sync,
        openInTab = true,
      ) => {
        const label = getRunbookLabel(
          content.blocks,
          filename || RunbookConfig.DEFAULT_LABEL,
        );

        /**
         * Content that just came down from the cloud is already in sync;
         * anything else may have landed on top of an existing link.
         */
        const settleSync = (runbookId: string) => {
          if (sync) {
            markRunbookSynced(runbookId, content);
          } else {
            queueCloudSync(runbookId, content);
          }
        };

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
              tone: DialogTone.WARNING,
            },
          );

          if (!confirmed) {
            return false;
          }

          await contentDb.put(existing.id, content);
          set((s) => ({
            runbookLibrary: s.runbookLibrary.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    label,
                    filename: filename || "",
                    // An import keeps the entry's existing link unless it brings its own
                    ...(sync ? { sync } : {}),
                  }
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

          settleSync(existing.id);
          return true;
        }

        const newId = generateId();
        await contentDb.put(newId, content);
        set((s) => ({
          runbookLibrary: [
            ...s.runbookLibrary,
            {
              id: newId,
              label,
              filename: filename || "",
              ...(sync ? { sync } : {}),
            },
          ],
        }));
        settleSync(newId);

        if (!openInTab) {
          persist.saveRunbookLibrary(
            get().runbookLibrary,
            get().activeRunbookId,
          );
          return true;
        }

        await get().loadRunbookFromLibrary(newId);
        return true;
      },

      syncRunbookNow: async (id) => {
        const link = getSyncLink(id);
        if (!link) {
          return;
        }

        const content = await readRunbookContent(id);
        if (!content) {
          return;
        }

        const client = getCloudClient(link.provider);
        setSyncStatus(id, RunbookSyncStatus.SYNCING);

        // Retrying is a click, so a sign-in popup here is expected rather than ambushing
        try {
          await client.init();
          if (!client.isSignedIn()) {
            await client.signIn();
          }
        } catch (error) {
          console.error("Cloud sync sign-in failed", error);
          setSyncStatus(id, RunbookSyncStatus.SIGNED_OUT);
          return;
        }

        queuedSyncContent.set(id, runbookJson(content));
        await flushQueuedSyncs();
      },

      unlinkRunbookSync: (id) => {
        if (get().mode === AppMode.READ) {
          return;
        }

        set((s) => ({
          runbookLibrary: s.runbookLibrary.map((item) =>
            item.id === id ? { ...item, sync: undefined } : item,
          ),
        }));

        forgetSyncState(id);
        persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
      },

      importRunbooks: async (files) => {
        let failedCount = 0;
        const openInTab = files.length === 1;

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
                  undefined,
                  openInTab,
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

        if (failedCount > 0) {
          const t = getMessages(get().language);
          await get().alert(t.dialogs.importFailed(failedCount), {
            title: t.dialogs.importFailedTitle,
            tone: DialogTone.WARNING,
          });
        }
      },

      importRunbookFromText: async (text) => {
        let content: RunbookContent;
        try {
          content = parseRunbookContent(text);
        } catch {
          return false;
        }

        return await get().addRunbookToLibrary(
          content,
          generateId(),
          getMessages(get().language).dialogs.pastedRunbook,
        );
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

      duplicateVariable: (variableId) => {
        if (get().mode === AppMode.READ) {
          return;
        }

        const copyId = generateId();
        set((s) => ({
          ...withActiveTab(s, (tab) => {
            const index = tab.variables.findIndex((v) => v.id === variableId);
            if (index < 0) {
              return tab;
            }

            const source = tab.variables[index];
            const key = getVariableKey(source);
            const newKey = key
              ? uniqueCopyKey(
                  key,
                  new Set(tab.variables.map((v) => getVariableKey(v))),
                )
              : key;

            const variables = [...tab.variables];
            variables.splice(index + 1, 0, {
              ...source,
              id: copyId,
              key: newKey,
            });

            return { ...tab, variables };
          }),
          pendingFocusVariableId: copyId,
        }));

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
                blocks = tab.blocks.map((b) =>
                  mapBlockCommandTexts(b, (text) =>
                    renameCommandTokens(text, oldKey, newKey),
                  ),
                );

                variables = tab.variables.map((v) => {
                  if (v.id === variableId) {
                    return v;
                  }

                  const value = renameValueTokens(v.value, oldKey, newKey);
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

      addBlock: async (blockType, anchor) => {
        const state = get();
        if (state.mode === AppMode.READ) {
          return;
        }
        if (state.tabs.length === 0) {
          await get().createNewTab();
        }

        const newBlock = createBlock(blockType);

        set((s) => ({
          ...withActiveTab(s, (tab) => {
            const blocks = [...tab.blocks];
            const anchorIndex = anchor
              ? blocks.findIndex((b) => b.id === anchor.blockId)
              : -1;

            // An unknown anchor appends to the end
            if (anchorIndex < 0) {
              blocks.push(newBlock);
            } else {
              const offset = anchor?.position === InsertPosition.ABOVE ? 0 : 1;
              blocks.splice(anchorIndex + offset, 0, newBlock);
            }

            return { ...tab, blocks };
          }),
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

        const copies = ordered.map((b) => ({
          ...mapBlockCommandTexts(b, (text) =>
            renameAllCommandTokens(text, renames),
          ),
          id: generateId(),
        }));

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
          const content = {
            variables: updated.variables,
            blocks: updated.blocks,
          };

          contentDb
            .put(updated.runbookId, content)
            .catch((error) =>
              console.warn("Failed to persist runbook content:", error),
            );
          queueCloudSync(updated.runbookId, content);
        }

        get().saveState();
      },

      updateBlock: (blockId, type, patch) => {
        if (get().mode === AppMode.READ) {
          return;
        }

        set((s) => {
          const updated = withActiveTab(s, (tab) => ({
            ...tab,
            blocks: tab.blocks.map((b) =>
              b.id === blockId && b.type === type
                ? ({ ...b, ...patch } as Block)
                : b,
            ),
          }));

          // The label comes from the first block that can name a runbook
          const next = { ...s, ...updated };
          const first = getActiveTab(next)?.blocks[0];
          const namesRunbook =
            first?.id === blockId && getBlockLabelText(first) !== null;

          return namesRunbook
            ? { ...updated, ...relabelActive(next) }
            : updated;
        });

        debouncedSaveState();
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

      toggleCommandSurfaceExpanded: (blockId, surface) =>
        set((s) => {
          const ids = new Set(s.expandedCommandSurfaces[surface]);
          if (ids.has(blockId)) {
            ids.delete(blockId);
          } else {
            ids.add(blockId);
          }

          return {
            expandedCommandSurfaces: {
              ...s.expandedCommandSurfaces,
              [surface]: ids,
            },
          };
        }),

      openImageViewer: (blockId) => set({ imageViewerBlockId: blockId }),

      closeImageViewer: () => set({ imageViewerBlockId: null }),

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
        const max = Math.floor(
          window.innerWidth * definition.maxScreenFraction,
        );

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

      openExportModal: () => {
        const state = get();
        const activeTab = getActiveTab(state);
        const activeTabId = activeTab?.id ?? null;

        set({
          exportModalOpen: true,
          cloudExportStatus: CloudExportStatus.IDLE,
          ...(state.lastExportFilenameTabId !== activeTabId
            ? {
                lastExportFilename: getExportBasename(activeTab?.label ?? ""),
                lastExportFilenameTabId: activeTabId,
              }
            : {}),
        });
      },
      closeExportModal: () => set({ exportModalOpen: false }),
      resetCloudExportStatus: () =>
        set({ cloudExportStatus: CloudExportStatus.IDLE }),

      setExportDestination: (destination) => {
        set({
          lastExportDestination: destination,
          lastExportFolderPath: ROOT_CLOUD_PATH,
        });
        persist.saveUiState(uiStateSnapshot(get()));
      },
      setExportFormat: (format) => {
        set({ lastExportFormat: format });
        persist.saveUiState(uiStateSnapshot(get()));
      },
      setExportFilename: (filename) => {
        set({
          lastExportFilename: filename,
          lastExportFilenameTabId: getActiveTab(get())?.id ?? null,
        });
        debouncedSaveState();
      },
      setExportFolderPath: (path) => {
        set({ lastExportFolderPath: path });
        persist.saveUiState(uiStateSnapshot(get()));
      },

      openPasteRunbookModal: () => set({ pasteRunbookModalOpen: true }),
      closePasteRunbookModal: () => set({ pasteRunbookModalOpen: false }),

      exportRunbook: async (destination, format, filename, folderId) => {
        set({
          lastExportDestination: destination,
          lastExportFormat: format,
        });

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

          // A same-named file in the target folder is replaced, so ask first
          if (await client.fileExists(fullName, folderId)) {
            const t = getMessages(get().language);
            set({ cloudExportStatus: CloudExportStatus.IDLE });

            const confirmed = await get().confirm(
              t.dialogs.overwriteCloudFileMessage(fullName),
              {
                title: t.dialogs.overwriteCloudFileTitle,
                confirmLabel: t.dialogs.overwriteCloudFileConfirm,
                tone: DialogTone.WARNING,
              },
            );

            if (!confirmed) {
              return;
            }

            set({ cloudExportStatus: CloudExportStatus.UPLOADING });
          }

          await client.writeFile(
            fullName,
            buildRunbookExportContent(format, content),
            FilePickerConfig[format].mimeType,
            folderId,
          );

          // JSON is the only round-trippable format, so it is the only one worth linking
          if (format === ExportFormat.JSON && active?.runbookId) {
            linkRunbookToCloud(
              active.runbookId,
              { provider: destination, filename: fullName, folderId },
              content,
            );
          }

          // The destination folder now holds a file no cached listing has
          clearCachedCloudEntries(destination);
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
        set({
          destinationModalOpen: false,
          cloudImportModalOpen: false,
          lastImportSource: destination,
        });
        persist.saveUiState(uiStateSnapshot(get()));

        if (destination === SyncDestination.LOCAL) {
          openImportDialog();
          return;
        }

        void get().startCloudImportBrowse(destination);
      },

      startCloudBrowse: async (provider, path = ROOT_CLOUD_PATH) => {
        const startPath = lastBrowsedCloudPath.get(provider) ?? path;

        startCloudRequest();
        set({
          ...clearedCloudListing(),
          cloudProvider: provider,
          cloudError: null,
          cloudEntries: [],
          cloudSignedIn: false,
          cloudAccountLabel: null,
          cloudFileEditor: null,
          cloudLoading: true,
          cloudPath: startPath,
          cloudHistory: [startPath],
          cloudHistoryIndex: 0,
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

        if (client.isSignedIn() && get().cloudProvider === provider) {
          await loadCloudEntries();
        }
      },

      startCloudImportBrowse: async (provider) => {
        set({ cloudImportModalOpen: true });
        await get().startCloudBrowse(provider);
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
          await get().refreshCloudEntries();
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
        const t = getMessages(get().language);
        const confirmed = await get().confirm(t.dialogs.signOutCloudMessage, {
          title: t.dialogs.signOutCloudTitle,
          confirmLabel: t.dialogs.signOutCloudConfirm,
          tone: DialogTone.INFO,
        });

        if (!confirmed) {
          return;
        }

        const client = getCloudClient(get().cloudProvider);
        try {
          await client.signOut();
        } catch (error) {
          console.error("Cloud sign-out failed", error);
        }

        // Nothing walked under this account survives into the next one
        clearCachedCloudEntries(get().cloudProvider);
        lastBrowsedCloudPath.delete(get().cloudProvider);
        startCloudRequest();
        set((s) => ({
          ...clearedCloudListing(),
          runbookSyncStatus: {
            ...s.runbookSyncStatus,
            // Linked runbooks can no longer reach this provider until a new sign-in
            ...Object.fromEntries(
              s.runbookLibrary
                .filter((item) => item.sync?.provider === s.cloudProvider)
                .map((item) => [item.id, RunbookSyncStatus.SIGNED_OUT]),
            ),
          },
          cloudEntries: [],
          cloudError: null,
          cloudSignedIn: false,
          cloudAccountLabel: null,
          cloudFileEditor: null,
          cloudPath: ROOT_CLOUD_PATH,
          cloudHistory: [ROOT_CLOUD_PATH],
          cloudHistoryIndex: 0,
        }));
      },

      refreshCloudEntries: async () => {
        clearCachedCloudEntries(get().cloudProvider);
        await loadCloudEntries();
      },

      openCloudFolder: (folder) =>
        get().navigateCloudToPath([
          ...get().cloudPath,
          { id: folder.id, name: folder.name },
        ]),

      navigateCloudToDepth: (depth) =>
        get().navigateCloudToPath(get().cloudPath.slice(0, depth)),

      navigateCloudToPath: (path) => {
        // Browsing away from a history entry drops everything ahead of it
        const history = get().cloudHistory.slice(
          0,
          get().cloudHistoryIndex + 1,
        );

        lastBrowsedCloudPath.set(get().cloudProvider, path);

        set({
          // Opening a folder from a search result lands you in that folder
          ...clearedCloudSearch(),
          cloudPath: path,
          cloudHistory: [...history, path],
          cloudHistoryIndex: history.length,
          cloudError: null,
          cloudEntries: [],
        });

        void loadCloudEntries();
      },

      navigateCloudHistory: (direction) => {
        const step = direction === HistoryDirection.BACK ? -1 : 1;
        const index = get().cloudHistoryIndex + step;
        const path = get().cloudHistory[index];

        if (!path) {
          return;
        }

        lastBrowsedCloudPath.set(get().cloudProvider, path);

        set({
          ...clearedCloudSearch(),
          cloudPath: path,
          cloudHistoryIndex: index,
          cloudError: null,
          cloudEntries: [],
        });
        void loadCloudEntries();
      },

      setCloudSearchQuery: (query) => {
        const previous = get().cloudSearchQuery;

        if (!query.trim()) {
          set({ ...clearedCloudSearch(), cloudSearchQuery: query });
          return;
        }

        set({ cloudSearchQuery: query });

        // The tree is walked once when a search starts, then filtered locally
        if (!previous.trim()) {
          void get().refreshCloudSearchEntries();
        }
      },

      toggleCloudSort: (column) => {
        const current = get().cloudSort;
        set({
          cloudSort: {
            column,
            direction:
              current.column === column
                ? current.direction === SortDirection.ASC
                  ? SortDirection.DESC
                  : SortDirection.ASC
                : column === CloudSortColumn.NAME
                  ? SortDirection.ASC
                  : SortDirection.DESC,
          },
        });
      },

      refreshCloudSearchEntries: async () => {
        const client = getCloudClient(get().cloudProvider);
        const requestId = startCloudSearchRequest();
        set({ cloudSearchLoading: true });

        try {
          const found = await walkCloudTree(client);
          if (isCurrentCloudSearchRequest(requestId)) {
            set({ cloudSearchEntries: found });
          }
        } catch (error) {
          console.error("Failed to search cloud entries", error);
          if (isCurrentCloudSearchRequest(requestId)) {
            set({
              cloudSearchEntries: [],
              cloudError: getMessages(get().language).cloudModal.genericError,
            });
          }
        } finally {
          if (isCurrentCloudSearchRequest(requestId)) {
            set({ cloudSearchLoading: false });
          }
        }
      },

      createCloudFolder: async (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }

        const t = getMessages(get().language);
        const taken = get().cloudEntries.some(
          (entry) => entry.name.toLowerCase() === trimmed.toLowerCase(),
        );

        if (taken) {
          set({ cloudError: t.cloudModal.nameTakenError(trimmed) });
          return;
        }

        const client = getCloudClient(get().cloudProvider);
        set({ cloudLoading: true, cloudError: null });
        try {
          await client.createFolder(trimmed, currentFolderId(get().cloudPath));
        } catch (error) {
          console.error("Cloud folder creation failed", error);
          set({
            cloudLoading: false,
            cloudError: t.cloudModal.createFolderError,
          });
          return;
        }

        set({ cloudLoading: false });
        await get().refreshCloudEntries();
      },

      setCloudSelection: (entries) =>
        set({
          cloudSelectedEntries: new Map(
            entries.map((entry) => [
              entry.id,
              { entry, path: parentFolderPath(get(), entry) },
            ]),
          ),
        }),

      toggleCloudSelected: (entry) =>
        set((s) => {
          const cloudSelectedEntries = new Map(s.cloudSelectedEntries);
          if (!cloudSelectedEntries.delete(entry.id)) {
            cloudSelectedEntries.set(entry.id, {
              entry,
              path: parentFolderPath(s, entry),
            });
          }

          return { cloudSelectedEntries };
        }),

      clearCloudSelection: () =>
        set({ cloudSelectedEntries: emptyCloudSelection() }),

      importRunbooksFromCloud: async (files) => {
        if (files.length === 0) {
          return;
        }

        const client = getCloudClient(get().cloudProvider);
        const t = getMessages(get().language);

        // Every file is read before the first one is added
        const pending: { file: CloudEntry; content: RunbookContent }[] = [];
        const syncs = new Map<string, RunbookSync>(
          files.map((file) => [
            file.id,
            {
              provider: get().cloudProvider,
              filename: file.name,
              folderId: parentFolderId(get(), file),
            },
          ]),
        );

        set({ cloudLoading: true, cloudError: null });
        let failure: string | null = null;

        for (const file of files) {
          let text: string;
          try {
            text = await client.readFile(file);
          } catch (error) {
            console.error("Cloud file read failed", error);
            failure = t.cloudModal.genericError;
            continue;
          }

          try {
            pending.push({ file, content: parseRunbookContent(text) });
          } catch {
            failure = t.cloudModal.invalidFileError;
          }
        }

        set({ cloudLoading: false, cloudError: failure });

        let added = 0;
        for (const { file, content } of pending) {
          const accepted = await get().addRunbookToLibrary(
            content,
            stripJsonExtension(file.name),
            file.name,
            syncs.get(file.id),
          );

          if (accepted) {
            added++;
          }
        }

        if (added > 0) {
          set({ cloudImportModalOpen: false });
        }
      },

      renameCloudEntry: async (entry, basename) => {
        const trimmed = basename.trim();
        if (!trimmed) {
          return;
        }

        // Only files carry the .json extension
        const name = entry.isFolder ? trimmed : withJsonExtension(trimmed);
        if (name === entry.name) {
          return;
        }

        const t = getMessages(get().language);
        const taken = siblingEntries(get(), entry).some(
          (other) =>
            other.id !== entry.id &&
            other.name.toLowerCase() === name.toLowerCase(),
        );

        if (taken) {
          set({ cloudError: t.cloudModal.nameTakenError(name) });
          return;
        }

        const client = getCloudClient(get().cloudProvider);
        set({ cloudLoading: true, cloudError: null });
        try {
          await client.renameEntry(entry, name);
        } catch (error) {
          console.error("Cloud entry rename failed", error);
          set({
            cloudLoading: false,
            cloudError: entry.isFolder
              ? t.cloudModal.renameFolderError
              : t.cloudModal.renameError,
          });
          return;
        }

        set({ cloudLoading: false });
        await get().refreshCloudEntries();
      },

      openCloudFileEditor: async (file) => {
        const t = getMessages(get().language);
        const client = getCloudClient(get().cloudProvider);

        set({
          cloudFileEditor: {
            file,
            folderPath: parentFolderPath(get(), file),
            folderId: parentFolderId(get(), file),
            original: "",
            text: "",
            loading: true,
            saving: false,
            error: null,
          },
        });

        const isCurrentEditor = () =>
          get().cloudFileEditor?.file.id === file.id;

        let text: string;
        try {
          text = await client.readFile(file);
        } catch (error) {
          console.error("Cloud file read failed", error);

          if (isCurrentEditor()) {
            set({
              cloudFileEditor: {
                ...get().cloudFileEditor!,
                loading: false,
                error: t.cloudModal.readError,
              },
            });
          }

          return;
        }

        if (isCurrentEditor()) {
          set({
            cloudFileEditor: {
              ...get().cloudFileEditor!,
              original: text,
              text,
              loading: false,
            },
          });
        }
      },

      setCloudFileEditorText: (text) => {
        const editor = get().cloudFileEditor;
        if (!editor) {
          return;
        }

        // Typing clears a stale "invalid JSON" / failed-save message
        set({ cloudFileEditor: { ...editor, text, error: null } });
      },

      saveCloudFileEditor: async () => {
        const editor = get().cloudFileEditor;
        if (!editor || editor.loading || editor.saving) {
          return;
        }

        const t = getMessages(get().language);
        try {
          JSON.parse(editor.text);
        } catch {
          set({
            cloudFileEditor: {
              ...editor,
              error: t.cloudModal.invalidJsonError,
            },
          });

          return;
        }

        const client = getCloudClient(get().cloudProvider);
        set({ cloudFileEditor: { ...editor, saving: true, error: null } });

        try {
          await client.writeFile(
            editor.file.name,
            editor.text,
            MimeType.JSON,
            editor.folderId,
          );
        } catch (error) {
          console.error("Cloud file save failed", error);
          set({
            cloudFileEditor: {
              ...get().cloudFileEditor!,
              saving: false,
              error: t.cloudModal.saveError,
            },
          });

          return;
        }

        set({ cloudFileEditor: null });
        await get().refreshCloudEntries();
      },

      closeCloudFileEditor: async () => {
        const editor = get().cloudFileEditor;
        if (!editor) {
          return;
        }

        const t = getMessages(get().language);
        const dirty = !editor.loading && editor.text !== editor.original;

        if (dirty) {
          const discard = await get().confirm(
            t.dialogs.discardCloudEditMessage(editor.file.name),
            {
              title: t.dialogs.discardCloudEditTitle,
              confirmLabel: t.dialogs.discardCloudEditConfirm,
              tone: DialogTone.WARNING,
            },
          );

          if (!discard) {
            return;
          }
        }

        set({ cloudFileEditor: null });
      },

      duplicateCloudEntries: async (entries) => {
        if (entries.length === 0) {
          return;
        }

        const t = getMessages(get().language);

        if (entries.length > 1) {
          const confirmed = await get().confirm(
            t.dialogs.duplicateCloudEntriesMessage(
              entries.map((entry) => entry.name),
            ),
            {
              title: t.dialogs.duplicateCloudEntriesTitle,
              confirmLabel: t.dialogs.duplicateCloudEntriesConfirm,
              tone: DialogTone.INFO,
            },
          );

          if (!confirmed) {
            return;
          }
        }

        const client = getCloudClient(get().cloudProvider);
        set({ cloudLoading: true, cloudError: null });

        for (const entry of entries) {
          const parentId = parentFolderId(get(), entry);
          const taken = siblingEntries(get(), entry).map((other) => other.name);

          try {
            await copyCloudEntry(
              client,
              entry,
              parentId,
              buildDuplicateName(entry, taken),
            );
          } catch (error) {
            console.error("Cloud entry duplicate failed", error);
            set({
              cloudError: entry.isFolder
                ? t.cloudModal.duplicateFolderError
                : t.cloudModal.duplicateError,
            });

            break;
          }
        }

        set({
          cloudLoading: false,
          cloudSelectedEntries: emptyCloudSelection(),
        });
        await get().refreshCloudEntries();
      },

      downloadCloudEntries: async (entries) => {
        if (entries.length === 0) {
          return;
        }

        const t = getMessages(get().language);
        const client = getCloudClient(get().cloudProvider);
        const single = entries.length === 1 ? entries[0] : null;

        set({ cloudLoading: true, cloudError: null });
        try {
          if (!single) {
            const folder = get().cloudPath.at(-1)?.name;
            downloadBlob(
              await buildCloudEntriesZip(client, entries),
              `${folder ?? CloudSyncConfig.APP_FOLDER_NAME}${ZIP_EXTENSION}`,
            );
          } else if (single.isFolder) {
            downloadBlob(
              await buildCloudFolderZip(client, single),
              `${single.name}${ZIP_EXTENSION}`,
            );
          } else {
            const content = await client.readFile(single);
            downloadBlob(
              new Blob([content], { type: MimeType.JSON }),
              single.name,
            );
          }
        } catch (error) {
          console.error("Cloud entry download failed", error);
          set({
            cloudError: !single
              ? t.cloudModal.downloadEntriesError
              : single.isFolder
                ? t.cloudModal.downloadFolderError
                : t.cloudModal.downloadError,
          });
        } finally {
          set({ cloudLoading: false });
        }
      },

      deleteCloudEntries: async (entries) => {
        if (entries.length === 0) {
          return;
        }

        const t = getMessages(get().language);
        const [single] = entries.length === 1 ? entries : [];

        const confirmed = await get().confirm(
          !single
            ? t.dialogs.deleteCloudEntriesMessage(
                entries.map((entry) => entry.name),
              )
            : single.isFolder
              ? t.dialogs.deleteCloudFolderMessage(single.name)
              : t.dialogs.deleteCloudFileMessage(single.name),
          {
            title: !single
              ? t.dialogs.deleteCloudEntriesTitle
              : single.isFolder
                ? t.dialogs.deleteCloudFolderTitle
                : t.dialogs.deleteCloudFileTitle,
            confirmLabel: !single
              ? t.dialogs.deleteCloudEntriesConfirm
              : single.isFolder
                ? t.dialogs.deleteCloudFolderConfirm
                : t.dialogs.deleteCloudFileConfirm,
            tone: DialogTone.DANGER,
          },
        );

        if (!confirmed) {
          return;
        }

        const client = getCloudClient(get().cloudProvider);
        set({ cloudLoading: true, cloudError: null });

        for (const entry of entries) {
          try {
            await client.deleteEntry(entry);
          } catch (error) {
            console.error("Cloud entry delete failed", error);
            set({
              cloudError: entry.isFolder
                ? t.cloudModal.deleteFolderError
                : t.cloudModal.deleteError,
            });

            break;
          }
        }

        set({
          cloudLoading: false,
          cloudSelectedEntries: emptyCloudSelection(),
        });
        await get().refreshCloudEntries();
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
              tone: options?.tone ?? DialogTone.INFO,
            },
          });
        });
      },
      resolveConfirm: (result) => {
        get().confirmDialog?.resolve(result);
        set({ confirmDialog: null });
      },
      alert: (message, options) => {
        if (isDemo) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          const defaultTitle = getMessages(get().language).alert.defaultTitle;
          set({
            alertDialog: {
              message,
              resolve,
              title: options?.title ?? defaultTitle,
              tone: options?.tone ?? DialogTone.INFO,
            },
          });
        });
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
          tone: DialogTone.DANGER,
        });

        if (!confirmed) {
          return;
        }

        // Drops runbook content only
        if (!isDemo) {
          await deleteRunbookDb();
          persistence.clearStoredRunbooks();
        }

        queuedSyncContent.clear();
        pushedSyncContent.clear();
        set({
          tabs: [],
          activeTabId: null,
          activeRunbookId: null,
          runbookLibrary: [],
          runbookSyncStatus: {},
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
          tone: DialogTone.DANGER,
        });

        if (!confirmed) {
          return false;
        }

        // Never let a demo store wipe the user's real data
        if (!isDemo) {
          await deleteRunbookDb();
          localStorage.clear();
          sessionStorage.clear();
        }

        queuedSyncContent.clear();
        pushedSyncContent.clear();
        set({
          tabs: [],
          activeTabId: null,
          activeRunbookId: null,
          runbookLibrary: [],
          runbookSyncStatus: {},
          runbookSearchQuery: "",
          variableSearchQuery: "",
          selectedBlockIds: new Set(),
          focusedRunbookId: null,
        });

        return true;
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
