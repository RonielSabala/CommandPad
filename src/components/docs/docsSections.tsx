import { DocsSectionId } from "@/common/constants/docs";
import type { ComponentType } from "react";

import {
  BlocksDocs,
  CommandBlockDocs,
  DividerBlockDocs,
  ImageBlockDocs,
  NoteBlockDocs,
} from "./sections/BlocksSection";
import {
  CloudExportDocs,
  CloudFileManagementDocs,
  CloudLinkedSyncDocs,
  ExportDocs,
} from "./sections/ExportSection";
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
  MultilineReferencesDocs,
  ParameterizedPlaceholdersDocs,
  SecretEncryptionDocs,
  SecretVariablesDocs,
  UnnamedReferencesDocs,
  VariableCaseDocs,
  VariableCountDocs,
  VariableDateDocs,
  VariableKeyDocs,
  VariableReferencesDocs,
  VariablesDocs,
  VariablesEditorDocs,
  VariableSlicingDocs,
  VariableStripDocs,
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
  [DocsSectionId.IMAGE_BLOCK]: ImageBlockDocs,
  [DocsSectionId.DIVIDER_BLOCK]: DividerBlockDocs,
  [DocsSectionId.VARIABLES]: VariablesDocs,
  [DocsSectionId.VARIABLES_EDITOR]: VariablesEditorDocs,
  [DocsSectionId.SECRET_VARIABLES]: SecretVariablesDocs,
  [DocsSectionId.SECRET_ENCRYPTION]: SecretEncryptionDocs,
  [DocsSectionId.VARIABLE_REFERENCES]: VariableReferencesDocs,
  [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]: ParameterizedPlaceholdersDocs,
  [DocsSectionId.VARIABLE_SLICING]: VariableSlicingDocs,
  [DocsSectionId.VARIABLE_COUNT]: VariableCountDocs,
  [DocsSectionId.VARIABLE_KEY]: VariableKeyDocs,
  [DocsSectionId.VARIABLE_CASE]: VariableCaseDocs,
  [DocsSectionId.VARIABLE_STRIP]: VariableStripDocs,
  [DocsSectionId.UNNAMED_REFERENCES]: UnnamedReferencesDocs,
  [DocsSectionId.VARIABLE_DATE]: VariableDateDocs,
  [DocsSectionId.MULTILINE_REFERENCES]: MultilineReferencesDocs,
  [DocsSectionId.ESCAPING_BRACES]: EscapingBracesDocs,
  [DocsSectionId.TABS]: TabsDocs,
  [DocsSectionId.MULTI_SELECT]: MultiSelectDocs,
  [DocsSectionId.RUNBOOK_LIBRARY]: RunbookLibraryDocs,
  [DocsSectionId.READ_MODE]: ReadModeDocs,
  [DocsSectionId.EXPORT]: ExportDocs,
  [DocsSectionId.CLOUD_EXPORT]: CloudExportDocs,
  [DocsSectionId.CLOUD_LINKED_SYNC]: CloudLinkedSyncDocs,
  [DocsSectionId.CLOUD_FILE_MANAGEMENT]: CloudFileManagementDocs,
  [DocsSectionId.LANGUAGE]: LanguageDocs,
  [DocsSectionId.KEYBOARD_SHORTCUTS]: KeyboardShortcutsDocs,
  [DocsSectionId.QA]: QaDocs,
};
