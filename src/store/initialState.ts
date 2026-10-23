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
    tabs: [],
    activeTabId: null,
    runbookLibrary: [],
    activeRunbookId: null,
    runbookSyncStatus: {},

    embeddedRunbooks: {},
    embeddedSectionFolds: {},

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

    runbookSearchQuery: "",
    variableSearchQuery: "",

    exportModalOpen: false,
    cloudExportStatus: CloudExportStatus.IDLE,
    cloudExportProvider: null,
    pasteRunbookModalOpen: false,
    confirmDialog: null,
    alertDialog: null,

    vaultStatus: {},
    vaultDialog: null,

    destinationModalOpen: false,
    cloudImportModalOpen: false,
    cloudProvider: CloudProvider.ONEDRIVE,
    cloudSignedIn: false,
    cloudAccountLabel: null,
    cloudEntries: [],
    cloudLoading: false,
    cloudError: null,
    cloudFileEditor: null,
    cloudConflict: null,
    saveNotice: null,
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
  };
}
