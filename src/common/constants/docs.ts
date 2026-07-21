export const DocsSectionId = {
  GETTING_STARTED: "getting-started",
  WORKSPACE: "workspace",
  HEADER: "header",
  SIDEBAR: "sidebar",
  MAIN_PANEL: "main-panel",
  BLOCKS: "blocks",
  COMMAND_BLOCK: "command-block",
  NOTE_BLOCK: "note-block",
  DIVIDER_BLOCK: "divider-block",
  VARIABLES: "variables",
  SECRET_VARIABLES: "secret-variables",
  VARIABLE_REFERENCES: "variable-references",
  PARAMETERIZED_PLACEHOLDERS: "parameterized-placeholders",
  ESCAPING_BRACES: "escaping-braces",
  TABS: "tabs",
  MULTI_SELECT: "multi-select",
  RUNBOOK_LIBRARY: "runbook-library",
  READ_MODE: "read-mode",
  EXPORT: "export",
  CLOUD_SYNC: "cloud-sync",
  LANGUAGE: "language",
  KEYBOARD_SHORTCUTS: "keyboard-shortcuts",
  QA: "qa",
} as const;
export type DocsSectionId = (typeof DocsSectionId)[keyof typeof DocsSectionId];

export const DocsSectionLevel = {
  SECTION: 1,
  SUBSECTION: 2,
} as const;
export type DocsSectionLevel =
  (typeof DocsSectionLevel)[keyof typeof DocsSectionLevel];

interface DocsSectionEntry {
  id: DocsSectionId;
  level: DocsSectionLevel;
}

// Display order
export const DOCS_SECTION_ORDER: readonly DocsSectionEntry[] = [
  { id: DocsSectionId.GETTING_STARTED, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.WORKSPACE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.HEADER, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.SIDEBAR, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.MAIN_PANEL, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.BLOCKS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.COMMAND_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.NOTE_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.DIVIDER_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLES, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.SECRET_VARIABLES, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLE_REFERENCES, level: DocsSectionLevel.SUBSECTION },
  {
    id: DocsSectionId.PARAMETERIZED_PLACEHOLDERS,
    level: DocsSectionLevel.SUBSECTION,
  },
  { id: DocsSectionId.ESCAPING_BRACES, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.TABS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.MULTI_SELECT, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.RUNBOOK_LIBRARY, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.READ_MODE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.EXPORT, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.CLOUD_SYNC, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.LANGUAGE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.KEYBOARD_SHORTCUTS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.QA, level: DocsSectionLevel.SECTION },
];

export function getDocsSectionNumbers(): Record<DocsSectionId, string> {
  let section = 0;
  let subsection = 0;
  const numbers = {} as Record<DocsSectionId, string>;

  for (const entry of DOCS_SECTION_ORDER) {
    if (entry.level === DocsSectionLevel.SECTION) {
      section += 1;
      subsection = 0;
      numbers[entry.id] = `${section}`;
    } else {
      subsection += 1;
      numbers[entry.id] = `${section}.${subsection}`;
    }
  }

  return numbers;
}
