import { DocsSectionId } from "@/common/constants/docs";
import type { ComponentType } from "react";
import {
  BlocksDocs,
  CommandBlockDocs,
  DividerBlockDocs,
  NoteBlockDocs,
} from "./sections/BlocksSection";
import { ExportDocs } from "./sections/ExportSection";
import { GettingStartedDocs } from "./sections/GettingStartedSection";
import { LanguageDocs } from "./sections/LanguageSection";
import { MultiSelectDocs } from "./sections/MultiSelectSection";
import { ReadModeDocs } from "./sections/ReadModeSection";
import { RunbookLibraryDocs } from "./sections/RunbookLibrarySection";
import { KeyboardShortcutsDocs } from "./sections/ShortcutsSection";
import { TabsDocs } from "./sections/TabsSection";
import {
  EscapingBracesDocs,
  ParameterizedPlaceholdersDocs,
  SecretVariablesDocs,
  VariableReferencesDocs,
  VariablesDocs,
} from "./sections/VariablesSection";
import { SidebarDocs, WorkspaceDocs } from "./sections/WorkspaceSection";

// Content rendered below each numbered section heading
export const DOCS_SECTION_CONTENT: Record<DocsSectionId, ComponentType> = {
  [DocsSectionId.GETTING_STARTED]: GettingStartedDocs,
  [DocsSectionId.WORKSPACE]: WorkspaceDocs,
  [DocsSectionId.TABS]: TabsDocs,
  [DocsSectionId.SIDEBAR]: SidebarDocs,
  [DocsSectionId.RUNBOOK_LIBRARY]: RunbookLibraryDocs,
  [DocsSectionId.VARIABLES]: VariablesDocs,
  [DocsSectionId.VARIABLE_REFERENCES]: VariableReferencesDocs,
  [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]: ParameterizedPlaceholdersDocs,
  [DocsSectionId.ESCAPING_BRACES]: EscapingBracesDocs,
  [DocsSectionId.SECRET_VARIABLES]: SecretVariablesDocs,
  [DocsSectionId.BLOCKS]: BlocksDocs,
  [DocsSectionId.COMMAND_BLOCK]: CommandBlockDocs,
  [DocsSectionId.NOTE_BLOCK]: NoteBlockDocs,
  [DocsSectionId.DIVIDER_BLOCK]: DividerBlockDocs,
  [DocsSectionId.MULTI_SELECT]: MultiSelectDocs,
  [DocsSectionId.READ_MODE]: ReadModeDocs,
  [DocsSectionId.EXPORT]: ExportDocs,
  [DocsSectionId.LANGUAGE]: LanguageDocs,
  [DocsSectionId.KEYBOARD_SHORTCUTS]: KeyboardShortcutsDocs,
};
