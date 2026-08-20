import { VaultConfig } from "@/common/config";
import { DocsSectionId } from "@/common/constants/docs";
import {
  BlockType,
  NoteStyle,
  PanelId,
  RunbookSyncStatus,
  VaultError,
  VaultField,
  VaultPrompt,
  VaultStatus,
} from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import { codeBulletList } from "../lists";
import { MessageSlot } from "../slots";
import type { Messages } from "../types";

const andMore = (count: number) => `_and ${count} more..._`;

export const en: Messages = {
  common: {
    loading: "Loading…",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    ok: "OK",
    create: "Create",
    save: "Save",
    dragToReorder: "Drag to reorder",
    clearSearch: "Clear search",
    noMatches: "No matches.",
    untitledTab: "Untitled",
    untitledRunbook: "Untitled runbook",
  },
  header: {
    reloadTitle: "Reload CommandPad",
    switchToEdit: "Switch to Edit mode",
    switchToRead: "Switch to Read mode",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
    collapseAll: "Collapse All",
    toggleEditorsTitle: "Expand/collapse all command editors",
    resetWorkspaceTitle: "Reset workspace",
    exportTitle: "Export runbook",
    export: "Export",
    changeLanguage: "Change language",
  },
  panel: {
    names: {
      [PanelId.SIDEBAR]: "sidebar",
      [PanelId.DOCS_TOC]: "navigation",
    },
    expand: (name) => `Expand ${name}`,
    collapse: (name) => `Collapse ${name}`,
    moveLeft: (name) => `Move ${name} to left`,
    moveRight: (name) => `Move ${name} to right`,
    doubleClickExpand: "Double-click to expand",
    dragResizeCollapse: "Drag to resize · double-click to collapse",
  },
  contextMenu: {
    copyMarkdown: "Copy runbook as Markdown",
    minimap: "Minimap",
    moveMinimapLeft: "Move minimap left",
    moveMinimapRight: "Move minimap right",
    spellcheck: "Spell check notes",
  },
  runbooks: {
    title: "RUNBOOKS",
    searchPlaceholder: "Search runbooks…",
    empty: "No runbooks imported.",
    import: "Import",
    importTitle: "Import runbook",
    paste: "Paste",
    pasteTitle: "Paste runbook JSON",
    actions: "Runbook actions",
    duplicate: "Duplicate runbook",
    removeFromLibrary: "Remove from library",
    dropToImport: "Drop runbooks to import",
    clearLibrary: "Delete All",
    clearLibraryTitle: "Delete all runbooks from the library",
    stopSyncing: "Stop syncing",
    syncStatus: {
      [RunbookSyncStatus.SYNCED]: (provider) => `Synced with ${provider}`,
      [RunbookSyncStatus.SYNCING]: (provider) => `Saving to ${provider}…`,
      [RunbookSyncStatus.SIGNED_OUT]: (provider) =>
        `Sign in to ${provider} to keep syncing`,
      [RunbookSyncStatus.ERROR]: (provider) =>
        `Could not save to ${provider} · click to retry`,
    },
    secretStatus: {
      [VaultStatus.UNLOCKED]:
        "Secrets are encrypted · click to change the passphrase",
      [VaultStatus.LOCKED]: "Secrets are locked · click to unlock them",
      [VaultStatus.ABSENT]:
        "Secrets are stored unencrypted · click to set a passphrase",
      [VaultStatus.UNSUPPORTED]:
        "This browser cannot encrypt secrets, so they are stored as written",
    },
  },
  variables: {
    title: "VARIABLES",
    searchPlaceholder: "Search variables…",
    empty: "No variables defined.",
    new: "New",
    newTitle: "New variable",
    keyPlaceholder: "key",
    valuePlaceholder: "value",
    reveal: "Reveal value",
    mask: "Mask value",
    actions: "Variable actions",
    duplicate: "Duplicate variable",
    renameCase: "Change key case",
    remove: "Remove variable",
    dragResizeSplit: "Drag to resize key and value · double-click to even out",
    unusedTitle: (key) => `${key} (unused)`,
  },
  tabs: {
    newTab: "New tab",
    closeTab: "Close tab",
  },
  source: {
    openSource: "Open source file",
    openPreview: "Open preview",
    invalid:
      "This is not valid runbook JSON, so the runbook is still on its last good version.",
  },
  blocks: {
    newBlockLabel: "NEW BLOCK",
    typeLabel: {
      [BlockType.COMMAND]: "Command",
      [BlockType.NOTE]: "Note",
      [BlockType.IMAGE]: "Image",
      [BlockType.DIVIDER]: "Divider",
    },
    typeTitle: (label) => `${label} block`,
    actions: "Block actions",
    insertAbove: "Insert block above",
    insertBelow: "Insert block below",
    duplicate: (count) =>
      count === 1 ? "Duplicate block" : "Duplicate blocks",
    delete: (count) => (count === 1 ? "Delete block" : "Delete blocks"),
    emptyTitle: "No blocks yet.",
    emptyHint: "Add a command or note below.",
  },
  command: {
    emptyPreview: "empty command",
    showEditor: "Show editor",
    hideEditor: "Hide editor",
    showMoreLines: "Show more lines",
    showFewerLines: "Show less",
    copy: "Copy command",
    placeholder: "ssh {USER}@{HOST}",
    extractVariable: "Extract into a variable",
  },
  note: {
    styleLabel: {
      [NoteStyle.HEADING]: "heading",
      [NoteStyle.SUBHEADING]: "subheading",
      [NoteStyle.BODY]: "body",
    },
    stylePlaceholder: {
      [NoteStyle.HEADING]: "Section heading...",
      [NoteStyle.SUBHEADING]: "Section subheading...",
      [NoteStyle.BODY]: "Section body...",
    },
    followLinkTooltip: (binding?: string) =>
      binding ? `Follow link (${binding})` : "Follow link",
  },
  image: {
    dropHint: "Drop an image here, or paste one",
    choose: "Choose an image",
    urlPlaceholder: "https://example.com/image.png",
    addUrl: "Add",
    viewFullscreen: "View full screen",
    previous: "Previous image",
    next: "Next image",
    position: (index, total) => `${index} / ${total}`,
    actions: "Image actions",
    replace: "Replace image",
    remove: "Remove image",
    emptyReadOnly: "No image",
    loadFailed: "This image could not be loaded.",
    notAnImage: "That file is not an image.",
    invalidUrl: "Enter an http or https image address.",
    readFailed: "That image could not be read.",
    tooLarge: (limit) => `Images have to be smaller than ${limit}.`,
  },
  exportModal: {
    title: "Export",
    cloudTitle: `Export to ${MessageSlot.PROVIDER}`,
    destinationLabel: "Destination",
    formatLabel: "Format",
    filenameLabel: "Filename",
    folderLabel: "Folder",
    changeFolder: "Change",
    chooseFolder: "Choose a folder to save into.",
    selectFolder: "Save here",
    confirm: "Export",
    savingTo: (provider) => `Saving to ${provider}…`,
    savedTo: (provider) => `Saved to ${provider}`,
    exportError: "Export failed. Please try again.",
    tryAgain: "Try again",
  },
  pasteModal: {
    title: "Paste Runbook",
    message: "Paste raw runbook JSON to create a new runbook.",
    error: "That doesn't look like valid runbook JSON.",
  },
  destinationModal: {
    title: "Import",
    message: "Choose where to import a runbook from.",
    local: "This Device",
  },
  vaultModal: {
    title: {
      [VaultPrompt.CREATE]: "Protect your secrets",
      [VaultPrompt.UNLOCK]: "Unlock your secrets",
      [VaultPrompt.CHANGE]: "Change your passphrase",
    },
    message: {
      [VaultPrompt.CREATE]: "Choose a passphrase for this runbook.",
      [VaultPrompt.UNLOCK]:
        "Enter this runbook's passphrase to decrypt its secret values.",
      [VaultPrompt.CHANGE]:
        "Every secret in this runbook is re-encrypted with the new passphrase.",
    },
    unlockFileMessage: (filename) =>
      `\`${filename}\` holds secrets encrypted with a different passphrase. Enter it to open them.`,
    submit: {
      [VaultPrompt.CREATE]: "Encrypt secrets",
      [VaultPrompt.UNLOCK]: "Unlock",
      [VaultPrompt.CHANGE]: "Change passphrase",
    },
    fieldLabel: {
      [VaultPrompt.CREATE]: {
        [VaultField.CURRENT]: "Passphrase",
        [VaultField.NEXT]: "Passphrase",
        [VaultField.CONFIRM]: "Repeat passphrase",
      },
      [VaultPrompt.UNLOCK]: {
        [VaultField.CURRENT]: "Passphrase",
        [VaultField.NEXT]: "Passphrase",
        [VaultField.CONFIRM]: "Repeat passphrase",
      },
      [VaultPrompt.CHANGE]: {
        [VaultField.CURRENT]: "Current passphrase",
        [VaultField.NEXT]: "New passphrase",
        [VaultField.CONFIRM]: "Repeat new passphrase",
      },
    },
    reveal: "Show passphrase",
    hide: "Hide passphrase",
    skip: "Not now",
    working: "Deriving key…",
    errors: {
      [VaultError.TOO_SHORT]: `Use at least ${VaultConfig.MIN_PASSPHRASE_LENGTH} characters.`,
      [VaultError.MISMATCH]: "The two passphrases do not match.",
      [VaultError.UNCHANGED]: "The new passphrase is the one you already use.",
      [VaultError.WRONG_PASSPHRASE]: "That passphrase did not work.",
    },
  },
  cloudModal: {
    importTitle: `Import from ${MessageSlot.PROVIDER}`,
    changeProvider: "Change provider",
    signInPrompt: (provider) =>
      `Sign in to ${provider} to browse and manage your runbooks there.`,
    signInOneDrive: "Sign in with Microsoft",
    signInGoogleDrive: "Sign in with Google",
    signOut: "Sign out",
    signedInAs: (account) => `Signed in as ${account}`,
    refresh: "Refresh",
    emptyFiles: "Nothing saved in this folder yet.",
    emptyFolders: "No folders in here yet.",
    columnName: "Name",
    columnModified: "Modified",
    columnSize: "Size",
    sortAscending: (column) => `Sort by ${column}, ascending`,
    sortDescending: (column) => `Sort by ${column}, descending`,
    searchFilesPlaceholder: "Search files and folders",
    searchFoldersPlaceholder: "Search folders",
    noResultsFiles: "No files or folders match your search.",
    noResultsFolders: "No folders match your search.",
    navigateBack: "Back",
    navigateForward: "Forward",
    openFolderAction: (name) => `Open ${name}`,
    newFolder: "New folder",
    folderNamePlaceholder: "Folder name",
    createFolder: "Create folder",
    cancelNewFolder: "Cancel new folder",
    importAction: (filename) => `Import ${filename}`,
    entryActions: "More actions",
    selectRow: (name) => `Select ${name}`,
    deselectRow: (name) => `Deselect ${name}`,
    selectAll: "Select all",
    deselectAll: "Deselect all",
    clearSelection: "Clear selection",
    importFiles: "Import files",
    rename: "Rename",
    edit: "Edit",
    duplicate: (count) =>
      count === 1 ? "Duplicate" : `Duplicate ${count} items`,
    download: (count) => (count === 1 ? "Download" : `Download ${count} items`),
    delete: (count) => (count === 1 ? "Delete" : `Delete ${count} items`),
    saveName: "Save name",
    cancelRename: "Cancel rename",
    namePlaceholder: "Filename",
    editTitle: (path) => `Editing \`${path}\``,
    editHint:
      "Changes are written straight back to the cloud file when you save.",
    signInError: "Sign-in failed. Please try again.",
    genericError: "Something went wrong. Please try again.",
    invalidFileError: "That file doesn't look like valid runbook JSON.",
    invalidJsonError: "That isn't valid JSON, so it can't be saved yet.",
    readError: "Could not open that file. Please try again.",
    saveError: "Could not save that file. Please try again.",
    renameError: "Could not rename that file. Please try again.",
    duplicateError: "Could not duplicate that file. Please try again.",
    downloadError: "Could not download that file. Please try again.",
    deleteError: "Could not delete that file. Please try again.",
    renameFolderError: "Could not rename that folder. Please try again.",
    duplicateFolderError: "Could not duplicate that folder. Please try again.",
    downloadFolderError: "Could not download that folder. Please try again.",
    deleteFolderError: "Could not delete that folder. Please try again.",
    downloadEntriesError:
      "Could not download the selected items. Please try again.",
    createFolderError: "Could not create that folder. Please try again.",
    nameTakenError: (filename) => `${filename} already exists in this folder.`,
  },
  alert: {
    defaultTitle: "Notice",
  },
  confirm: {
    defaultTitle: "Confirm",
  },
  dialogs: {
    overwriteTitle: "Overwrite Runbook",
    overwriteConfirm: "Overwrite",
    overwriteMessage: (filename, existingName) =>
      `\`${filename}\` matches a runbook you already have.\n\nImporting it **overwrites** \`${existingName}\`.`,
    overwriteCloudFileTitle: "Overwrite Cloud Runbook",
    overwriteCloudFileConfirm: "Overwrite",
    overwriteCloudFileMessage: (filename) =>
      `\`${filename}\` already exists in the selected folder.\n\nExporting replaces its contents, and **this cannot be undone**.`,
    importFailedTitle: "Invalid Format",
    importFailed: (count) =>
      count === 1
        ? "**1 file** could not be imported because its format isn't recognized."
        : `**${count} files** could not be imported because their formats aren't recognized.`,
    pastedRunbook: "Pasted runbook",
    resetTitle: "Reset Workspace",
    resetConfirm: "Reset",
    resetMessage:
      "Delete **every variable, block, runbook and preference**? This cannot be undone.",
    clearLibraryTitle: "Delete All Runbooks",
    clearLibraryConfirm: "Delete All",
    clearLibraryMessage:
      "Delete **every runbook** in the library? This cannot be undone.",
    deleteRunbookTitle: "Delete Runbook",
    deleteRunbookConfirm: "Delete",
    deleteRunbookMessage: (label) =>
      `Delete \`${label}\`? **This cannot be undone.**`,
    deleteCloudFileTitle: "Delete Cloud Runbook",
    deleteCloudFileConfirm: "Delete",
    deleteCloudFileMessage: (filename) =>
      `Delete \`${filename}\` from your cloud folder?\n\nYour provider keeps it in the _Recycle Bin_ for a while, so you can still restore it from there.`,
    deleteCloudFolderTitle: "Delete Cloud Folder",
    deleteCloudFolderConfirm: "Delete",
    deleteCloudFolderMessage: (name) =>
      `Delete the folder \`${name}\`?\n\nYour provider keeps deleted items in the _Recycle Bin_ for a while, so you can still restore them from there.`,
    deleteCloudEntriesTitle: "Delete Cloud Items",
    deleteCloudEntriesConfirm: "Delete",
    deleteCloudEntriesMessage: (names) =>
      `Delete these ${names.length} items from your cloud folder?\n${codeBulletList(names, andMore)}\n\nYour provider keeps deleted items in the _Recycle Bin_ for a while, so you can still restore them from there.`,
    duplicateCloudEntriesTitle: "Duplicate Cloud Items",
    duplicateCloudEntriesConfirm: "Duplicate",
    duplicateCloudEntriesMessage: (names) =>
      `Make a copy of these ${names.length} items in your cloud folder?\n${codeBulletList(names, andMore)}\n\nEach copy is added next to the original, and a folder is copied with everything inside it.`,
    importCloudFilesTitle: "Import Cloud Files",
    importCloudFilesConfirm: "Import",
    importCloudFilesMessage: (names) =>
      `Import these ${names.length} files into your library?\n${codeBulletList(names, andMore)}\n\nEach one is added as its own runbook and stays linked to its cloud file, so later edits are pushed back to it.`,
    downloadCloudEntriesTitle: "Download Cloud Items",
    downloadCloudEntriesConfirm: "Download",
    downloadCloudEntriesMessage: (names) =>
      `Download these ${names.length} items from your cloud folder?\n${codeBulletList(names, andMore)}\n\nThey are saved together as a single _.zip_ archive, and a folder is downloaded with everything inside it.`,
    signOutCloudTitle: "Sign Out",
    signOutCloudConfirm: "Sign Out",
    signOutCloudMessage:
      "Sign out of this account? Your runbooks **stay in the cloud**, and you can sign back in at any time.",
    discardCloudEditTitle: "Discard Changes",
    discardCloudEditConfirm: "Discard",
    discardCloudEditMessage: (filename) =>
      `Close the editor without saving? Your **unsaved changes** to \`${filename}\` will be lost.`,
    replaceImageTitle: "Replace Image",
    replaceImageConfirm: "Replace",
    replaceImageMessage:
      "This block already holds an image. Replacing it **discards the current one**.",
  },
  keybindings: {
    [KeyBinding.TOGGLE_MODE]: "Toggle read / edit mode",
    [KeyBinding.ESCAPE]: "Clear block selection / close modals",
    [KeyBinding.TOGGLE_SIDEBAR]: "Collapse / expand the side panel",
    [KeyBinding.MOVE_SIDEBAR]: "Move the side panel to left / right",
    [KeyBinding.NEW_TAB]: "Open a new tab",
    [KeyBinding.CLOSE_TAB]: "Close the active tab",
    [KeyBinding.FOCUS_RUNBOOK]: "Select active runbook",
    [KeyBinding.NAVIGATE_RUNBOOKS]:
      "Navigate runbooks with the active runbook selected",
    [KeyBinding.IMPORT_RUNBOOK]: "Open runbook import dialog",
    [KeyBinding.EXPORT]: "Open export dialog",
    [KeyBinding.DELETE_RUNBOOK]: "Delete the focused runbook from the library",
    [KeyBinding.CLEAR_LIBRARY]: "Open delete all runbooks dialog",
    [KeyBinding.TOGGLE_EDITORS]: "Toggle all command editors",
    [KeyBinding.MULTISELECT_BLOCKS]: "Multi-select blocks",
    [KeyBinding.DUPLICATE_BLOCK]: "Duplicate selected blocks",
    [KeyBinding.DELETE_BLOCK]: "Delete selected blocks",
    [KeyBinding.OPEN_LINK]: "Open note link in new tab",
    [KeyBinding.NOTE_BOLD]: "Bold selected text (note block)",
    [KeyBinding.NOTE_ITALIC]: "Italicize selected text (note block)",
    [KeyBinding.NOTE_CODE]: "Wrap selected text in backticks (note block)",
    [KeyBinding.WRAP_SELECTION]:
      "Wrap selected text in the typed pair (any text field)",
    [KeyBinding.SUBMIT_EDITOR]: "Save / create from a code editor",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
  },
  home: {
    meta: {
      openApp: "Open app",
    },
    hero: {
      eyebrow: "Variable-aware command runbooks",
      title: "Write commands once. Reuse them everywhere.",
      subtitle:
        "Define your variables a single time, reference them across every command, and copy fully-resolved commands in one click. No server, no accounts, everything stays in your browser.",
      primaryCta: "Open CommandPad",
      secondaryCta: "Read the docs",
    },
    demo: {
      title: "See it in action",
      hint: "Change a value below and watch every command update live.",
    },
    features: {
      title: "Why you'll keep it around",
      subtitle: "A small tool for an everyday annoyance.",
      items: [
        {
          title: "Change it once",
          body: "Update a host or a version in one place. Every command that mentions it follows.",
        },
        {
          title: "Copy and run",
          body: "Every `{VARIABLE}` resolves as you type, so what you copy is the real command.",
        },
        {
          title: "Reads like a guide",
          body: "Markdown notes and dividers between commands, so a runbook still makes sense months later.",
        },
        {
          title: "Stays on your machine",
          body: "No backend, no account, no analytics. Everything lives in your browser.",
        },
        {
          title: "Out of your way",
          body: "Tabs, drag to reorder, read mode, shortcuts, light and dark. Small comforts that just work.",
        },
        {
          title: "Yours to take",
          body: "Export to JSON, Markdown, or plain text, and load it back anywhere.",
        },
      ],
    },
    closing: {
      title: "Ready to build your first runbook?",
      body: "CommandPad runs entirely in your browser. Nothing to install, nothing to sign up for.",
      cta: "Open CommandPad",
    },
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: August 2, 2026",
    intro:
      "CommandPad is a client-side application that runs entirely in your web browser. This policy explains what data the app handles and, more importantly, what it does not.",
    sections: [
      {
        heading: "The short version",
        paragraphs: [
          "CommandPad has no backend server, no user accounts, and no analytics or tracking. The app does not collect, transmit, or sell any of your data. Everything you create stays on your device, unless you choose to sync a runbook to your own OneDrive or Google Drive account.",
        ],
      },
      {
        heading: "What data we store",
        paragraphs: [
          "All data you enter, such as variables, commands, notes, and runbooks, is saved locally in your browser so your work is still there when you return.",
        ],
        bullets: `* **localStorage** holds your preferences (theme, language, layout) and lightweight tab metadata.
* **IndexedDB** holds the actual runbook content (your variables and command blocks).`,
      },
      {
        heading: "Images",
        paragraphs: [
          "An image block holds a picture in one of two ways, and neither one uploads anything. **There is no image server, no upload endpoint, and no image host operated by us.**",
        ],
        bullets: `* An **attached** image (dropped, pasted, or chosen with the file picker) is read by your browser on your own device and stored as text inside the runbook, next to the rest of its content. The file is never sent anywhere.
* A **linked** image is only an address you typed. Nothing is stored and nothing is uploaded, but your browser fetches the picture from whatever site hosts it, so that site sees the request just as it would for any page showing the image.
* If you sync a runbook to your own cloud account, its attached images travel with it into that account, the same as any other part of the runbook.`,
      },
      {
        heading: "What we do not do",
        paragraphs: [
          "We want to be explicit about the things CommandPad deliberately avoids.",
        ],
        bullets: `* We do not operate a backend server that receives your data. The only time your runbooks leave your device is when you explicitly export or sync them to your own cloud account.
* We do not use cookies, advertising identifiers, or third-party analytics.
* We do not track your behavior across sites or build a profile about you.
* We do not require a CommandPad account, an email address, or any sign-in to use the app.`,
      },
      {
        heading: "Cloud sync (optional)",
        paragraphs: [
          "CommandPad can optionally export a runbook to, or import one from, your own OneDrive or Google Drive account. This feature is off until you choose to use it.",
        ],
        bullets: `* You sign in through the provider's own sign-in flow (Microsoft or Google). CommandPad never sees your password, and it only requests access to the dedicated **CommandPad** folder it creates for your runbooks.
* Synced runbooks are stored in that folder inside your own account. They are not sent to, or stored on, any server operated by us.
* The data you sync travels between your browser and the provider you chose. Once it reaches that provider, their privacy policy and terms apply to it.
* You can sign out at any time, and you can delete synced files directly from your cloud account.`,
      },
      {
        heading: "Secret variables",
        paragraphs: [
          "Marking a variable secret always masks it in the interface. Encrypting the value at rest is a separate, optional step: set a passphrase for a runbook and its secret values are encrypted in local storage, in JSON exports, and in synced cloud copies. Without a passphrase, a secret value is still stored in plain text, and the passphrase itself is never stored, so a lost one cannot be recovered.",
        ],
      },
      {
        heading: "External links",
        paragraphs: [
          "Notes may contain links you add yourself, and the app links to external sites such as GitHub and LinkedIn. Once you follow a link, the privacy practices of that destination apply. This policy only covers CommandPad itself.",
        ],
      },
      {
        heading: "Controlling your data",
        paragraphs: [
          "Because everything is local, you are always in control. Use **Export** to back up a runbook as JSON, and use **Reset Workspace** to permanently erase all locally stored data. Clearing your browser's site data for this app has the same effect.",
        ],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          "If this policy changes, the updated date at the top of the page will change with it. Continued use of the app reflects your acceptance of the current policy.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "Last updated: August 2, 2026",
    intro:
      "These terms govern your use of CommandPad. By using the app you agree to them. Please read them, as they are short and written to be understandable.",
    sections: [
      {
        heading: "Acceptance of terms",
        paragraphs: [
          "By accessing or using CommandPad, you agree to be bound by these terms. If you do not agree, please do not use the app.",
        ],
      },
      {
        heading: "The service",
        paragraphs: [
          "CommandPad is a free, client-side tool for building variable-aware command runbooks. It runs in your browser and stores your work locally on your device. It can optionally connect to your own OneDrive or Google Drive account to export and import runbooks, entirely at your discretion. It is provided as-is, and features may change or be removed over time.",
        ],
      },
      {
        heading: "Your responsibilities",
        paragraphs: [
          "You are responsible for the commands and content you create and for how you use them.",
        ],
        bullets: `* Review every command before you run it. CommandPad resolves and copies text; it does not execute anything for you.
* Keep your own backups of anything important by exporting your runbooks.
* Only attach images you have the right to use. An attached image becomes part of the runbook itself, so it goes wherever you export or sync that runbook.
* Secret variables mask values on screen and can be encrypted at rest with a passphrase; they are not a substitute for a dedicated secrets manager.
* Use the app in compliance with the laws and policies that apply to you.`,
      },
      {
        heading: "No warranty",
        paragraphs: [
          "CommandPad is provided **without warranties of any kind**, express or implied, including fitness for a particular purpose. We do not guarantee that the app will be uninterrupted, error-free, or that locally stored data will never be lost.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, the author is not liable for any damages arising from your use of the app, including the loss of data or any consequences of running commands you assembled with it.",
        ],
      },
      {
        heading: "Third-party cloud services",
        paragraphs: [
          "If you choose to sync runbooks with OneDrive or Google Drive, you do so through your own account with Microsoft or Google. Your use of those services is governed by their terms and privacy policies, not ours.",
        ],
        bullets: `* CommandPad only accesses the dedicated folder it creates for your runbooks; it does not read the rest of your cloud storage.
* We are not responsible for the availability, behavior, or data handling of Microsoft, Google, or any other third-party provider.
* You are responsible for keeping your cloud account secure and for any content you store there.`,
      },
      {
        heading: "Data and privacy",
        paragraphs: [
          "CommandPad stores your data locally and does not transmit it, except when you explicitly sync a runbook to your own cloud account. Images you attach are no exception: they are read in your browser and kept inside the runbook, and are never uploaded to any server operated by us. For details, see the Privacy Policy, which is incorporated into these terms by reference.",
        ],
      },
      {
        heading: "Changes to these terms",
        paragraphs: [
          "These terms may be updated from time to time. The updated date at the top reflects the latest revision, and continued use of the app constitutes acceptance of the current terms.",
        ],
      },
    ],
  },
  docs: {
    meta: {
      title: "Documentation",
      openDocs: "Open documentation",
      backToApp: "Back to app",
      tocTitle: "Contents",
      expandAll: "Expand all sections",
      collapseAll: "Collapse all sections",
    },
    toc: {
      [DocsSectionId.GETTING_STARTED]: "Getting started",
      [DocsSectionId.WORKSPACE]: "Workspace",
      [DocsSectionId.HEADER]: "Header",
      [DocsSectionId.TABS]: "Tabs",
      [DocsSectionId.SIDEBAR]: "Sidebar",
      [DocsSectionId.MAIN_PANEL]: "Main panel",
      [DocsSectionId.RUNBOOK_LIBRARY]: "Runbook library",
      [DocsSectionId.VARIABLES]: "Variables",
      [DocsSectionId.VARIABLE_REFERENCES]: "Variable references",
      [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]: "Parameterized placeholders",
      [DocsSectionId.VARIABLE_SLICING]: "Slicing values",
      [DocsSectionId.VARIABLE_COUNT]: "Counting characters",
      [DocsSectionId.VARIABLE_KEY]: "Using the variable name",
      [DocsSectionId.VARIABLE_CASE]: "Changing case",
      [DocsSectionId.VARIABLE_STRIP]: "Trimming ends",
      [DocsSectionId.UNNAMED_REFERENCES]: "References with no variable",
      [DocsSectionId.VARIABLE_DATE]: "Current date",
      [DocsSectionId.MULTILINE_REFERENCES]: "Long references",
      [DocsSectionId.ESCAPING_BRACES]: "Escaping braces",
      [DocsSectionId.SECRET_VARIABLES]: "Secret variables",
      [DocsSectionId.SECRET_ENCRYPTION]: "Encrypting secrets",
      [DocsSectionId.BLOCKS]: "Blocks",
      [DocsSectionId.COMMAND_BLOCK]: "Command block",
      [DocsSectionId.NOTE_BLOCK]: "Note block",
      [DocsSectionId.IMAGE_BLOCK]: "Image block",
      [DocsSectionId.DIVIDER_BLOCK]: "Divider block",
      [DocsSectionId.MULTI_SELECT]: "Multi-select",
      [DocsSectionId.READ_MODE]: "Read mode",
      [DocsSectionId.EXPORT]: "Export",
      [DocsSectionId.CLOUD_EXPORT]: "Cloud export & import",
      [DocsSectionId.CLOUD_LINKED_SYNC]: "Keeping a runbook in sync",
      [DocsSectionId.CLOUD_FILE_MANAGEMENT]: "Managing cloud files",
      [DocsSectionId.LANGUAGE]: "Language",
      [DocsSectionId.KEYBOARD_SHORTCUTS]: "Keyboard shortcuts",
      [DocsSectionId.QA]: "Q&A",
    },
    demo: {
      tryIt: "Try it",
      reset: "Reset demo",
      tabSamples: {
        backup: {
          title: "Backup checklist",
          note: "Run this before you shut down for the day.",
        },
        siteCheck: {
          title: "Website check",
          note: "Run this whenever the site feels slow.",
        },
      },
      runbookSamples: ["Release checklist", "Postgres backup", "K8s debugging"],
      multiSelectNotes: ["Create the backup", "Clean up"],
      greetingTemplate: "Hi {;name}, welcome to {;place}!",
      commitSubject: "Fix retry backoff on failed uploads",
      commitLengthCommand: 'echo "{message|count} of 50 characters used"',
      projectName: "monthly SALES report",
      reportFile: "monthly-sales.pdf",
      folderName: "   Sales Reports   ",
      noteSample:
        "Click this note to see its raw text: it mixes **bold**, _italic_, `code`, and a link: https://example.com. Click away to see it rendered again.",
      tableSample: `| Exit code | Meaning | Action |
| :---: | --- | --- |
| 126 | Permission denied | \`chmod +x\` the script |
| 127 | Command not found | Check your \`PATH\` |
| 137 | Killed (out of memory) | **Raise the memory limit** |`,
      listSample: `Before you start:
* Close any other copies of the file
* Save a backup, just in case

If something goes wrong, undo it in this order:
1. Stop what you're doing
2. Put the backup back
    1. Copy it over the original
    2. Open it to make sure it looks right
3. Let your team know what happened`,
    },
    gettingStarted: {
      intro:
        "Welcome to CommandPad! Here you'll build **runbooks**: documents that mix the commands you run often with the notes that help explain them.",
      why: "You know the ritual: scrolling through shell history, digging through old chat messages, or keeping a `commands.txt` somewhere on your computer. A runbook ends that. Each command lives next to the note that explains it, with the changing parts filled in for you, ready to copy.",
      journey:
        "This guide walks you through how the app works, one piece at a time, so you can get the most out of it. You'll start with the block types your runbooks are built from, then variables, the feature that makes command blocks truly powerful, and finally the workspace itself: the sidebar, tabs, and everything around your runbooks.",
      navigate:
        "Read it start to finish, or jump straight to whatever interests you from the contents panel beside the article: you set the pace. Clicking an entry there takes you to its section and folds it away, and its heading in the article does the same, so you can collapse what you have already read and keep the rest in view.",
      tryIt:
        "Most sections come with a real, working example marked **Try it**: a piece of the app you're free to mess with, since nothing you do there touches your actual workspace. Go ahead and poke at it, that's the fastest way to get a feel for how something works. If you ever get lost, the arrow button in its corner brings it back to where it started.",
    },
    workspace: {
      intro:
        "The workspace is the app's main screen, where you'll spend most of your time building and polishing your runbooks. It's made of three areas:",
      items: `* The **header**: gathers the buttons with the app's global actions.
* The **sidebar**: holds the runbook library and the variables panel.
* The **main panel**: where every runbook you have open lives, its blocks included.`,
      persistence:
        "Everything you do is saved automatically in your browser and restored when you reload the page. Your data is never sent to a server.",
    },
    header: {
      intro:
        "The header gathers the actions that affect the whole app. From left to right:",
      items: (
        exportLabel,
        collapseAllLabel,
      ) => `* The **CommandPad logo**: click it to reload the app.
* The **padlock / pencil**: switches between read mode and edit mode. It has its own section later in this guide.
* **${collapseAllLabel}**: collapses or expands every command editor in the active runbook at once.
* The **sun / moon**: switches between the light and dark themes.
* The **language selector**: changes the interface language.
* The **book**: opens this documentation.
* The **red arrow**: resets the workspace. It wipes everything, so the app always asks you to confirm first.
* **${exportLabel}**: saves the active runbook to a file. It also has its own section later.`,
    },
    mainPanel: {
      intro: (newBlockLabel) =>
        `The main panel is your workbench. At the top sits the **tabs bar** with your open runbooks; below it, the blocks of the active runbook; and at the end, the **${newBlockLabel}** row to keep adding content.`,
      minimap:
        "On the right edge lives the **minimap**: a miniature of the real runbook blocks that replaces the scrollbar. Click or drag on it to jump anywhere in a runbook. **Right-click** anywhere in the runbook content to open a small menu where you can turn it on or off, or move it to the other side.",
    },
    tabs: {
      intro: "Each tab holds one open runbook.",
      items: `* **Click** a tab to switch to it.
* **Drag** a tab to reorder it.
* **Middle-click** a tab to close it.
* **Click** the **+** at the end of the tabs bar to open a new tab.`,
      autoCreate:
        "If no tabs are open and you add a block or a variable, a new untitled tab is created automatically.",
      labelDemo:
        "A tab takes its name from the first note block of its runbook. Watch it live below: the note belongs to the active tab, and editing it renames the tab as you type. Try it all here: add a tab with the **+**, drag them around, switch between them, and close one.",
      sourceView: (openSourceLabel, openPreviewLabel) =>
        `A runbook is JSON underneath, and the button at the far end of the tabs bar shows you that JSON instead of the blocks: **${openSourceLabel}** swaps the panel for an editor holding the whole runbook, and **${openPreviewLabel}** brings the blocks back. Each tab below carries its own commands and variables, so open the source on one and then on another to see what a runbook really is.`,
      sourceEdits:
        "Edits land as you type: every keystroke that leaves valid JSON behind is applied to the runbook straight away, so the blocks are already up to date by the time you switch back. Text that does not parse yet is never thrown away, it simply is not applied, and the runbook stays on its last good version until the JSON is whole again.",
    },
    sidebar: {
      intro: "The sidebar holds the runbook library and the variables panel.",
      items: `* **Collapse / expand**: click the chevron button or use its keyboard shortcut.
* **Move left / right**: click the layout button to move the sidebar to the other side of the screen.
* **Resize**: drag the sidebar's inner edge; double-click it to collapse.`,
      resizeDetails:
        "Dragging the sidebar very narrow collapses it completely, and it can never grow wider than half of the screen. Double-clicking the edge of a sidebar you have widened snaps it back to its normal width. Expanding a collapsed sidebar also restores that normal width.",
    },
    runbookLibrary: {
      intro: (runbooksTitle) =>
        `The sidebar's **${runbooksTitle}** section holds your imported runbooks.`,
      items: (
        importLabel,
        clearLibraryLabel,
        runbookActionsLabel,
      ) => `* Click **${importLabel}** to load one or more \`.json\` files at once, or **Paste** to create a runbook from raw JSON.
* You can also **drag files** from your file explorer and drop them onto the section to import them.
* Click any runbook to open it. If it's already open in a tab, that tab becomes active.
* Open the **${runbookActionsLabel}** menu shown on row hover to duplicate a runbook or remove it from the library.
* Click **${clearLibraryLabel}** to empty the whole library at once.
* Drag the handle on the left of a runbook to reorder it in the list.
* Use the **search bar** to filter runbooks by label or filename.`,
      autoLabel:
        "**Auto-labelling:** if a runbook's first block is a note, its text is used as the library label. Otherwise the imported filename is used as the fallback.",
      labelDetails:
        "Labels are normalized: markdown formatting is stripped and they are trimmed to 60 characters.",
      autoSave:
        "Edits made to the active runbook are automatically saved back to the library.",
    },
    variables: {
      why: "This is the feature everything else has been building toward. A server name, a file path, a version number: the same little values repeat over and over in the commands you use, and the day one changes, you get to fix it in every single command. With variables you write that value **once**, and every command updates on its own.",
      intro:
        "Each variable has a **key** and a **value**. Keys are case-sensitive. If two variables share the same key, the one defined last wins.",
      usage:
        "Use a variable in any command by wrapping its key in curly braces, e.g. `{KEY}`. Renaming a key updates every command that uses it, and variables no command uses are dimmed so you can spot the ones you no longer need.",
      extract: (extractLabel) =>
        `You do not have to write a variable out by hand. Select any piece of a command in its editor, then right-click it (or press \`Ctrl+.\`) and pick **${extractLabel}**: the selected text becomes a new variable, and the command keeps a reference to it in its place. Its guessed name is selected right there in the editor, so just type over it to rename it. Try it on the demo above.`,
      unresolved:
        "If a command references a key that does not exist, or a variable with an empty value, that part is highlighted as **unresolved**.",
      tooltip:
        "If a key or value is too long to fit its box, hover over it to see the full text in a tooltip.",
      split:
        "Keys and values split the row evenly, but you can change that: drag the divider between them to give one side more room, and double-click it to go back to an even split. The new balance applies to every variable and is remembered between sessions.",
      demoHint: (variableActionsLabel) =>
        `See it for yourself below: one variable feeds two commands. Edit its value and watch both previews follow along as you type. Hover over a row to reveal its controls: a drag handle on the left to reorder it among the others, and a **${variableActionsLabel}** menu on the right to duplicate or remove it.`,
      constants:
        "Not every variable changes for the same reason. Some are values you swap all the time, and some are **constants**: they stay the same for the whole life of the runbook, and they are only variables because the same value shows up in command after command. CommandPad tells them apart by naming convention: a key written entirely in **capitals** is treated as a _constant_, and any key with a **lowercase** letter in it is treated as a _variable_.",
      constantsDemoHint:
        "The convention is purely a naming one: constants resolve, get referenced and get renamed exactly like any other variable. Rename a key below from capitals to lowercase and back to see the color follow along.",
    },
    variableReferences: {
      intro:
        "A variable's value can reference other variables. That way you can build values out of smaller pieces.",
      demoHint:
        "Below, `BASE_URL` is built from `HOST`. Change `HOST` and watch the change ripple through to the command:",
      circular:
        "Circular references are safe: if two variables reference each other, the app detects the loop and leaves the reference as plain text.",
    },
    parameterizedPlaceholders: {
      intro:
        "Sometimes a variable is almost right for every command, except for one small part that changes each time. Parameterized placeholders let you leave that part blank in the variable, then fill it in differently wherever you use it.",
      fill: "Mark the blank with `{;param}` inside the variable's value. It works like a fill-in-the-blank sentence: the variable holds the fixed wording, and you drop in the missing word each time you use it. Wherever you reference that variable, fill the blank with `{key;param=param_value}`, and your value lands right where the blank sat.",
      seeExample:
        "If that sounds abstract, don't worry: it clicks the moment you see it. Take a look at the example below before reading on.",
      multiple:
        "A value can have several blanks. Give each one a different name, then fill them all in the same command, separated by semicolons:",
      nested:
        "A blank can even be filled with another variable. That way the same value can fill a blank in one command and be used on its own in another:",
    },
    variableSlicing: {
      intro:
        "A variable holds one value, but a command does not always need all of it. For example, a commit hash is forty characters long when you check it out and seven when it goes in a tag. Slicing lets you keep **one** variable and take just the part you need.",
      demoHint:
        "The first command below uses the whole hash. The second takes only its first seven characters. Edit the variable and both stay in step:",
      howItWorks:
        "Write a `|` after the key, then `slice(...)` with the piece you want, its numbers separated by semicolons. Counting starts at zero, and the second number marks where to **stop without including it**: `slice(;7)` is the first seven characters, and `slice(2;5)` is characters two, three, and four. Leave either number out to run from the very start, or all the way to the end.",
      positionsHint:
        "Negative numbers count back from the end, so `slice(-2;)` is the last two characters. A date shows the three forms side by side:",
      step: "A third number is the **step**: how many positions the slice skips between one character and the next. `slice(;;2)` takes one character out of every two and skips the rest, and a negative step walks backwards, so `slice(;;-1)` on its own reverses a value:",
      math: "Each number can also be a small sum: write `+` or `-` between whole numbers and they are worked out left to right.",
      invalid:
        "If a slice does not make sense, such as a step of zero, the whole reference stays **unresolved** and shows up exactly as you typed it, so the mistake is easy to spot. Asking for more characters than there are is fine, though: you simply get the ones that exist.",
      python:
        "The way the numbers work comes from Python, if you are curious to read more about it: [string slicing in Python](https://www.geeksforgeeks.org/python/string-slicing-in-python/). You do not need to know Python to use it here.",
    },
    variableCount: {
      intro:
        "Write `count` after the `|` and you get **how many characters the value takes up**.",
      demoHint:
        "For example, a commit subject is supposed to stay under 50 characters, but nobody counts them by hand. Type into the message below and watch the number keep up:",
      chaining:
        "Operations run left to right, so you can put `count` after a slice: `{commit|slice(;7)|count}` shortens the commit first, then counts what is left.",
    },
    variableKey: {
      intro:
        "Sometimes a command needs to say a variable's name as well as use its value. Write `key` after the `|` and you get **the name you gave the variable**, instead of what it holds.",
      demoHint:
        "Try renaming the variable below and watch the command update itself, the name and the value never fall out of sync:",
      chaining:
        "It ignores the value entirely, so nothing the variable holds can change what you get back.",
    },
    variableCase: {
      intro:
        "Write a case keyword after the `|` and the value is respelled on its way into the command. Each result below is written in the case it names:",
      table: `| Operation | Result |
| --- | --- |
| \`snakecase\` | words\\_joined\\_by\\_underscores |
| \`kebabcase\` | words-joined-by-dashes |
| \`camelcase\` | wordsJoinedByCapitals |
| \`pascalcase\` | TheSameStartingWithACapital |
| \`capitalize\` | Only the first letter of the value |
| \`title\` | The First Letter Of Every Word |
| \`uppercase\` | EVERY LETTER IN CAPITALS |
| \`lowercase\` | no capital letters at all |
| \`swapcase\` | eVERY LETTER THE OTHER WAY ROUND |`,
      rebuild:
        "The first four **rebuild** the value out of its words, so spaces disappear. The rest only change letters.",
      demoHint:
        "For example, a folder name is better off without spaces; a title reads better with them. See the same value below, both ways:",
      renameHint: (renameCaseLabel) =>
        `These same conversions rename a variable's key, too: open a variable's actions menu and pick **${renameCaseLabel}** to rewrite the key; every command referencing it updates along with it.`,
    },
    variableStrip: {
      intro:
        "The `strip(value)` operation removes the text passed in parentheses from both ends of a value; `lstrip` removes it from the front only, and `rstrip` from the back only. Below, each one against a value padded with dashes:",
      table: `| Operation | Result |
| --- | --- |
| \`lstrip(-)\` | no dashes at the front--- |
| \`rstrip(-)\` | ---no dashes at the back |
| \`strip(-)\` | no dashes at either end |`,
      demoHint:
        "Below is an address copied from the browser bar and a file that already has its extension. Edit either and the commands keep up:",
      repeats:
        "The text is removed as many times as it appears, and it is matched **whole**: `rstrip(ing)` never takes a stray `g`.",
      whitespace:
        "By default, `strip` operations written without parentheses remove whitespace:",
    },
    unnamedReferences: {
      intro:
        "A reference does not have to name a variable. Leave the name out, write only operations after the `|`, and the reference starts from an empty value: what you get back is whatever the operations make of it.",
      demoHint:
        "`{|count}` below has no variable behind it, so there is nothing to count; it always resolves to `0`:",
      rule: "The braces have to hold at least one operation. Empty braces are left exactly as they are, so a command that writes `{}` itself keeps them.",
      anywhere:
        "On its own that is not much use, but the next operation turns this exact trick into something worth reaching for.",
    },
    variableDate: {
      intro:
        "Write `date` after the `|` and you get **the current date**, spelled `YYYY-MM-DD`. It replaces whatever it is handed, so it is normally written on its own.",
      demoHint: "That is all it takes to put today's date in a name:",
      format:
        "Put a format in the parentheses to write the date some other way. Each placeholder below is filled in, and everything else is kept exactly as you typed it, so the separators are yours:",
      table: `| Placeholder | Meaning |
| --- | --- |
| \`YYYY\` | Four-digit year |
| \`YY\` | Last two digits of the year |
| \`MM\` | Month, 01 to 12 |
| \`DD\` | Day of the month, 01 to 31 |
| \`HH\` | Hour, 00 to 23 |
| \`mm\` | Minutes, 00 to 59 |
| \`ss\` | Seconds, 00 to 59 |`,
      formatDemoHint: (resetDemoLabel) =>
        `The date is read the moment the command is shown, not when it was written. Press **${resetDemoLabel}** below a couple of times and watch the seconds move:`,
      clock:
        "It reads your own clock, in your own time zone, so a runbook left open overnight copies tomorrow's date tomorrow.",
    },
    multilineReferences: {
      intro:
        "References often get too long to read on a single line. You can spread them over as many lines as you like instead: the spaces and line breaks around each part are ignored, so the layout is yours to choose.",
    },
    escapingBraces: {
      intro:
        "Prefix a reference with a backslash (`\\`) in a command block to output it literally instead of resolving it.",
      tryHint:
        "Try deleting the backslash in the command below and watch the literal braces turn into an active reference:",
      scope: "Escaping only applies inside command blocks.",
    },
    secretVariables: {
      intro: (actionsLabel, maskLabel) =>
        `Open a variable's **${actionsLabel}** menu and choose **${maskLabel}** to mark it as **secret**. An **eye icon** then appears on the row you can click to reveal it again.`,
      copyNote:
        "The mask is purely visual: the **Copy** button always puts the **real** value on your clipboard, so your commands keep working. Try it below, and click the eye icon to reveal the value.",
    },
    secretEncryption: {
      intro:
        "Masking hides a value on screen. Encryption protects it wherever it's stored: on disk, in an exported `.json`, in a linked cloud file. Each runbook has its own passphrase; unlocking one says nothing about another.",
      passphrase: (createLabel) =>
        `Mark your first secret and CommandPad asks for a passphrase via **${createLabel}**. It never leaves your device or gets stored: CommandPad turns it into a key, uses that key for the session, then forgets both when you close the tab. Lose it and there's no recovering it, so declining just leaves the value plaintext, like before.`,
      covered:
        "Only secret values are encrypted; everything else stays plain text, so an exported runbook is still readable and diffable. On disk a secret looks like `cpv1.<salt>.<iv>.<ciphertext>`: a label plus everything needed to decrypt it except your passphrase, which is why the file opens on any machine that has it.",
      unlocking:
        "Reopening the tab locks every runbook again, but only the one in front of you asks to unlock; the rest wait until you open them. A shield by a runbook's name shows its state: green and closed when unlocked, plain when locked, crossed out when nothing protects it. Click it to unlock, or to set a passphrase.",
      changing: (changeLabel) =>
        `Click an unlocked shield to open **${changeLabel}**: enter the current passphrase, then the new one twice. Every secret in that runbook, including its copy in a linked cloud file, is re-encrypted on the spot. Other runbooks and past exports keep the old passphrase.`,
      markdownWarning:
        "Markdown and plain-text exports skip encryption: their whole point is the resolved command, secrets included. Export JSON for anything leaving your hands.",
    },
    blocks: {
      intro: (blockActionsLabel) =>
        `Blocks are the main content of a runbook. Hover over any block to reveal its controls: grab the handle on the left to drag it into a new spot, or open the **${blockActionsLabel}** menu on the right to insert a new block above or below it, duplicate it, or delete it. Every block has a minimum width that keeps it from shrinking into something unreadable.`,
    },
    commandBlock: {
      intro:
        "It's a block that holds a command you want to keep at hand. It has two parts:",
      parts: `* **Preview** (always visible): the command exactly as it will be copied. Click its **Copy** button to send it to your clipboard. This button is disabled if the command is empty.
* **Editor** (collapsible): where you write the command. Use the chevron button to hide it when you only need the preview.`,
      multiline:
        "Commands can span several lines, and the editor can scroll sideways when a line gets very long. The left margin marks the first line with `$` and numbers the rest.",
      editorFeatures:
        "The editor is a full code editor. `Ctrl+F` finds text, `Alt+Up` and `Alt+Down` move a line, `Ctrl+Shift+K` deletes one, `Alt+Click` adds another cursor, etc.",
      longCommands: (showMoreLines) =>
        `A very long command does not stretch the block forever. Once a part passes its height limit it stops there and fades out, with a **${showMoreLines}** control underneath. Click it to reveal the rest, and click it again to fold it back. The preview and the editor are capped separately, so you can open one without opening the other.`,
      variablesTeaser:
        "Command blocks become far more useful with **variables**, which fill in the parts of a command that change. They are explained a little further ahead, in their own section.",
    },
    noteBlock: {
      intro:
        "It's a free-form text block. Notes grow wider and taller as you type.",
      styles: (heading, subheading, body) =>
        `Three text styles are selectable on hover: **${heading}** (large, bold), **${subheading}** (medium, accented), and **${body}** (the default prose).`,
      markdown: "Notes support markdown formatting:",
      markdownTable: `| Syntax | Result |
| --- | --- |
| \\**bold-text\\** | **bold-text** |
| \\_italic-text\\_ | _italic-text_ |
| \\\`code-text\\\` | \`code-text\` |
| \\[labelled-link](\\https://example.com) | [labelled-link](https://example.com) |`,
      escapes:
        "Put a backslash (`\\`) in front of a markdown mark to show it literally instead of applying it: typing `\\**text\\**` leaves the asterisks visible instead of making the text bold. Escape both ends of the mark, one at a time, and note that nothing is escaped inside `code`, where the backslash is already part of the content.",
      spellcheck: (spellcheckLabel) =>
        `Notes can be spell checked as you write them. **Right-click** anywhere in the runbook content and toggle **${spellcheckLabel}** in the menu.`,
      tables:
        "Notes also support [GitHub-flavored markdown tables](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables): cells separated by `|` bars, with a row of dashes under the header. Click the note below to see the raw syntax.",
      lists:
        "Lists work the same way: start a line with `*` or `-` for a bullet, or with a number and a dot for a numbered step. Indent a line to nest it under the item above it. Every item is one line long, so the list ends at the first line that does not start with a marker.",
      noNesting:
        "Styles do not combine: for example, bold and italics cannot be mixed on the same words. Whichever style starts first wins.",
      links:
        "Bare URLs are detected automatically and become clickable links. To open a link, hold `Ctrl` and click it.",
      wrapKeys:
        "With text selected in a note, `Ctrl+B` wraps it in bold, `Ctrl+I` in italics, and `Ctrl+´` in backticks; typing any parenthesis character (**(**, **[**, or **{**) or quote (**\"** or **'**) wraps it in that pair. Pair wrapping is not exclusive to notes: it works the same way in the command editor.",
    },
    imageBlock: {
      intro:
        "It's a block that holds a picture: the architecture diagram, a screenshot of the screen you are supposed to be looking at, the dashboard panel that says the deploy worked, etc.",
      ways: (
        chooseLabel,
      ) => `* **Drop it in**: drag an image file from your desktop straight onto the block.
* **Paste it**: click the block and press \`Ctrl+V\` with an image, or an image address, on your clipboard.
* **Pick it**: press **${chooseLabel}** to open your file browser.
* **Link it**: type or paste an \`http\` or \`https\` address into the box at the bottom of the block.`,
      attachedVsLinked: (limit) =>
        `An attached image has to stay under **${limit}**. A linked image will only show while it stays hosted online.`,
      sizing:
        "A picture is shown at its own size, but never below a readable minimum and never beyond what the block allows: a tiny image is scaled up, a huge one is scaled down, and neither is ever stretched out of shape.",
      slideshow:
        "When a runbook holds more than one image, full screen becomes a slideshow: the arrows parked at the left and right edges of the screen, or the `Left` and `Right` arrow keys, move you through every image in the runbook in the order they appear, and the counter tells you where you are. The page follows along, parking each image at the top of the screen, so closing full screen leaves you right on the last one you looked at.",
      demoHint: (viewFullscreen, replace, remove) =>
        `Hover over an image to reveal its controls: **${viewFullscreen}** opens it over a dimmed page, and its actions menu holds **${replace}**, which swaps the picture without touching the block, and **${remove}**, which empties it back to the drop area.`,
    },
    dividerBlock: {
      intro:
        "Nothing more than a visual separator. It stretches to match the width of the widest block, which makes it perfect for splitting a runbook into sections.",
      demoNote: "Type here and watch how the divider grows or shrinks.",
    },
    multiSelect: {
      intro:
        "Hold `Shift` and click blocks to build a selection. You can also hold `Shift` and drag the mouse across blocks to lasso-select them. Lassoing already-selected blocks deselects them.",
      actions: `* **Drag** any selected block's handle to move all selected blocks together, preserving relative order.
* **Duplicate**: \`Ctrl+D\` duplicates the entire group, inserted after the last selected block.
* **Delete**: \`Del\` deletes the entire group.
* **Copy to another tab**: drag any selected block's handle onto a tab in the tabs bar to copy the whole selection into that tab. Referenced variables travel with the blocks; if the target tab already defines one of them with a different value, the copy is added under a new name and the copied blocks are rewritten to reference it, so neither tab's values are touched.`,
      clear:
        "Press `Escape` or click outside block controls to clear the selection.",
      dragToTabDelay:
        "While dragging blocks over the tabs bar, hover a tab for a moment to switch to it, then drop.",
    },
    readMode: {
      intro:
        "Read mode locks editing, not navigation. Click the **padlock icon** in the header to enter it:",
      rules: `* All command editors collapse and cannot be expanded.
* Block and note text cannot be edited.
* Block structure cannot be changed (no adding, deleting, or reordering).
* Variable values can still be changed.
* Runbooks can still be opened.
* Links can be opened with a direct click.
* Images open full screen with a click.`,
      persisted:
        "This mode is part of your saved preferences, so reloading the app keeps you in read mode.",
      exit: "Click the **pencil icon** to return to edit mode.",
    },
    export: {
      intro: (exportLabel) =>
        `Click **${exportLabel}** in the header to open the format picker.`,
      formats: `* **JSON**: the full workspace (variables and blocks). Can be re-imported.
* **Markdown**: a human-readable \`.md\` file with headings, subheadings, dividers, resolved commands, and images.
* **Plain text**: the same content as Markdown, saved as \`.txt\`.`,
      saveDialog:
        "A native OS save dialog opens on supported browsers so you can choose the filename and folder. On other browsers the file downloads directly.",
      copyMarkdown: (copyMarkdownLabel) =>
        `You can also right-click anywhere inside a runbook and choose **${copyMarkdownLabel}** to skip the export process entirely. This option lets you copy a runbook's content ready to paste into a chat, a ticket, or a document.`,
    },
    cloudExport: {
      intro: (exportLabel, importLabel) =>
        `**${exportLabel}** and **${importLabel}** can go straight to OneDrive or Google Drive, not just this device. The dialog reopens with the destination and format you used last time already selected.`,
      switchProvider:
        "While you are browsing the cloud, the provider name in the dialog title is a **picker**: click it to switch providers.",
      overwrite:
        "If the destination folder already holds a file with the same name, the export stops and asks you to confirm before replacing it.",
    },
    cloudLinkedSync: {
      intro:
        "A runbook you import from the cloud stays **in sync** with the file it came from: every edit is written back to that file, so you never have to export it again to save it. Exporting a runbook as **JSON** links it the same way.",
      syncBadge: (runbooksTitle) =>
        `A synced runbook shows a **sync icon** next to its name in the **${runbooksTitle}** list: a spinner while an edit is on its way up, a crossed out cloud if the save failed. Click it to sign in again or retry.`,
      stopSyncing: (stopSyncingLabel) =>
        `**${stopSyncingLabel}** (in the runbook's three dots menu) breaks the link without touching either copy. Sync only pushes local edits up, it never pulls remote changes back down.`,
    },
    cloudFileManagement: {
      folders:
        "Cloud runbooks can live in folders: click one to open it, click a file to import it. The **arrow** buttons and the path above the list move between folders you've visited. Exporting picks a destination the same way, with a **new folder** button.",
      search:
        "The **search bar** looks through the entire **CommandPad** folder, not just the one you have open, and shows each result's folder path.",
      actions: (rename, edit, duplicate, download, deleteLabel) =>
        `A row's **three dots** menu holds **${rename}**, **${edit}**, **${duplicate}**, **${download}**, and **${deleteLabel}**.`,
      multiSelect:
        "Rows select like files in a file explorer. Click a row to select it, click the **circle** on its left to add or drop it from the selection, `Ctrl`+click to do the same anywhere on the row, and `Shift`+click to take everything between the last row you clicked and this one. The circle in the header adds or drops the rows currently listed, and clicking the empty space below the rows clears the selection.",
      bulkActions:
        "With two or more rows selected, a menu action applies to the whole selection, and importing, duplicating, downloading or deleting that many items asks you to confirm first, listing exactly what it is about to touch. A single row still acts on one click.",
      editFile:
        "**Edit** opens the file's raw JSON in place, so a quick fix doesn't require importing, changing, and re-exporting it. It has to stay valid JSON to save.",
      recycleBin:
        "A deleted file or folder isn't gone for good: cloud providers move it to a _Recycle Bin_ first.",
    },
    language: {
      intro:
        "Use the **language selector** in the header to pick the interface language.",
      detection:
        "The app detects your browser language on first visit, and your choice is remembered afterward.",
    },
    keyboardShortcuts: {
      intro: "Every shortcut available in the app.",
    },
    qa: {
      intro: "Quick answers to the questions that come up most often.",
      items: [
        {
          question: "Where is my data stored?",
          answer:
            "Everything lives in your browser: preferences and tab metadata in **localStorage** and runbook content in **IndexedDB**. Nothing is sent to any server.",
        },
        {
          question: "How do I back up a runbook or move it to another machine?",
          answer:
            "Export it as **JSON** and import the file on the other machine, or export it straight to OneDrive or Google Drive and import it from there on the other machine. The JSON export contains the full workspace (variables and blocks) and can always be re-imported.",
        },
        {
          question: "What exactly does Reset Workspace delete?",
          answer:
            "All of it: every tab, every runbook in the library, every variable, and every preference. It is a full wipe of the app's local storage and it cannot be undone, so export anything you want to save first.",
        },
        {
          question: "Why is part of my command highlighted in red?",
          answer:
            "That part is an unresolved reference: no variable with that key exists (keys are case-sensitive), or a `{;name}` placeholder was not given a value.",
        },
        {
          question: "Are secret variables encrypted?",
          answer:
            "Only if you set a passphrase for that runbook, from its shield icon in the library. Marking a variable secret always masks it on screen; without a passphrase the value is still stored in plain text.",
        },
        {
          question:
            "Why does export download directly instead of asking where to save?",
          answer:
            "The native save dialog uses the File System Access API, which is available in Chromium-based browsers (Chrome, Edge, Brave). Browsers without it fall back to a direct download.",
        },
        {
          question: "Can I add another language to the UI?",
          answer:
            "Yes, via a contribution to the project. Each language is a single catalog file, so adding one is just a data change.",
        },
      ],
    },
  },
};
