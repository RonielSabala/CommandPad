import type { DocsSectionId } from "@/common/constants/docs";
import type { BlockType, NoteStyle } from "@/common/enums";
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

// The full translation catalog
export interface Messages {
  common: {
    cancel: string;
    close: string;
    ok: string;
    create: string;
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
  runbooks: {
    title: string;
    searchPlaceholder: string;
    empty: string;
    import: string;
    importTitle: string;
    paste: string;
    pasteTitle: string;
    removeFromLibrary: string;
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
    remove: string;
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
    duplicate: string;
    delete: string;
    emptyTitle: string;
    emptyHint: string;
  };
  command: {
    emptyPreview: string;
    showEditor: string;
    hideEditor: string;
    copy: string;
    placeholder: string;
  };
  note: {
    styleLabel: Record<NoteStyle, string>;
    stylePlaceholder: Record<NoteStyle, string>;
  };
  exportModal: {
    title: string;
    message: string;
  };
  pasteModal: {
    title: string;
    message: string;
    error: string;
  };
  alert: {
    invalidFormatTitle: string;
  };
  confirm: {
    defaultTitle: string;
  };
  dialogs: {
    overwriteTitle: string;
    overwriteConfirm: string;
    overwriteMessage: (filename: string, existingName: string) => string;
    importFailed: (count: number) => string;
    pastedRunbook: string;
    resetTitle: string;
    resetConfirm: string;
    resetMessage: string;
  };
  keybindings: Record<KeyBinding, string>;
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
    };
    gettingStarted: {
      intro: string;
      journey: string;
      outcomesLead: string;
      outcomes: string[];
    };
    workspace: {
      intro: string;
    };
    tabs: {
      intro: string;
      items: string[];
      labelDemo: string;
    };
    sidebar: {
      intro: string;
      items: string[];
    };
    runbookLibrary: {
      intro: string;
      items: string[];
      autoLabel: string;
      autoSave: string;
    };
    variables: {
      intro: string;
      usage: string;
    };
    variableReferences: {
      intro: string;
    };
    parameterizedPlaceholders: {
      intro: string;
      fill: string;
      unresolved: string;
    };
    escapingBraces: {
      intro: string;
      scope: string;
    };
    secretVariables: {
      intro: string;
    };
    blocks: {
      intro: string;
      tip: string;
    };
    commandBlock: {
      intro: string;
      preview: string;
      editor: string;
      multiline: string;
      gutterNote: string;
    };
    noteBlock: {
      intro: string;
      styles: string;
      markdown: string;
      tableSyntax: string;
      tableResult: string;
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
      demoHint: string;
    };
    readMode: {
      intro: string;
      rules: string[];
      exit: string;
    };
    export: {
      intro: string;
      formats: string[];
      saveDialog: string;
    };
    language: {
      intro: string;
      detection: string;
    };
    keyboardShortcuts: {
      intro: string;
    };
  };
}
