import {
  AppMode,
  BlockType,
  ClampSurface,
  CloudExportStatus,
  CloudProvider,
  CloudSortColumn,
  DialogTone,
  ExportFormat,
  HistoryDirection,
  InsertPosition,
  MoveDirection,
  PanelId,
  PanelSide,
  RunbookEmbedView,
  RunbookSyncStatus,
  RunbookView,
  SaveOutcome,
  SyncDestination,
  Theme,
  VariableEntryKind,
  VariableField,
  VariableKind,
  VaultError,
  VaultField,
  VaultPrompt,
  VaultStatus,
} from "@/common/enums";
import type {
  BlockInsertAnchor,
  BlockOfType,
  EmbeddedRunbook,
  ImageBlock,
  PanelState,
  RunbookContent,
  RunbookEntry,
  RunbookStats,
  RunbookSync,
  Tab,
  VaultRecord,
} from "@/common/types";
import { Language } from "@/i18n/types";
import type {
  CloudEntry,
  CloudFolderRef,
  CloudSort,
  PlacedCloudEntry,
} from "@/services/cloud";
import type { EmbedSource } from "@/utils/embeddedRunbook";
import type { StoreApi } from "zustand";

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

export type VaultPassphrases = Record<VaultField, string>;

interface VaultDialog {
  prompt: VaultPrompt;
  filename: string | null;
  error: VaultError | null;
  busy: boolean;
  verify: (passphrases: VaultPassphrases) => Promise<boolean>;
  resolve: (unlocked: boolean) => void;
}

interface CloudFileEditor {
  file: CloudEntry;
  folderPath: CloudFolderRef[];
  folderId: string | null;
  original: string;
  text: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface CloudConflict {
  runbookId: string;
  provider: CloudProvider;
  filename: string;
  cloudText: string;
  localText: string;
  local: RunbookContent;
  error: string | null;
  resolve: (kept: RunbookContent | null) => void;
}

interface SaveNotice {
  id: number;
  outcome: SaveOutcome;
  provider: CloudProvider | null;
}

interface VariableReveal {
  id: string;
  resolved: boolean;
}

export interface StoreState {
  // Data
  tabs: Tab[];
  activeTabId: string | null;
  runbookLibrary: RunbookEntry[];
  activeRunbookId: string | null;
  runbookSyncStatus: Record<string, RunbookSyncStatus>;
  embeddedRunbooks: Record<string, EmbeddedRunbook>;
  embeddedSectionFolds: Record<string, boolean>;

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
  selectedVariableIds: Set<string>;
  flashVariableIds: Set<string>;
  expandedClampSurfaces: Record<ClampSurface, Set<string>>;
  selectKeyHeld: boolean;
  linkKeyHeld: boolean;
  pendingFocusBlockId: string | null;
  pendingRevealBlockId: string | null;
  revealedBlockId: string | null;
  pendingRevealVariable: VariableReveal | null;
  revealedVariable: VariableReveal | null;
  pendingFocusVariableId: string | null;
  pendingFocusSectionId: string | null;
  imageViewerBlockId: string | null;
  imageViewerSlides: ImageBlock[] | null;

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

  // Secret encryption
  vaultStatus: Record<string, VaultStatus>;
  vaultDialog: VaultDialog | null;

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
  cloudConflict: CloudConflict | null;
  saveNotice: SaveNotice | null;

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
  closeTabs: (tabIds: string[]) => void;
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
    vault?: { record: VaultRecord; passphrase: string | null },
  ) => Promise<boolean>;
  saveActiveRunbook: () => Promise<void>;
  saveRunbookToCloud: (id: string) => Promise<void>;
  resolveCloudConflict: (text: string | null) => void;
  dismissSaveNotice: (id: number) => void;
  unlinkRunbookSync: (id: string) => void;

  readRunbookStats: (runbookId: string) => Promise<RunbookStats | null>;
  loadEmbeddedRunbook: (source: EmbedSource) => Promise<void>;
  refreshEmbeddedRunbook: (source: EmbedSource) => Promise<void>;
  openEmbeddedRunbook: (source: EmbedSource) => Promise<void>;
  setRunbookEmbedView: (blockId: string, view: RunbookEmbedView) => void;
  setEmbeddedSectionFolded: (foldKey: string, folded: boolean) => void;
  unlockEmbeddedRunbook: (source: EmbedSource) => Promise<void>;
  signInForEmbeddedRunbooks: (provider: CloudProvider) => Promise<void>;
  listEmbeddableCloudFolder: (
    provider: CloudProvider,
    path: string,
  ) => Promise<CloudEntry[] | null>;

