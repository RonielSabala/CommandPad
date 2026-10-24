import { createDefaultPanels, VariableSplit } from "@/common/config";
import {
  AppMode,
  ClampSurface,
  CloudExportStatus,
  CloudProvider,
  ExportFormat,
  PanelSide,
  SyncDestination,
  Theme,
} from "@/common/enums";
import { detectLanguage } from "@/i18n/messages";
import { DEFAULT_CLOUD_SORT } from "@/services/cloud";

import { ROOT_CLOUD_PATH } from "./cloudPaths";
import type { StoreData } from "./types";

export function createInitialState(): StoreData {
  return {
    // Bootstrap
    initialized: false,

    // UI
    mode: AppMode.EDIT,
    theme: Theme.LIGHT,
    language: detectLanguage(),
    spellcheckEnabled: true,
    panels: createDefaultPanels(),
    variableKeyRatio: VariableSplit.DEFAULT,
    minimapEnabled: true,
    minimapPosition: PanelSide.RIGHT,
    runbookSectionCollapsed: false,
    variablesSectionCollapsed: false,

    // Search
    runbookSearchQuery: "",
    variableSearchQuery: "",

    // Data
    tabs: [],
    activeTabId: null,
    runbookLibrary: [],
    activeRunbookId: null,
    runbookSyncStatus: {},
    embeddedRunbooks: {},
    embeddedSectionFolds: {},

    // Interaction / selection
    focusedRunbookId: null,
    selectedBlockIds: new Set(),
    flashBlockIds: new Set(),
    selectedVariableIds: new Set(),
    flashVariableIds: new Set(),
    expandedClampSurfaces: {
      [ClampSurface.PREVIEW]: new Set(),
      [ClampSurface.EDITOR]: new Set(),
      [ClampSurface.VALUE]: new Set(),
    },
    selectKeyHeld: false,
    linkKeyHeld: false,
    pendingFocusBlockId: null,
    pendingRevealBlockId: null,
    revealedBlockId: null,
    pendingRevealVariable: null,
    revealedVariable: null,
    pendingFocusVariableId: null,
    pendingFocusSectionId: null,
    imageViewerBlockId: null,
    imageViewerSlides: null,

    // Modals / dialogs
    exportModalOpen: false,
    cloudExportStatus: CloudExportStatus.IDLE,
    cloudExportProvider: null,
    pasteRunbookModalOpen: false,
    confirmDialog: null,
    alertDialog: null,

    // Secret encryption
    vaultStatus: {},
    vaultDialog: null,

    // Cloud sync
    destinationModalOpen: false,
    cloudImportModalOpen: false,
    cloudProvider: CloudProvider.ONEDRIVE,
    cloudSignedIn: false,
    cloudAccountLabel: null,
    cloudEntries: [],
    cloudLoading: false,
    cloudError: null,
    cloudFileEditor: null,
    cloudSelectedEntries: new Map(),
    cloudConflict: null,
    saveNotice: null,

    // Cloud folder navigation
    cloudPath: ROOT_CLOUD_PATH,
    cloudHistory: [ROOT_CLOUD_PATH],
    cloudHistoryIndex: 0,

    // Cloud search
    cloudSearchQuery: "",
    cloudSearchEntries: [],
    cloudSearchLoading: false,

    // Cloud list sorting
    cloudSort: DEFAULT_CLOUD_SORT,

    // Remembered cloud-sync choices
    lastExportDestination: SyncDestination.LOCAL,
    lastExportFormat: ExportFormat.JSON,
    lastExportFilename: "",
    lastExportFilenameTabId: null,
    lastExportFolderPath: ROOT_CLOUD_PATH,
    lastImportSource: SyncDestination.LOCAL,
  };
}
