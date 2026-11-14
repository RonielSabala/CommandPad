import { createDefaultPanels, VariableSplit } from "@/common/config";
import {
  DEFAULT_COMMAND_LANGUAGE,
  DEFAULT_VARIABLE_LANGUAGE,
} from "@/common/editorConfig";
import {
  AppMode,
  ClampSurface,
  CloudExportStatus,
  CloudProvider,
  ExportFormat,
  PanelSide,
  RevealTone,
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
    defaultCommandLanguage: DEFAULT_COMMAND_LANGUAGE,
    defaultVariableLanguage: DEFAULT_VARIABLE_LANGUAGE,
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
    libraryFolders: [],
    libraryRunbooks: [],
    activeRunbookId: null,
    recentRunbookIds: [],
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
    pendingLibraryFolderRenameId: null,
    pendingRevealBlockId: null,
    revealedBlockId: null,
    blockRevealTone: RevealTone.UNRESOLVED,
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
    settingsModalOpen: false,
    quickOpenQuery: null,
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
