import { RunbookBlockConfig } from "@/common/config";
import type { EditorChoice } from "@/monaco/completions";

import { folderPath } from "./path";

type FolderEntry = Omit<EditorChoice, "label" | "value" | "pinned"> & {
  name: string;
  label?: string;
};

/** A folder's entries, plus the way back up. */
export function folderChoices(
  path: string,
  names: readonly string[],
  entries: readonly FolderEntry[],
  parentDescription: string,
): EditorChoice[] {
  const choices = entries.map(
    ({ name, label = name, ...entry }): EditorChoice => ({
      ...entry,
      label,
      value: path + (entry.folder ? folderPath([name]) : name),
    }),
  );

  if (names.length > 0) {
    choices.push({
      label: RunbookBlockConfig.PARENT_FOLDER_LABEL,
      value: folderPath(names.slice(0, -1)),
      describe: () => parentDescription,
      folder: true,
      pinned: true,
    });
  }

  return choices;
}
