export const DocsSectionId = {
  GETTING_STARTED: "getting-started",
  WORKSPACE: "workspace",
  HEADER: "header",
  SIDEBAR: "sidebar",
  MAIN_PANEL: "main-panel",
  BLOCKS: "blocks",
  COMMAND_BLOCK: "command-block",
  NOTE_BLOCK: "note-block",
  IMAGE_BLOCK: "image-block",
  DIVIDER_BLOCK: "divider-block",
  VARIABLES: "variables",
  SECRET_VARIABLES: "secret-variables",
  SECRET_ENCRYPTION: "secret-encryption",
  VARIABLE_REFERENCES: "variable-references",
  PARAMETERIZED_PLACEHOLDERS: "parameterized-placeholders",
  PLACEHOLDER_DEFAULTS: "placeholder-defaults",
  VARIABLE_SLICING: "variable-slicing",
  VARIABLE_COUNT: "variable-count",
  VARIABLE_KEY: "variable-key",
  VARIABLE_CASE: "variable-case",
  VARIABLE_STRIP: "variable-strip",
  TRANSFORMED_PLACEHOLDERS: "transformed-placeholders",
  UNNAMED_REFERENCES: "unnamed-references",
  VARIABLE_DATE: "variable-date",
  MULTILINE_REFERENCES: "multiline-references",
  ESCAPING_BRACES: "escaping-braces",
  TABS: "tabs",
  MULTI_SELECT: "multi-select",
  RUNBOOK_LIBRARY: "runbook-library",
  READ_MODE: "read-mode",
  EXPORT: "export",
  CLOUD_EXPORT: "cloud-export",
  CLOUD_LINKED_SYNC: "cloud-linked-sync",
  CLOUD_FILE_MANAGEMENT: "cloud-file-management",
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
  { id: DocsSectionId.BLOCKS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.COMMAND_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.NOTE_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.IMAGE_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.DIVIDER_BLOCK, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLES, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.SECRET_VARIABLES, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.SECRET_ENCRYPTION, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLE_REFERENCES, level: DocsSectionLevel.SUBSECTION },
  {
    id: DocsSectionId.PARAMETERIZED_PLACEHOLDERS,
    level: DocsSectionLevel.SUBSECTION,
  },
  {
    id: DocsSectionId.PLACEHOLDER_DEFAULTS,
    level: DocsSectionLevel.SUBSECTION,
  },
  { id: DocsSectionId.VARIABLE_SLICING, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLE_COUNT, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLE_KEY, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLE_CASE, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.VARIABLE_STRIP, level: DocsSectionLevel.SUBSECTION },
  {
    id: DocsSectionId.TRANSFORMED_PLACEHOLDERS,
    level: DocsSectionLevel.SUBSECTION,
  },
  {
    id: DocsSectionId.UNNAMED_REFERENCES,
    level: DocsSectionLevel.SUBSECTION,
  },
  { id: DocsSectionId.VARIABLE_DATE, level: DocsSectionLevel.SUBSECTION },
  {
    id: DocsSectionId.MULTILINE_REFERENCES,
    level: DocsSectionLevel.SUBSECTION,
  },
  { id: DocsSectionId.ESCAPING_BRACES, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.TABS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.MULTI_SELECT, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.WORKSPACE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.HEADER, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.SIDEBAR, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.MAIN_PANEL, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.RUNBOOK_LIBRARY, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.READ_MODE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.EXPORT, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.CLOUD_EXPORT, level: DocsSectionLevel.SUBSECTION },
  { id: DocsSectionId.CLOUD_LINKED_SYNC, level: DocsSectionLevel.SUBSECTION },
  {
    id: DocsSectionId.CLOUD_FILE_MANAGEMENT,
    level: DocsSectionLevel.SUBSECTION,
  },
  { id: DocsSectionId.LANGUAGE, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.KEYBOARD_SHORTCUTS, level: DocsSectionLevel.SECTION },
  { id: DocsSectionId.QA, level: DocsSectionLevel.SECTION },
];

export function getDocsSectionParents(): Record<
  DocsSectionId,
  DocsSectionId | null
> {
  let section: DocsSectionId | null = null;
  const parents = {} as Record<DocsSectionId, DocsSectionId | null>;

  for (const entry of DOCS_SECTION_ORDER) {
    if (entry.level === DocsSectionLevel.SECTION) {
      section = entry.id;
      parents[entry.id] = null;
    } else {
      parents[entry.id] = section;
    }
  }

  return parents;
}

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
