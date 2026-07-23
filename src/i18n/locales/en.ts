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
  contextMenu: {
    copyMarkdown: "Copy runbook as Markdown",
    minimap: "Minimap",
    moveMinimapLeft: "Move minimap left",
    moveMinimapRight: "Move minimap right",
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
    dropToImport: "Drop runbooks to import",
    clearLibrary: "Delete All",
    clearLibraryTitle: "Delete all runbooks from the library",
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
    dragResizeSplit: "Drag to resize key and value · double-click to even out",
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
    followLinkTooltip: (binding?: string) =>
      binding ? `Follow link (${binding})` : "Follow link",
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
    clearLibraryTitle: "Delete All Runbooks",
    clearLibraryConfirm: "Delete All",
    clearLibraryMessage:
      "Delete every runbook in the library, along with its variables and blocks? This action cannot be undone.",
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
    [KeyBinding.CLEAR_LIBRARY]: "Open delete all runbooks dialog",
    [KeyBinding.TOGGLE_MINIMAP]:
      "Open the minimap menu (in the runbook content)",
    [KeyBinding.FOCUS_RUNBOOK]: "Select active runbook",
    [KeyBinding.NAVIGATE_RUNBOOKS]:
      "Navigate runbooks with the active runbook selected",
    [KeyBinding.OPEN_LINK]: "Open note link in new tab",
    [KeyBinding.MULTISELECT_BLOCKS]: "Multi-select blocks",
    [KeyBinding.NOTE_BOLD]: "Bold selected text (note block)",
    [KeyBinding.NOTE_ITALIC]: "Italicize selected text (note block)",
    [KeyBinding.NOTE_CODE]: "Wrap selected text in backticks (note block)",
    [KeyBinding.WRAP_SELECTION]:
      "Wrap selected text in the typed pair (any text field)",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
  },
  home: {
    meta: {
      openApp: "Open app",
      openDocs: "Documentation",
    },
    hero: {
      eyebrow: "Variable-aware command runbooks",
      title: "Write commands once. Reuse them everywhere.",
      subtitle:
        "Define your variables a single time, reference them with **{NAME}** across every command, and copy fully-resolved commands in one click. No server, no accounts, everything stays in your browser.",
      primaryCta: "Open CommandPad",
      secondaryCta: "Read the docs",
    },
    demo: {
      title: "See it in action",
      hint: "Change a value below and watch every command update live. It is just a small example to show the idea, not what your workspace will look like.",
    },
    features: {
      title: "Why you'll love it",
      subtitle:
        "Small tool, big quality-of-life upgrade. Here is what makes CommandPad click.",
      items: [
        {
          title: "Change once, update everywhere",
          body: "Edit a single variable and every command that uses it updates instantly. No more hunting and replacing values across a wall of terminal history.",
        },
        {
          title: "Copy commands ready to run",
          body: "Previews resolve every `{NAME}` in real time. One click copies a command with the real values already filled in, so you just paste and go.",
        },
        {
          title: "Runbooks you'll actually understand",
          body: "Mix commands, Markdown notes, and dividers into a clear, step-by-step playbook that still makes sense to you months from now.",
        },
        {
          title: "Yours, and only yours",
          body: "No backend, no accounts, no tracking. Everything lives in your browser, so even secret variables never leave your machine.",
        },
        {
          title: "Built to stay out of your way",
          body: "Tabs, drag-and-drop reordering, multi-block select, read mode, keyboard shortcuts, light and dark themes, English and Spanish.",
        },
        {
          title: "Take your runbooks anywhere",
          body: "Export to JSON, Markdown, or plain text and re-import on another machine. Your work travels with you and is never locked in.",
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
    updated: "Last updated: July 22, 2026",
    intro:
      "CommandPad is a client-side application that runs entirely in your web browser. This policy explains what data the app handles and, more importantly, what it does not.",
    sections: [
      {
        heading: "The short version",
        paragraphs: [
          "CommandPad has no backend server, no user accounts, and no analytics or tracking. The app does not collect, transmit, or sell any of your data. Everything you create stays on your device.",
        ],
      },
      {
        heading: "What data we store",
        paragraphs: [
          "All data you enter, such as variables, commands, notes, and runbooks, is saved locally in your browser so your work is still there when you return.",
        ],
        bullets: [
          "**localStorage** holds your preferences (theme, language, layout) and lightweight tab metadata.",
          "**IndexedDB** holds the actual runbook content (your variables and command blocks).",
          "**sessionStorage** holds a single flag noting that you have already seen the home page this session.",
        ],
      },
      {
        heading: "What we do not do",
        paragraphs: [
          "We want to be explicit about the things CommandPad deliberately avoids.",
        ],
        bullets: [
          "We do not send your data to any server. There is no server to send it to.",
          "We do not use cookies, advertising identifiers, or third-party analytics.",
          "We do not track your behavior across sites or build a profile about you.",
          "We do not require an account, an email address, or any sign-in.",
        ],
      },
      {
        heading: "Secret variables",
        paragraphs: [
          "Variables marked as secret are only **masked** in the interface. They are not encrypted, and are stored in plain text in your browser's local storage just like any other variable. Do not treat secret variables as a secure vault.",
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
    updated: "Last updated: July 22, 2026",
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
          "CommandPad is a free, client-side tool for building variable-aware command runbooks. It runs in your browser and stores your work locally on your device. It is provided as-is, and features may change or be removed over time.",
        ],
      },
      {
        heading: "Your responsibilities",
        paragraphs: [
          "You are responsible for the commands and content you create and for how you use them.",
        ],
        bullets: [
          "Review every command before you run it. CommandPad resolves and copies text; it does not execute anything for you.",
          "Keep your own backups of anything important by exporting your runbooks.",
          "Do not rely on secret variables as secure storage for sensitive credentials.",
          "Use the app in compliance with the laws and policies that apply to you.",
        ],
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
        heading: "Data and privacy",
        paragraphs: [
          "CommandPad stores your data locally and does not transmit it. For details, see the Privacy Policy, which is incorporated into these terms by reference.",
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
      [DocsSectionId.QA]: "Q&A",
    },
    demo: {
      tryIt: "Try it",
      reset: "Reset demo",
      tabSamples: ["Deploy checklist", "Database backup", ""],
      runbookSamples: ["Release checklist", "Postgres backup", "K8s debugging"],
      multiSelectNotes: ["Create the backup", "Clean up"],
      greetingTemplate: "Hi {;name}, welcome to {;place}!",
      noteSample:
        "Click this note to see its raw text: it mixes **bold**, _italic_, `code`, and a link, e.g. https://example.com. Click away to see it rendered again.",
    },
    gettingStarted: {
      intro:
        "Welcome to CommandPad! Here you'll build **runbooks**: documents that mix the commands you run often with the notes that help explain them.",
      why: "You know the ritual: scrolling through shell history, digging through old chat messages, or keeping a `commands.txt` somewhere on your computer. A runbook ends that. Each command lives next to the note that explains it, with the changing parts filled in for you, ready to copy.",
      journey:
        "This guide walks you through how the app works, one piece at a time, so you can get the most out of it. You'll start with the workspace and its sidebar, meet the three block types your runbooks are built from and, to wrap up, variables: the feature that makes command blocks truly powerful.",
      navigate:
        "Read it start to finish, or jump straight to whatever interests you from the contents on the left: you set the pace.",
      tryIt:
        "Most sections come with a real, working example marked **Try it**, a piece of the app you're free to mess with, nothing you do there touches your actual workspace. Go ahead and poke at it, that's the fastest way to get a feel for how something works. If you ever get lost, the arrow button in its corner brings it back to where it started.",
    },
    workspace: {
      intro:
        "The workspace is the app's main screen. It is where you will spend most of your time building and polishing your runbooks. It is made of three areas:",
      items: [
        "The **header**: gathers the buttons with the app's global actions.",
        "The **sidebar**: holds the runbook library and the variables panel.",
        "The **main panel**: where every runbook you have open lives and, inside them, their blocks.",
      ],
      persistence:
        "Everything you do is saved automatically in your browser and restored when you reload the page. Your data is never sent to a server.",
    },
    header: {
      intro:
        "The header gathers the actions that affect the whole app. From left to right:",
      items: [
        "The **CommandPad logo**: click it to reload the app.",
        "The **padlock / pencil**: switches between read mode and edit mode. It has its own section later in this guide.",
        "**Collapse all**: collapses or expands every command editor in the active runbook at once.",
        "The **sun / moon**: switches between the dark and light themes.",
        "The **language selector**: changes the interface language.",
        "The **book**: opens this documentation.",
        "The **red arrow**: resets the workspace. It wipes everything, so the app always asks you to confirm first.",
        "**Export**: saves the active runbook to a file. It also has its own section later.",
      ],
    },
    mainPanel: {
      intro:
        "The main panel is your workbench. At the top sits the **tabs bar** with your open runbooks; below it, the blocks of the active runbook; and at the end, the **NEW BLOCK** row to keep adding content.",
      minimap:
        "On the right edge lives the **minimap**: a miniature of the real runbook blocks that replaces the scrollbar. Click or drag on it to jump anywhere in a runbook. **Right-click** anywhere in the runbook content to open a small menu where you can turn it on or off or move it to the other side.",
      teaser:
        "Blocks? Tabs? Don't worry: they are exactly what you will learn next.",
    },
    tabs: {
      intro: "Each tab holds one open runbook.",
      items: [
        "**Click** a tab to switch to it.",
        "**Drag** a tab to reorder it.",
        "**Middle-click** a tab to close it.",
        "**Click** the **+** at the end of the tabs bar to open a new tab.",
      ],
      autoCreate:
        "If no tabs are open and you add a block or a variable, a new untitled tab is created automatically.",
      labelDemo:
        "A tab is named by the first note block of its runbook, so your tabs describe themselves. Watch it live below: the note belongs to the active tab, and editing it renames the tab as you type. Try it all here: add a tab with the **+**, drag them around, switch between them, and close one.",
    },
    sidebar: {
      intro: "The sidebar holds the runbook library and the variables panel.",
      items: [
        "**Collapse / expand**: click the chevron button or use its keyboard shortcut.",
        "**Move left / right**: click the layout button to move the sidebar to the other side of the screen.",
        "**Resize**: drag the sidebar's inner edge; double-click it to collapse.",
      ],
      resizeDetails:
        "Dragging the sidebar very narrow collapses it completely, and it can never grow wider than half of the screen. Expanding it again restores its normal width.",
    },
    runbookLibrary: {
      intro: "The sidebar's **RUNBOOKS** section holds your imported runbooks.",
      items: [
        "Click **Import** to load one or more `.json` files at once, or **Paste** to create a runbook from raw JSON.",
        "You can also **drag files** from your file explorer and drop them onto the section to import them.",
        "Click any runbook to open it. If it's already open in a tab, that tab becomes active.",
        "Delete a runbook from the library with the button shown on row hover.",
        "Click **Delete All** to empty the whole library at once.",
        "Drag the handle on the left of a runbook to reorder it in the list.",
        "Use the **search bar** to filter runbooks by label or filename.",
      ],
      autoLabel:
        "**Auto-labelling:** if a runbook's first block is a note, its text is used as the library label, so runbooks are self-describing. Otherwise the imported filename is used as the fallback.",
      labelDetails:
        "Labels are normalized: markdown formatting is stripped and they are trimmed to 60 characters.",
      autoSave:
        "Edits made to the active runbook are automatically saved back to the library.",
    },
    variables: {
      why: "This is the feature everything else has been building toward. A server name, a file path, a version number: the same little values repeat across half the commands you keep, and the day one changes you get to hunt it down in every single command. With variables you write that value **once**, and every command that needs it stays current on its own.",
      intro:
        "Variables are defined in the **VARIABLES** section of the sidebar. Each variable has a **key** and a **value**. Keys are case-sensitive.",
      usage:
        "Use a variable in any command by wrapping its key in curly braces, e.g. `{SERVER}`. Renaming a key updates every command that uses it, and variables no command uses are dimmed so you can spot the ones you no longer need.",
      unresolved:
        "If a command references a key that does not exist, or a variable with an empty value, that part is highlighted as **unresolved**.",
      duplicatesAndEmpty:
        "If two variables share the same key, the one defined last wins. Hover over a row to reveal its controls: a drag handle on the left to reorder it among the others and a delete button on the right. Try them out in the demos throughout this section.",
      tooltip:
        "If a key or value is too long to fit its box, hover over it to see the full text in a tooltip.",
      split:
        "Keys and values split the row evenly, but you can change that: drag the divider between them to give one side more room, and double-click it to go back to an even split. The new balance applies to every variable and is remembered between sessions.",
      demoHint:
        "See it for yourself below: one `SERVER` variable feeds two commands. Edit its value and watch both previews follow along as you type. That's the whole idea in one gesture.",
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
        "A value can have several blanks. Give each one a different name, then fill them all in the same reference, separated by semicolons:",
      nested:
        "A blank can even be filled with another variable. That way the same value can fill a blank in one command and be used on its own in another:",
    },
    escapingBraces: {
      intro:
        "Prefix `{` or `}` with a backslash in a command block to output it literally instead of starting a variable reference. The backslash is left out of the resolved command.",
      tryHint:
        "Try deleting the backslashes in the command below and watch the literal braces turn into an active reference:",
      scope:
        "Escaping only applies inside command blocks; backslashes in variable values are always shown as-is.",
    },
    secretVariables: {
      intro:
        "Click the **eye icon** on a variable row to mark it as **secret**. Secret values are masked in the sidebar and are substituted with asterisks in command previews.",
      copyNote:
        "The mask is purely visual: the **Copy** button always puts the **real** value on your clipboard, so your commands keep working. Try it below, and click the eye icon to reveal or hide the value.",
    },
    blocks: {
      intro:
        "Blocks are the main content of a runbook. Add them using the **NEW BLOCK** row at the bottom of the main panel. Hover over any block to reveal its controls: grab the handle on the left to drag it into a new spot, or use the **duplicate** and **delete** buttons on the right.",
    },
    commandBlock: {
      intro:
        "It's a block that holds a command you want to keep at hand. It has two parts:",
      parts: [
        "**Preview** (always visible): the command exactly as it will be copied. Click the **Copy** button to send it to your clipboard. This button is disabled if the command is empty.",
        "**Editor** (collapsible): where you write the command. Use the chevron button to hide it when you only need the preview.",
      ],
      multiline:
        "Commands can span several lines, and the editor can scroll sideways when a line gets too long.",
      gutterNote:
        "The left margin marks the first line with `$` and numbers every extra line. Try adding more lines below to watch the numbering grow.",
      variablesTeaser:
        "Command blocks become far more useful with **variables**, which fill in the parts of a command that change. They are explained a little further ahead, in their own section.",
    },
    noteBlock: {
      intro:
        "It's a free-form text block. Notes grow wider and taller as you type.",
      styles:
        "Three text styles are selectable on hover: **heading** (large, bold), **subheading** (medium, accented), and **body** (the default prose).",
      markdown: "Notes support markdown formatting:",
      tableSyntax: "Syntax",
      tableResult: "Result",
      autoUrls:
        "Bare URLs are detected automatically and become clickable links, no markdown needed.",
      noNesting:
        "Styles do not combine: bold and italics cannot be mixed on the same words, for example. Whichever style starts first wins.",
      links: "To open a link, hold `Ctrl` and click it.",
      wrapKeys:
        "With text selected in a note, `Ctrl+B` wraps it in bold, `Ctrl+I` in italics, and **Ctrl+´** in backticks; typing **(**, **[**, **{**, **\"** or **'** wraps it in that pair. Pair wrapping is not exclusive to notes, it works the same way in the command editor.",
    },
    dividerBlock: {
      intro:
        "Nothing more than a visual separator. It stretches to match the width of the widest block, which makes it perfect for splitting a runbook into sections. It does keep a minimum width, though, so it can never shrink into something unreadable.",
      demoNote: "Type here and watch how the divisor grows or shrinks.",
    },
    multiSelect: {
      intro:
        "Hold `Shift` and click blocks to build a selection. You can also hold `Shift` and drag the mouse across blocks to lasso-select them. Lassoing already-selected blocks deselects them.",
      actions: [
        "**Drag** any selected block's handle to move all selected blocks together, preserving relative order.",
        "**Duplicate**: `Ctrl+D` duplicates the entire group, inserted after the last selected block.",
        "**Delete**: `Del` deletes the entire group.",
        "**Copy to another tab**: drag any selected block's handle onto a tab in the tabs bar to copy the whole selection into that tab. Referenced variables travel with the blocks; if the target tab already defines one of them with a different value, the copy is added under a new `KEY_COPY` name and the copied blocks are rewritten to reference it, so neither tab's values are touched.",
      ],
      clear:
        "Press `Escape` or click outside block controls to clear the selection.",
      dragToTabDelay:
        "While dragging blocks over the tabs bar, hover a tab for a moment to switch to it, then drop.",
      demoHint: "Try it on the blocks below:",
    },
    readMode: {
      intro:
        "Read mode locks editing, not navigation. Click the **padlock icon** in the header to enter it:",
      rules: [
        "All command editors collapse and cannot be expanded.",
        "Block and note text cannot be edited.",
        "Block structure cannot be changed (no adding, deleting, or reordering).",
        "Variable values can still be changed.",
        "Runbooks can still be opened.",
        "Links can be opened with a direct click.",
      ],
      persisted:
        "This mode is part of your saved preferences, so reloading the app keeps you in read mode.",
      exit: "Click the **pencil icon** to return to edit mode.",
    },
    export: {
      intro: "Click **Export** in the header to open the format picker.",
      formats: [
        "**JSON**: the full workspace (variables + blocks). Can be re-imported.",
        "**Markdown**: a human-readable `.md` file with headings, subheadings, dividers, and resolved commands.",
        "**Plain text**: the same content as Markdown, saved as `.txt`.",
      ],
      saveDialog:
        "A native OS save dialog opens on supported browsers so you can choose the filename and folder. On other browsers the file downloads directly.",
      copyMarkdown:
        "To skip files entirely, right-click anywhere inside the runbook and choose **Copy runbook as Markdown**. It puts the same Markdown content on your clipboard, ready to paste into a chat, a ticket, or a document.",
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
            "Export it as **JSON** and import the file on the other machine. The JSON export contains the full workspace (variables and blocks) and can always be re-imported.",
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
            "No. Marking a variable as secret only masks its value in the sidebar and in command previews. The value is still stored in plain text in your browser's local storage.",
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
