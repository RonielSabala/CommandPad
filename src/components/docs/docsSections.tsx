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
import { QaDocs } from "./sections/QaSection";
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
import {
  HeaderDocs,
  MainPanelDocs,
  SidebarDocs,
  WorkspaceDocs,
} from "./sections/WorkspaceSection";

export const DOCS_SECTION_CONTENT: Record<DocsSectionId, ComponentType> = {
  [DocsSectionId.GETTING_STARTED]: GettingStartedDocs,
  [DocsSectionId.WORKSPACE]: WorkspaceDocs,
  [DocsSectionId.HEADER]: HeaderDocs,
  [DocsSectionId.SIDEBAR]: SidebarDocs,
  [DocsSectionId.MAIN_PANEL]: MainPanelDocs,
  [DocsSectionId.BLOCKS]: BlocksDocs,
  [DocsSectionId.COMMAND_BLOCK]: CommandBlockDocs,
  [DocsSectionId.NOTE_BLOCK]: NoteBlockDocs,
  [DocsSectionId.DIVIDER_BLOCK]: DividerBlockDocs,
  [DocsSectionId.VARIABLES]: VariablesDocs,
  [DocsSectionId.SECRET_VARIABLES]: SecretVariablesDocs,
  [DocsSectionId.VARIABLE_REFERENCES]: VariableReferencesDocs,
  [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]: ParameterizedPlaceholdersDocs,
  [DocsSectionId.ESCAPING_BRACES]: EscapingBracesDocs,
  [DocsSectionId.TABS]: TabsDocs,
  [DocsSectionId.MULTI_SELECT]: MultiSelectDocs,
  [DocsSectionId.RUNBOOK_LIBRARY]: RunbookLibraryDocs,
  [DocsSectionId.READ_MODE]: ReadModeDocs,
  [DocsSectionId.EXPORT]: ExportDocs,
  [DocsSectionId.LANGUAGE]: LanguageDocs,
  [DocsSectionId.KEYBOARD_SHORTCUTS]: KeyboardShortcutsDocs,
  [DocsSectionId.QA]: QaDocs,
};
