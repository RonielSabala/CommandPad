import {
  ChoiceConfig,
  EditorLanguage,
  MonacoLayout,
  MonacoSuggest,
} from "@/common/editorConfig";
import { ANY, oneOrMore } from "@/common/regex";
import { isFunction } from "@/utils/typeGuards";
import type { editor, languages, Position } from "monaco-editor";

import { monaco } from "../setup";

export interface EditorChoice {
  label: string;
  value: string;
  /** Shown beside the label. */
  describe?: () => string | undefined | Promise<string | undefined>;
  /** Leads to more choices. */
  folder?: boolean;
  /** Listed first. */
  pinned?: boolean;
  onPick?: () => void;
}

export type ChoiceSource =
  | EditorChoice[]
  | ((text: string) => Promise<EditorChoice[]>);

const ChoiceWordRegex = new RegExp(oneOrMore(ANY));

/** What each choice editor offers, keyed by its model. */
export const modelChoices = new Map<string, ChoiceSource>();

function choiceRank(choice: EditorChoice): string {
  return choice.pinned
    ? ChoiceConfig.PINNED_RANK
    : choice.folder
      ? ChoiceConfig.FOLDER_RANK
      : ChoiceConfig.ITEM_RANK;
}

function choiceCommand(choice: EditorChoice): languages.Command | undefined {
  if (choice.folder) {
    return { id: MonacoSuggest.TRIGGER_ACTION_ID, title: "" };
  }

  return choice.onPick
    ? { id: ChoiceConfig.PICK_COMMAND_ID, title: "", arguments: [choice] }
    : undefined;
}

async function provideCompletionItems(
  model: editor.ITextModel,
  position: Position,
): Promise<languages.CompletionList> {
  const source = modelChoices.get(model.uri.toString());
  if (!source) {
    return { suggestions: [] };
  }

  const lineNumber = position.lineNumber;
  const text = model
    .getLineContent(lineNumber)
    .slice(0, position.column - MonacoLayout.FIRST_COLUMN);

  const range = new monaco.Range(
    lineNumber,
    MonacoLayout.FIRST_COLUMN,
    lineNumber,
    model.getLineMaxColumn(lineNumber),
  );

  const dynamic = isFunction(source);
  const choices = dynamic ? await source(text) : source;
  const details = await Promise.all(
    choices.map((choice) => choice.describe?.()),
  );

  return {
    incomplete: dynamic,
    suggestions: choices.map((choice, index) => ({
      label: choice.label,
      detail: details[index],
      kind: choice.folder
        ? monaco.languages.CompletionItemKind.Folder
        : monaco.languages.CompletionItemKind.File,
      insertText: choice.value,
      filterText: choice.pinned ? text : choice.value,
      sortText: choiceRank(choice) + choice.label,
      command: choiceCommand(choice),
      range,
    })),
  };
}

export function registerChoiceCompletions(): void {
  monaco.languages.register({ id: EditorLanguage.CHOICE });
  monaco.languages.setLanguageConfiguration(EditorLanguage.CHOICE, {
    wordPattern: ChoiceWordRegex,
  });

  monaco.languages.registerCompletionItemProvider(EditorLanguage.CHOICE, {
    provideCompletionItems,
  });

  monaco.editor.registerCommand(
    ChoiceConfig.PICK_COMMAND_ID,
    (_accessor, choice: EditorChoice) => choice.onPick?.(),
  );
}
