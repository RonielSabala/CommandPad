import {
  DuplicateNameConfig,
  JSON_EXTENSION,
  LibraryFolderConfig,
  LibraryZipConfig,
  ZIP_EXTENSION,
  ZipConfig,
} from "@/common/config";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import type { Messages } from "@/i18n/types";

import { stripJsonExtension } from "./export";
import { generateId } from "./id";
import {
  displayFolderName,
  libraryChildren,
  uniqueFolderName,
} from "./libraryTree";
import { folderPath } from "./path";
import { displayLabel } from "./runbook";
import type { ZipEntry, ZipFile } from "./zip";
import { safeZipName, zipTreeFiles, type ZipTree } from "./zipTree";

interface ZipLibraryItem {
  folders: string[];
  runbook?: { entry: ZipEntry; filename: string };
}

interface FolderNode {
  folder: LibraryFolder;
}

interface RunbookNode {
  runbook: LibraryRunbook;
}

const ZIP_EXTENSION_REGEX = new RegExp(`\\${ZIP_EXTENSION}$`, "i");
const ZIP_PATH_SEPARATOR_REGEX = /[\\/]/;
const NO_NAME_PARTS: ReadonlySet<string> = new Set(["", ".", ".."]);

// Utils

export const isZipFilename = (name: string) => ZIP_EXTENSION_REGEX.test(name);

const clipFolderName = (name: string) =>
  name.slice(0, LibraryFolderConfig.NAME_MAX_LENGTH);

/** A folder's zip name. */
export function libraryZipName(
  folders: readonly LibraryFolder[],
  folderId: string | null,
  t: Messages,
): string {
  const folder = folders.find((f) => f.id === folderId);
  const name = folder
    ? safeZipName(displayFolderName(folder.name, t))
    : LibraryZipConfig.LIBRARY_NAME;

  return `${name}${ZIP_EXTENSION}`;
}

/** A folder as zip files. */
export function libraryZipFiles(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  folderId: string | null,
  readRunbook: (runbookId: string) => Promise<string>,
  t: Messages,
): Promise<ZipFile[]> {
  const { subfolders, contents } = libraryChildren(folders, runbooks);

  const level = (parentId: string | null): (FolderNode | RunbookNode)[] => [
    ...(subfolders.get(parentId) ?? []).map((folder) => ({ folder })),
    ...(contents.get(parentId) ?? []).map((runbook) => ({ runbook })),
  ];

  const tree: ZipTree<FolderNode, RunbookNode> = {
    children: ({ folder }) => level(folder.id),
    isFolder: (node) => "folder" in node,
    nameOf: (node) =>
      "folder" in node
        ? displayFolderName(node.folder.name, t)
        : stripJsonExtension(displayLabel(node.runbook.label, t)),
    read: ({ runbook }) => readRunbook(runbook.id),
    extension: JSON_EXTENSION,
  };

  const root = folders.find((f) => f.id === folderId);
  return zipTreeFiles(tree, root ? [{ folder: root }] : level(folderId));
}

/** The folders and runbooks a zip holds. */
function zipLibraryItems(entries: readonly ZipEntry[]): ZipLibraryItem[] {
  return entries.flatMap((entry) => {
    const parts = entry.path
      .split(ZIP_PATH_SEPARATOR_REGEX)
      .map((part) => part.trim());

    if (parts.includes(LibraryZipConfig.SYSTEM_FOLDER)) {
      return [];
    }

    // A folder's path ends in a separator, so its last part is empty
    const filename = parts.pop();
    const folders = parts.filter((part) => !NO_NAME_PARTS.has(part));

    if (!filename) {
      return [{ folders }];
    }

    return filename.toLowerCase().endsWith(JSON_EXTENSION)
      ? [{ folders, runbook: { entry, filename } }]
      : [];
  });
}

/** A new folder named after the zip, and where its contents land inside it. */
export function libraryZipImport(
  zipName: string,
  entries: readonly ZipEntry[],
  t: Messages,
) {
  const name = zipName.replace(ZIP_EXTENSION_REGEX, "");
  const items = zipLibraryItems(entries);

  const ownNames = [name, name.replace(DuplicateNameConfig.SUFFIX_REGEX, "")];
  const skipped = items.every(({ folders }) => ownNames.includes(folders[0]))
    ? 1
    : 0;

  const root: LibraryFolder = {
    id: generateId(),
    name: clipFolderName(name) || ZipConfig.FALLBACK_NAME,
    parentId: null,
  };

  const subfolders: LibraryFolder[] = [];
  const idsByPath = new Map<string, string>();

  const folderIdAt = (names: readonly string[]) => {
    let parentId = root.id;
    let path = "";

    for (const folder of names) {
      path += folderPath([folder]);

      let id = idsByPath.get(path);
      if (!id) {
        id = generateId();
        idsByPath.set(path, id);
        subfolders.push({
          id,
          name: uniqueFolderName(
            subfolders,
            parentId,
            clipFolderName(folder),
            t,
          ),
          parentId,
        });
      }

      parentId = id;
    }

    return parentId;
  };

  const runbooks = items.flatMap(({ folders, runbook }) => {
    const folderId = folderIdAt(folders.slice(skipped));
    return runbook ? [{ ...runbook, folderId }] : [];
  });

  return { root, subfolders, runbooks };
}
