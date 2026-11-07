import { RunbookBlockConfig } from "@/common/config";
import type { EditorChoice } from "@/monaco/completions";

type FolderEntry = Omit<EditorChoice, "label" | "value" | "pinned"> & {
  name: string;
  label?: string;
};

export function folderPath(names: readonly string[]): string {
  return names.map((name) => name + RunbookBlockConfig.PATH_SEPARATOR).join("");
}

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
      value:
        path + name + (entry.folder ? RunbookBlockConfig.PATH_SEPARATOR : ""),
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