  importRunbooks: (files: File[]) => Promise<void>;
  importRunbookFromText: (text: string) => Promise<boolean>;
  reorderRunbooks: (sourceId: string, targetId: string) => void;
  setRunbookFocus: (id: string | null) => void;
  navigateRunbookList: (direction: MoveDirection) => void;

  addVariable: (kind?: VariableKind) => Promise<void>;
  extractVariable: (value: string) => { id: string; key: string } | null;
  defineVariable: (tabId: string, key: string) => string | null;
  removeVariable: (variableId: string) => void;
  duplicateVariable: (variableId: string) => void;
  updateVariable: (
    variableId: string,
    field: VariableField,
    value: string,
  ) => void;
  toggleVariableSecret: (variableId: string) => void;
  addVariableOption: (variableId: string, option: string) => void;
  removeVariableOption: (variableId: string, option: string) => void;
  applyVariableKeyCase: (variableId: string, keyword: string) => void;
  clearVariableValues: (variableId: string) => void;
  reorderVariables: (sourceId: string, targetId: string) => void;
  clearVariableFlash: (variableId: string) => void;
  consumeVariableFocus: () => void;

  addVariableSection: (variableId?: string) => void;
  insertVariableRow: (
    targetId: string,
    kind: VariableEntryKind,
    position: InsertPosition,
    variableKind?: VariableKind,
  ) => void;
  renameVariableSection: (sectionId: string, name: string) => void;
  toggleVariableSection: (sectionId: string) => void;
  consumeSectionFocus: () => void;

  addBlock: (blockType: BlockType, anchor?: BlockInsertAnchor) => Promise<void>;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  updateBlock: <T extends BlockType>(
    blockId: string,
    type: T,
    patch: Partial<Omit<BlockOfType<T>, "id" | "type">>,
  ) => void;
  setRunbookOverrides: (
    blockId: string,
    overrides: Record<string, string> | undefined,
  ) => void;
  toggleAllBlocksFolded: () => void;
  toggleCollapseAll: () => void;
  reorderBlocks: (sourceId: string, targetId: string) => void;
  copyBlocksToTab: (
    sourceTabId: string,
    targetTabId: string,
    blockIds: string[],
    beforeBlockId?: string,
  ) => void;
  clearFlash: (blockId: string) => void;
  consumeBlockFocus: () => void;
  revealBlock: (tabId: string, blockId: string) => void;
  finishBlockReveal: () => void;
  clearBlockReveal: () => void;
  revealVariable: (variableId: string, resolved: boolean) => void;
  revealEmbeddedVariable: (
    source: EmbedSource,
    key: string,
    resolved: boolean,
  ) => Promise<void>;
  finishVariableReveal: () => void;
  clearVariableReveal: () => void;
  toggleClampSurfaceExpanded: (id: string, surface: ClampSurface) => void;
  openImageViewer: (blockId: string, slides?: ImageBlock[] | null) => void;
  closeImageViewer: () => void;

  setBlockSelected: (blockId: string, selected: boolean) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;
  setVariableSelected: (variableId: string, selected: boolean) => void;
  toggleVariableSelection: (variableId: string) => void;
  clearVariableSelection: () => void;

  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
  toggleRunbookView: (view: RunbookView) => void;
  applyRunbookSource: (text: string) => string | null;
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
  setScrollTop: (view: RunbookView, scrollTop: number) => void;
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

  requestVaultUnlock: (runbookId: string) => Promise<boolean>;
  changeVaultPassphrase: (runbookId: string) => Promise<boolean>;
  submitVaultPassphrase: (passphrases: VaultPassphrases) => Promise<void>;
  dismissVaultDialog: () => void;

  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  resolveAlert: () => void;
  clearRunbookLibrary: () => Promise<void>;
  clearAllData: () => Promise<boolean>;
}

export type AppStoreApi = StoreApi<StoreState>;

/** The state fields, without the actions. */
export type StoreData = {
  [K in keyof StoreState as StoreState[K] extends (...args: never[]) => unknown
    ? never
    : K]: StoreState[K];
};
