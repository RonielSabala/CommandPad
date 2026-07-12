import { DocsSectionId } from "@/common/constants/docs";
import { BlockType, NoteStyle } from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import type { Messages } from "../types";

export const en: Messages = {
  common: {
    cancel: "Cancel",
    close: "Close",
    ok: "OK",
    create: "Create",
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
    keybindingsTitle: "App keybindings",
    resetWorkspaceTitle: "Reset workspace",
    exportTitle: "Export runbook",
    export: "Export",
    changeLanguage: "Change language",
  },
  sidebar: {
    expand: "Expand sidebar",
    collapse: "Collapse sidebar",
    moveLeft: "Move sidebar to left",
    moveRight: "Move sidebar to right",
    doubleClickExpand: "Double-click to expand",
    dragResizeCollapse: "Drag to resize · double-click to collapse",
  },
  runbooks: {
    title: "RUNBOOKS",
    searchPlaceholder: "Search runbooks…",
    empty: "No runbooks imported.",
    import: "Import",
    importTitle: "Import runbook",
    paste: "Paste",
    pasteTitle: "Paste runbook JSON",
    removeFromLibrary: "Remove from library",
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
    remove: "Remove variable",
    unusedTitle: (key) => `${key} (unused)`,
  },
  tabs: {
    newTab: "New tab",
    closeTab: "Close tab",
  },
  blocks: {
    newBlockLabel: "NEW BLOCK",
    typeLabel: {
      [BlockType.COMMAND]: "Command",
      [BlockType.NOTE]: "Note",
      [BlockType.DIVIDER]: "Divider",
    },
    typeTitle: (label) => `${label} block`,
    duplicate: "Duplicate block",
    delete: "Delete block",
    emptyTitle: "No blocks yet.",
    emptyHint: "Add a command or note below.",
  },
  command: {
    emptyPreview: "empty command",
    showEditor: "Show editor",
    hideEditor: "Hide editor",
    copy: "Copy command",
    placeholder: "ssh {USER}@{HOST}",
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
  },
  exportModal: {
    title: "Export",
    message: "Choose an export format.",
  },
  pasteModal: {
    title: "Paste Runbook",
    message: "Paste raw runbook JSON to create a new runbook.",
    error: "That doesn't look like valid runbook JSON.",
  },
  keybindingsModal: {
    title: "App Keybindings",
  },
  alert: {
    invalidFormatTitle: "Invalid Format",
  },
  confirm: {
    defaultTitle: "Confirm",
  },
  dialogs: {
    overwriteTitle: "Overwrite Runbook",
    overwriteConfirm: "Overwrite",
    overwriteMessage: (filename, existingName) =>
      `"${filename}" matches an existing runbook. Importing it will overwrite "${existingName}".`,
    importFailed: (count) =>
      count === 1
        ? "1 file could not be imported because its format isn't recognized."
        : `${count} files could not be imported because their formats aren't recognized.`,
    pastedRunbook: "Pasted runbook",
    resetTitle: "Reset Workspace",
    resetConfirm: "Reset",
    resetMessage:
      "Delete all variables, blocks, runbooks, and preferences? This action cannot be undone.",
  },
  keybindings: {
    [KeyBinding.TOGGLE_MODE]: "Toggle read / edit mode",
    [KeyBinding.NEW_TAB]: "Open a new tab",
    [KeyBinding.CLOSE_TAB]: "Close the active tab",
    [KeyBinding.TOGGLE_EDITORS]: "Toggle all command editors",
    [KeyBinding.DELETE_RUNBOOK]: "Delete the focused runbook from the library",
    [KeyBinding.IMPORT_RUNBOOK]: "Open runbook import dialog",
    [KeyBinding.TOGGLE_SIDEBAR]: "Collapse / expand sidebar",
    [KeyBinding.MOVE_SIDEBAR]: "Move sidebar to left / right",
    [KeyBinding.DUPLICATE_BLOCK]: "Duplicate selected blocks",
    [KeyBinding.DELETE_BLOCK]: "Delete selected blocks",
    [KeyBinding.ESCAPE]: "Clear block selection / close modals",
    [KeyBinding.EXPORT]: "Open export dialog",
    [KeyBinding.RESET_WORKSPACE]: "Open reset workspace dialog",
    [KeyBinding.FOCUS_RUNBOOK]: "Select active runbook",
    [KeyBinding.NAVIGATE_RUNBOOKS]:
      "Navigate runbooks when selected active runbook",
    [KeyBinding.OPEN_LINK]: "Open note link in new tab",
    [KeyBinding.MULTISELECT_BLOCKS]: "Multi-select blocks",
    [KeyBinding.NOTE_BOLD]: "Bold selected text (note block)",
    [KeyBinding.NOTE_ITALIC]: "Italicize selected text (note block)",
    [KeyBinding.NOTE_CODE]: "Wrap selected text in backticks (note block)",
  },
  docs: {
    meta: {
      title: "Documentation",
      openDocs: "Open documentation",
      backToApp: "Back to app",
      tocTitle: "Contents",
    },
    toc: {
      [DocsSectionId.GETTING_STARTED]: "Getting started",
      [DocsSectionId.WORKSPACE]: "Workspace",
      [DocsSectionId.TABS]: "Tabs",
      [DocsSectionId.SIDEBAR]: "Sidebar",
      [DocsSectionId.RUNBOOK_LIBRARY]: "Runbook library",
      [DocsSectionId.VARIABLES]: "Variables",
      [DocsSectionId.VARIABLE_REFERENCES]: "Variable references",
      [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]: "Parameterized placeholders",
      [DocsSectionId.ESCAPING_BRACES]: "Escaping braces",
      [DocsSectionId.SECRET_VARIABLES]: "Secret variables",
      [DocsSectionId.BLOCKS]: "Blocks",
      [DocsSectionId.COMMAND_BLOCK]: "Command block",
      [DocsSectionId.NOTE_BLOCK]: "Note block",
      [DocsSectionId.DIVIDER_BLOCK]: "Divider block",
      [DocsSectionId.MULTI_SELECT]: "Multi-select",
      [DocsSectionId.READ_MODE]: "Read mode",
      [DocsSectionId.EXPORT]: "Export",
      [DocsSectionId.LANGUAGE]: "Language",
      [DocsSectionId.KEYBOARD_SHORTCUTS]: "Keyboard shortcuts",
    },
    gettingStarted: {
      intro:
        "CommandPad is a lightweight, variable-aware command runbook tool. Define variables once, reference them across any number of command blocks, and copy fully resolved commands instantly. It is designed for engineers who run the same sequences of commands repeatedly with different environments, credentials, or targets.",
      concept:
        "A **runbook** is a document that mixes command blocks, note blocks, and dividers. Reference any variable inside a command with curly braces — `{NAME}` — and the resolved command updates live as you type.",
      features: [
        "**Tabs** — open multiple runbooks simultaneously in separate tabs.",
        "**Live resolved preview** — every command block shows the fully resolved command in real time.",
        "**Three block types** — commands, notes, and dividers can be freely mixed to build structured, annotated runbooks.",
        "**Secret variables** — mask sensitive values in the sidebar and in command previews.",
        "**Drag-and-drop reordering** — blocks, variables, and runbook entries can each be reordered via their drag handles.",
        "**Persistent state** — tabs, content, sidebar state, and preferences are saved locally and restored on reload.",
      ],
    },
    workspace: {
      intro:
        "The workspace is the main screen of the app: a header with global actions, a sidebar holding the runbook library and the variables panel, and the main panel where the active runbook's blocks live.",
    },
    tabs: {
      intro: "Each tab holds one open runbook.",
      items: [
        "Click a tab to switch to it.",
        "**Middle-click** a tab to close it.",
        "**Drag** a tab to reorder it.",
        "**Drop blocks on a tab** to copy them into it.",
        "An accent bar at the bottom of the active tab marks it at a glance.",
      ],
    },
    sidebar: {
      intro:
        "The sidebar holds the runbook library and the variables panel.",
      items: [
        "**Collapse / expand** — click the chevron button or press the sidebar shortcut.",
        "**Move left / right** — click the layout button to move the sidebar to the other side of the screen.",
        "**Resize** — drag the sidebar's inner edge; double-click it to collapse.",
      ],
    },
    runbookLibrary: {
      intro:
        "The sidebar's **RUNBOOKS** section holds your imported runbooks.",
      items: [
        "Click **Import** to load one or more `.json` files at once, or **Paste** to create a runbook from raw JSON.",
        "Click any runbook entry to open it. If it's already open in a tab, that tab becomes active.",
        "Delete a runbook from the library with the button shown on row hover.",
        "Drag the handle on the left of an entry to reorder the list.",
        "Use the **search bar** to filter runbooks by name.",
      ],
      autoLabel:
        "**Auto-labelling:** if a runbook's first block is a note, its text is used as the library label, so entries are self-describing. Otherwise the imported filename is used as the fallback.",
      autoSave:
        "Edits made to the active runbook are automatically saved back to its library entry.",
    },
    variables: {
      intro:
        "Variables are defined in the **VARIABLES** section of the sidebar. Each variable has a **key** and a **value**. Keys are case-sensitive, and variables with empty keys are ignored.",
      usage:
        "Reference a variable in any command block by wrapping its key in curly braces, e.g. `{NAMESPACE}`. Renaming a key automatically updates all references, and variables not referenced by any command are dimmed so stale entries are easy to spot.",
    },
    variableReferences: {
      intro:
        "A variable's value can reference other variables. References resolve recursively, so you can build values like `https://{HOST}/api` out of smaller pieces.",
    },
    parameterizedPlaceholders: {
      intro:
        "A variable's value can contain a `{;name}` placeholder that isn't filled in until the variable is referenced.",
      fill:
        "Fill it in per-reference with `{key;name=value}`. Supply multiple placeholders by separating them with `;`, e.g. `{A;p1=v1;p2=v2}`.",
      unresolved:
        "If a reference omits a placeholder's value, the `{;name}` marker is left in place and the command is treated as unresolved.",
    },
    escapingBraces: {
      intro:
        "Prefix `{` or `}` with a backslash in a command block to output it literally instead of starting a variable reference. The backslash is dropped from the resolved command.",
      scope:
        "Escaping applies to command blocks only; backslashes inside variable values are always literal. It also works inside a parameter value, so you can pass a literal brace instead of a nested reference.",
    },
    secretVariables: {
      intro:
        "Click the **eye icon** on a variable row to mark it as **secret**. Secret values are masked in the sidebar and are substituted silently in command previews.",
    },
    blocks: {
      intro:
        "Blocks are the main content of a runbook. Add them using the **NEW BLOCK** row at the bottom of the main panel.",
      tip:
        "If no tabs are open and you add a block (or create a variable), a new untitled tab is created automatically.",
    },
    commandBlock: {
      intro: "A command block has two parts:",
      preview:
        "**Preview** (always visible) — the fully resolved command. Unresolved variable references are highlighted. Click **Copy** to copy the resolved text to the clipboard.",
      editor:
        "**Editor** (collapsible) — the raw command template, prefixed with `$`. Use the chevron button to collapse it, or toggle all editors globally with the header button.",
      multiline:
        "Commands can span multiple lines. The editor scrolls horizontally when a line exceeds the panel width.",
    },
    noteBlock: {
      intro:
        "A free-form text block. Note blocks expand horizontally and vertically as you type.",
      styles:
        "Three text styles are selectable on hover: **heading** (large, bold), **subheading** (medium, accented), and **body** (default prose).",
      markdown: "Notes support inline markdown:",
      tableSyntax: "Syntax",
      tableResult: "Result",
      links:
        "To open a link, hold `Ctrl` and click it. In read mode, links are directly clickable.",
      wrapKeys:
        "With text selected in a note, `Ctrl+B` wraps it in bold, `Ctrl+I` in italics, `Ctrl+´` in backticks, and typing `(`, `[`, or `{` wraps it in that bracket pair.",
    },
    dividerBlock: {
      intro:
        "A visual separator. It stretches to match the width of the widest block — useful for separating runbook sections visually.",
    },
    multiSelect: {
      intro:
        "Hold `Shift` and click blocks to build a selection. You can also hold `Shift` and drag the mouse across blocks to lasso-select them. Lassoing already-selected blocks deselects them.",
      actions: [
        "**Drag** any selected block's handle to move all selected blocks together, preserving relative order.",
        "**Copy to another tab** — drag any selected block's handle onto a tab in the tabs bar to copy the whole selection into that tab.",
        "**Duplicate** — `Ctrl+D` duplicates the entire group, inserted after the last selected block.",
        "**Delete** — `Del` deletes the entire group.",
      ],
      clear:
        "Press `Escape` or click outside block controls to clear the selection.",
    },
    readMode: {
      intro:
        "Read mode locks editing, not navigation. Click the **padlock icon** in the header to enter it:",
      rules: [
        "All command editors collapse and cannot be expanded.",
        "Block and note text cannot be edited.",
        "Block structure cannot be changed (no adding, deleting, or reordering).",
        "Variable values can still be changed.",
        "Runbooks can still be switched.",
        "Links in notes are directly clickable.",
      ],
      exit: "Click the **pencil icon** to return to edit mode.",
    },
    export: {
      intro:
        "Click **Export** in the header to open the format picker.",
      formats: [
        "**JSON** — the full workspace (variables + blocks). Can be re-imported.",
        "**Markdown** — a human-readable `.md` file with headings, subheadings, dividers, and resolved commands.",
        "**Plain text** — the same content as Markdown, saved as `.txt`.",
      ],
      saveDialog:
        "A native OS save dialog opens on supported browsers so you can choose the filename and folder. On other browsers the file downloads directly.",
    },
    language: {
      intro:
        "Use the **language selector** in the header to pick the UI language. English and Español are currently available.",
      detection:
        "The app detects your browser language on first visit, and your choice is remembered afterward.",
    },
    keyboardShortcuts: {
      intro:
        "These shortcuts are also available in-app at any time via the **keyboard icon** in the header.",
    },
  },
};
