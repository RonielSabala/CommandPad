import type { DocsSectionId } from "@/common/constants/docs";
import type { BlockType, NoteStyle, RunbookSyncStatus } from "@/common/enums";
import type { KeyBinding } from "@/common/keybindings";

// Supported UI languages
export const Language = {
  EN: "en",
  ES: "es",
} as const;
export type Language = (typeof Language)[keyof typeof Language];

export const LANGUAGE_ORDER: readonly Language[] = [Language.EN, Language.ES];

export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.EN]: "EN",
  [Language.ES]: "ES",
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  [Language.EN]: "English",
  [Language.ES]: "Español",
};

interface LegalSectionMessage {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPageMessages {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSectionMessage[];
}

// The full translation catalog
export interface Messages {
  common: {
    cancel: string;
    close: string;
    back: string;
    ok: string;
    create: string;
    save: string;
    dragToReorder: string;
    clearSearch: string;
    noMatches: string;
    untitledTab: string;
    untitledRunbook: string;
  };
  header: {
    reloadTitle: string;
    switchToEdit: string;
    switchToRead: string;
    switchToDark: string;
    switchToLight: string;
    collapseAll: string;
    toggleEditorsTitle: string;
    resetWorkspaceTitle: string;
    exportTitle: string;
    export: string;
    changeLanguage: string;
  };
  sidebar: {
    expand: string;
    collapse: string;
    moveLeft: string;
    moveRight: string;
    doubleClickExpand: string;
    dragResizeCollapse: string;
  };
  contextMenu: {
    copyMarkdown: string;
    minimap: string;
    moveMinimapLeft: string;
    moveMinimapRight: string;
  };
  runbooks: {
    title: string;
    searchPlaceholder: string;
    empty: string;
    import: string;
    importTitle: string;
    paste: string;
    pasteTitle: string;
    actions: string;
    duplicate: string;
    removeFromLibrary: string;
    dropToImport: string;
    clearLibrary: string;
    clearLibraryTitle: string;
    stopSyncing: string;
    syncStatus: Record<RunbookSyncStatus, (provider: string) => string>;
  };
  variables: {
    title: string;
    searchPlaceholder: string;
    empty: string;
    new: string;
    newTitle: string;
    keyPlaceholder: string;
    valuePlaceholder: string;
    reveal: string;
    mask: string;
    actions: string;
    duplicate: string;
    remove: string;
    dragResizeSplit: string;
    unusedTitle: (key: string) => string;
  };
  tabs: {
    newTab: string;
    closeTab: string;
  };
  blocks: {
    newBlockLabel: string;
    typeLabel: Record<BlockType, string>;
    typeTitle: (label: string) => string;
    actions: string;
    duplicate: (count: number) => string;
    delete: (count: number) => string;
    emptyTitle: string;
    emptyHint: string;
  };
  command: {
    emptyPreview: string;
    showEditor: string;
    hideEditor: string;
    showMoreLines: string;
    showFewerLines: string;
    copy: string;
    placeholder: string;
  };
  note: {
    styleLabel: Record<NoteStyle, string>;
    stylePlaceholder: Record<NoteStyle, string>;
    followLinkTooltip: (binding?: string) => string;
  };
  exportModal: {
    title: string;
    cloudTitle: string;
    destinationLabel: string;
    formatLabel: string;
    filenameLabel: string;
    folderLabel: string;
    changeFolder: string;
    chooseFolder: string;
    selectFolder: string;
    confirm: string;
    savingTo: (provider: string) => string;
    savedTo: (provider: string) => string;
    exportError: string;
    tryAgain: string;
  };
  pasteModal: {
    title: string;
    message: string;
    error: string;
  };
  destinationModal: {
    title: string;
    message: string;
    local: string;
  };
  cloudModal: {
    importTitle: string;
    changeProvider: string;
    signInPrompt: (provider: string) => string;
    signInSharePoint: string;
    signInGoogleDrive: string;
    signOut: string;
    signedInAs: (account: string) => string;
    refresh: string;
    loading: string;
    emptyFiles: string;
    emptyFolders: string;
    columnName: string;
    columnModified: string;
    columnSize: string;
    sortAscending: (column: string) => string;
    sortDescending: (column: string) => string;
    searchFilesPlaceholder: string;
    searchFoldersPlaceholder: string;
    noResultsFiles: string;
    noResultsFolders: string;
    navigateBack: string;
    navigateForward: string;
    openFolderAction: (name: string) => string;
    newFolder: string;
    folderNamePlaceholder: string;
    createFolder: string;
    cancelNewFolder: string;
    importAction: (filename: string) => string;
    entryActions: string;
    rename: string;
    edit: string;
    duplicate: string;
    download: string;
    delete: string;
    editTitle: (filename: string) => string;
    editHint: string;
    saveName: string;
    cancelRename: string;
    namePlaceholder: string;
    signInError: string;
    genericError: string;
    invalidFileError: string;
    invalidJsonError: string;
    readError: string;
    saveError: string;
    renameError: string;
    duplicateError: string;
    downloadError: string;
    deleteError: string;
    renameFolderError: string;
    duplicateFolderError: string;
    downloadFolderError: string;
    deleteFolderError: string;
    createFolderError: string;
    nameTakenError: (filename: string) => string;
  };
  alert: {
    defaultTitle: string;
  };
  confirm: {
    defaultTitle: string;
  };
  dialogs: {
    overwriteTitle: string;
    overwriteConfirm: string;
    overwriteMessage: (filename: string, existingName: string) => string;
    overwriteCloudFileTitle: string;
    overwriteCloudFileConfirm: string;
    overwriteCloudFileMessage: (filename: string) => string;
    importFailedTitle: string;
    importFailed: (count: number) => string;
    pastedRunbook: string;
    resetTitle: string;
    resetConfirm: string;
    resetMessage: string;
    clearLibraryTitle: string;
    clearLibraryConfirm: string;
    clearLibraryMessage: string;
    deleteRunbookTitle: string;
    deleteRunbookConfirm: string;
    deleteRunbookMessage: (label: string) => string;
    deleteCloudFileTitle: string;
    deleteCloudFileConfirm: string;
    deleteCloudFileMessage: (filename: string) => string;
    deleteCloudFolderTitle: string;
    deleteCloudFolderConfirm: string;
    deleteCloudFolderMessage: (name: string) => string;
    signOutCloudTitle: string;
    signOutCloudConfirm: string;
    signOutCloudMessage: string;
    discardCloudEditTitle: string;
    discardCloudEditConfirm: string;
    discardCloudEditMessage: (filename: string) => string;
  };
  keybindings: Record<KeyBinding, string>;
  footer: {
    privacy: string;
    terms: string;
  };
  home: {
    meta: {
      openApp: string;
    };
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
    demo: {
      title: string;
      hint: string;
    };
    features: {
      title: string;
      subtitle: string;
      items: { title: string; body: string }[];
    };
    closing: {
      title: string;
      body: string;
      cta: string;
    };
  };
  privacy: LegalPageMessages;
  terms: LegalPageMessages;
  docs: {
    meta: {
      title: string;
      openDocs: string;
      backToApp: string;
      tocTitle: string;
    };
    toc: Record<DocsSectionId, string>;
    demo: {
      tryIt: string;
      reset: string;
      noteSample: string;
      tabSamples: string[];
      runbookSamples: string[];
      multiSelectNotes: string[];
      greetingTemplate: string;
    };
    gettingStarted: {
      intro: string;
      why: string;
      journey: string;
      navigate: string;
      tryIt: string;
    };
    workspace: {
      intro: string;
      items: string[];
      persistence: string;
    };
    header: {
      intro: string;
      items: string[];
    };
    mainPanel: {
      intro: string;
      minimap: string;
      teaser: string;
    };
    tabs: {
      intro: string;
      items: string[];
      autoCreate: string;
      labelDemo: string;
    };
    sidebar: {
      intro: string;
      items: string[];
      resizeDetails: string;
    };
    runbookLibrary: {
      intro: string;
      items: string[];
      autoLabel: string;
      labelDetails: string;
      autoSave: string;
    };
    variables: {
      why: string;
      intro: string;
      usage: string;
      unresolved: string;
      tooltip: string;
      split: string;
      demoHint: string;
      constants: string;
      constantsDemoHint: string;
    };
    variableReferences: {
      intro: string;
      demoHint: string;
      circular: string;
    };
    parameterizedPlaceholders: {
      intro: string;
      fill: string;
      seeExample: string;
      multiple: string;
      nested: string;
    };
    escapingBraces: {
      intro: string;
      tryHint: string;
      scope: string;
    };
    secretVariables: {
      intro: string;
      copyNote: string;
    };
    blocks: {
      intro: string;
    };
    commandBlock: {
      intro: string;
      parts: string[];
      multiline: string;
      longCommands: string;
      variablesTeaser: string;
    };
    noteBlock: {
      intro: string;
      styles: string;
      markdown: string;
      tableSyntax: string;
      tableResult: string;
      autoUrls: string;
      noNesting: string;
      links: string;
      wrapKeys: string;
    };
    dividerBlock: {
      intro: string;
      demoNote: string;
    };
    multiSelect: {
      intro: string;
      actions: string[];
      clear: string;
      dragToTabDelay: string;
      demoHint: string;
    };
    readMode: {
      intro: string;
      rules: string[];
      persisted: string;
      exit: string;
    };
    export: {
      intro: string;
      formats: string[];
      saveDialog: string;
      copyMarkdown: string;
    };
    cloudExport: {
      intro: string;
      switchProvider: string;
      overwrite: string;
    };
    cloudLinkedSync: {
      intro: string;
      syncBadge: string;
      stopSyncing: string;
    };
    cloudFileManagement: {
      folders: string;
      search: string;
      actions: string;
      editFile: string;
      recycleBin: string;
      storage: string;
    };
    language: {
      intro: string;
      detection: string;
    };
    keyboardShortcuts: {
      intro: string;
    };
    qa: {
      intro: string;
      items: { question: string; answer: string }[];
    };
  };
}
