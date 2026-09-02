import type { DocsSectionId } from "@/common/constants/docs";
import type {
  BlockType,
  NoteStyle,
  PanelId,
  RunbookSyncStatus,
  VaultError,
  VaultField,
  VaultPrompt,
  VaultStatus,
} from "@/common/enums";
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
  bullets?: string;
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
    loading: string;
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
  panel: {
    names: Record<PanelId, string>;
    expand: (name: string) => string;
    collapse: (name: string) => string;
    moveLeft: (name: string) => string;
    moveRight: (name: string) => string;
    doubleClickExpand: string;
    dragResizeCollapse: string;
  };
  contextMenu: {
    copyMarkdown: string;
    minimap: string;
    moveMinimapLeft: string;
    moveMinimapRight: string;
    spellcheck: string;
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
    secretStatus: Record<VaultStatus, string>;
  };
  variables: {
    title: string;
    searchPlaceholder: string;
    empty: string;
    emptyTitle: string;
    emptyHint: string;
    new: string;
    newTitle: string;
    openEditorTitle: string;
    keyPlaceholder: string;
    valuePlaceholder: string;
    reveal: (count: number) => string;
    mask: (count: number) => string;
    actions: string;
    duplicate: (count: number) => string;
    renameCase: string;
    remove: (count: number) => string;
    dragResizeSplit: string;
    unusedTitle: (key: string) => string;
  };
  tabs: {
    newTab: string;
    closeTab: string;
    close: string;
    closeOthers: string;
    closeAll: string;
    unresolved: string;
  };
  source: {
    openSource: string;
    openPreview: string;
    invalid: string;
  };
  blocks: {
    newBlockLabel: string;
    typeLabel: Record<BlockType, string>;
    typeTitle: (label: string) => string;
    actions: string;
    insertAbove: string;
    insertBelow: string;
    duplicate: (count: number) => string;
    delete: (count: number) => string;
    emptyTitle: string;
    emptyHint: string;
  };
  command: {
    emptyPreview: string;
    changeLanguage: string;
    showEditor: string;
    hideEditor: string;
    showMoreLines: string;
    showFewerLines: string;
    copy: string;
    placeholder: string;
    extractVariable: string;
  };
  note: {
    styleLabel: Record<NoteStyle, string>;
    stylePlaceholder: Record<NoteStyle, string>;
    followLinkTooltip: (binding?: string) => string;
  };
  image: {
    dropHint: string;
    choose: string;
    urlPlaceholder: string;
    addUrl: string;
    viewFullscreen: string;
    download: string;
    previous: string;
    next: string;
    position: (index: number, total: number) => string;
    actions: string;
    replace: string;
    remove: string;
    emptyReadOnly: string;
    loadFailed: string;
    notAnImage: string;
    invalidUrl: string;
    readFailed: string;
    downloadFailed: string;
    tooLarge: (limit: string) => string;
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
  vaultModal: {
    title: Record<VaultPrompt, string>;
    message: Record<VaultPrompt, string>;
    unlockFileMessage: (filename: string) => string;
    submit: Record<VaultPrompt, string>;
    fieldLabel: Record<VaultPrompt, Record<VaultField, string>>;
    reveal: string;
    hide: string;
    skip: string;
    working: string;
    errors: Record<VaultError, string>;
  };
  cloudModal: {
    importTitle: string;
    changeProvider: string;
    signInPrompt: (provider: string) => string;
    signInOneDrive: string;
    signInGoogleDrive: string;
    signOut: string;
    signedInAs: (account: string) => string;
    refresh: string;
    emptyFiles: string;
    emptyFolders: string;
    columnName: string;
    columnModified: string;
    columnSize: string;
    folderItemCount: (count: number) => string;
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
    selectRow: (name: string) => string;
    deselectRow: (name: string) => string;
    selectAll: string;
    deselectAll: string;
    clearSelection: string;
    importFiles: string;
    rename: string;
    edit: string;
    duplicate: (count: number) => string;
    download: (count: number) => string;
    delete: (count: number) => string;
    editTitle: (path: string) => string;
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
    downloadEntriesError: string;
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
    deleteCloudEntriesTitle: string;
    deleteCloudEntriesConfirm: string;
    deleteCloudEntriesMessage: (names: string[]) => string;
    duplicateCloudEntriesTitle: string;
    duplicateCloudEntriesConfirm: string;
    duplicateCloudEntriesMessage: (names: string[]) => string;
    importCloudFilesTitle: string;
    importCloudFilesConfirm: string;
    importCloudFilesMessage: (names: string[]) => string;
    downloadCloudEntriesTitle: string;
    downloadCloudEntriesConfirm: string;
    downloadCloudEntriesMessage: (names: string[]) => string;
    signOutCloudTitle: string;
    signOutCloudConfirm: string;
    signOutCloudMessage: string;
    discardCloudEditTitle: string;
    discardCloudEditConfirm: string;
    discardCloudEditMessage: (filename: string) => string;
    replaceImageTitle: string;
    replaceImageConfirm: string;
    replaceImageMessage: string;
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
      expandAll: string;
      collapseAll: string;
    };
    toc: Record<DocsSectionId, string>;
    demo: {
      tryIt: string;
      reset: string;
      noteSample: string;
      tableSample: string;
      listSample: string;
      tabSamples: {
        backup: { title: string; note: string };
        siteCheck: { title: string; note: string };
      };
      runbookSamples: string[];
      multiSelectNotes: string[];
      greetingTemplate: string;
      commitSubject: string;
      commitLengthCommand: string;
      projectName: string;
      reportFile: string;
      folderName: string;
      ticketTitle: string;
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
      items: string;
      persistence: string;
    };
    header: {
      intro: string;
      items: (exportLabel: string, collapseAllLabel: string) => string;
    };
    mainPanel: {
      intro: (newBlockLabel: string) => string;
      minimap: string;
    };
    tabs: {
      intro: string;
      items: (
        openSourceLabel: string,
        openPreviewLabel: string,
        openEditorLabel: string,
        closeLabel: string,
        closeOthersLabel: string,
        closeAllLabel: string,
      ) => string;
      variablesEditorNote: string;
      autoCreate: string;
      labelDemo: string;
      unresolvedMarker: string;
    };
    sidebar: {
      intro: string;
      items: string;
      resizeDetails: string;
    };
    runbookLibrary: {
      intro: (runbooksTitle: string) => string;
      items: (
        importLabel: string,
        clearLibraryLabel: string,
        runbookActionsLabel: string,
      ) => string;
      autoLabel: string;
      labelDetails: string;
      autoSave: string;
    };
    variables: {
      why: string;
      intro: string;
      usage: string;
      extract: (extractLabel: string) => string;
      unresolved: string;
      tooltip: string;
      split: string;
      demoHint: (variableActionsLabel: string) => string;
      constants: string;
      constantsDemoHint: string;
    };
    variableReferences: {
      intro: string;
      demoHint: string;
      shades: string;
      shadesDemoHint: string;
      shadesHover: string;
      circular: string;
    };
    parameterizedPlaceholders: {
      intro: string;
      fill: string;
      seeExample: string;
      multiple: string;
      nested: string;
      chained: string;
    };
    placeholderDefaults: {
      intro: string;
      override: string;
      shared: string;
    };
    variableSlicing: {
      intro: string;
      demoHint: string;
      howItWorks: string;
      positionsHint: string;
      step: string;
      math: string;
      invalid: string;
      python: string;
    };
    variableLen: {
      intro: string;
      demoHint: string;
      chaining: string;
    };
    variableCount: {
      intro: string;
      demoHint: string;
    };
    variableKey: {
      intro: string;
      demoHint: string;
      chaining: string;
    };
    variableCase: {
      intro: string;
      table: string;
      rebuild: string;
      demoHint: string;
      renameHint: (renameCaseLabel: string) => string;
    };
    variableStrip: {
      intro: string;
      table: string;
      demoHint: string;
      repeats: string;
      whitespace: string;
    };
    variableFill: {
      intro: string;
      table: string;
      demoHint: string;
      rules: string;
      computedHint: string;
    };
    variableReplace: {
      intro: string;
      demoHint: string;
      verbatim: string;
      remove: string;
      removeDemoHint: string;
    };
    transformedPlaceholders: {
      intro: string;
      demoHint: string;
    };
    unnamedReferences: {
      intro: string;
      demoHint: string;
      rule: string;
      anywhere: string;
    };
    variableDate: {
      intro: string;
      demoHint: string;
      format: string;
      table: string;
      formatDemoHint: (resetDemoLabel: string) => string;
      clock: string;
    };
    variableBoolean: {
      intro: string;
      table: string;
      matching: string;
      matchTable: string;
      demoHint: string;
      empty: string;
    };
    variableLogic: {
      table: string;
      compare: string;
      compareTable: string;
      demoHint: string;
      booleans: string;
    };
    variableConditional: {
      intro: string;
      table: string;
      demoHint: string;
    };
    multilineReferences: {
      intro: string;
    };
    escapingBraces: {
      intro: string;
      tryHint: string;
      scope: string;
    };
    secretVariables: {
      intro: (actionsLabel: string, maskLabel: string) => string;
      copyNote: string;
    };
    secretEncryption: {
      intro: string;
      passphrase: (createLabel: string) => string;
      covered: string;
      unlocking: string;
      changing: (changeLabel: string) => string;
      markdownWarning: string;
    };
    blocks: {
      intro: (blockActionsLabel: string) => string;
    };
    commandBlock: {
      intro: string;
      parts: string;
      multiline: string;
      editorFeatures: string;
      language: (languages: string) => string;
      longCommands: (showMoreLines: string) => string;
      variablesTeaser: string;
    };
    noteBlock: {
      intro: string;
      styles: (heading: string, subheading: string, body: string) => string;
      markdown: string;
      markdownTable: string;
      escapes: string;
      spellcheck: (spellcheckLabel: string) => string;
      tables: string;
      lists: string;
      noNesting: string;
      links: string;
      wrapKeys: string;
    };
    imageBlock: {
      intro: string;
      ways: (chooseLabel: string) => string;
      attachedVsLinked: (limit: string) => string;
      sizing: string;
      slideshow: string;
      demoHint: (
        viewFullscreen: string,
        download: string,
        replace: string,
        remove: string,
      ) => string;
    };
    dividerBlock: {
      intro: string;
      demoNote: string;
    };
    multiSelect: {
      intro: string;
      actions: string;
      clear: string;
      dragToTabDelay: string;
    };
    readMode: {
      intro: string;
      rules: string;
      persisted: string;
      exit: string;
    };
    export: {
      intro: (exportLabel: string) => string;
      formats: string;
      saveDialog: string;
      copyMarkdown: (copyMarkdownLabel: string) => string;
    };
    cloudExport: {
      intro: (exportLabel: string, importLabel: string) => string;
      switchProvider: string;
      overwrite: string;
    };
    cloudLinkedSync: {
      intro: string;
      syncBadge: (runbooksTitle: string) => string;
      stopSyncing: (stopSyncingLabel: string) => string;
    };
    cloudFileManagement: {
      folders: string;
      search: string;
      actions: (
        rename: string,
        edit: string,
        duplicate: string,
        download: string,
        deleteLabel: string,
      ) => string;
      multiSelect: string;
      bulkActions: string;
      editFile: string;
      recycleBin: string;
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
