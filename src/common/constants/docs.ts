// Documentation section ids double as URL hash anchors (/docs#<id>)
export const DocsSectionId = {
  GETTING_STARTED: "getting-started",
  WORKSPACE: "workspace",
  TABS: "tabs",
  SIDEBAR: "sidebar",
  RUNBOOK_LIBRARY: "runbook-library",
  VARIABLES: "variables",
  VARIABLE_REFERENCES: "variable-references",
  PARAMETERIZED_PLACEHOLDERS: "parameterized-placeholders",
  ESCAPING_BRACES: "escaping-braces",
  SECRET_VARIABLES: "secret-variables",
  BLOCKS: "blocks",
  COMMAND_BLOCK: "command-block",
  NOTE_BLOCK: "note-block",
  DIVIDER_BLOCK: "divider-block",
  MULTI_SELECT: "multi-select",
  READ_MODE: "read-mode",
  EXPORT: "export",
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

// Display order; numbering (1, 1.1, 2, ...) derives from this list.
// Ordered as a guided first-session journey: workspace, blocks, variables,
// tabs, bulk editing, library, then reference material.
export const DOCS_SECTION_ORDER: readonly DocsSectionEntry[] = [
  { id: DocsSectionId.GETTING_STARTED, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.WORKSPACE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.SIDEBAR, level: DocsSectionLevel.SUBSECTION },
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
  { id: DocsSectionId.LANGUAGE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.KEYBOARD_SHORTCUTS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.QA, level: DocsSectionLevel.SECTION },
];

export function getDocsSectionNumbers(): Record<DocsSectionId, string> {
  const numbers = {} as Record<DocsSectionId, string>;
  let section = 0;
  let subsection = 0;

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
