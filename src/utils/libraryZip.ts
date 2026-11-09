import {
  DuplicateNameConfig,
  JSON_EXTENSION,
  LibraryFolderConfig,
  LibraryZipConfig,
  ZIP_EXTENSION,
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
import { displayLabel } from "./runbook";
import { buildDuplicateName } from "./string";
import {
  emptyZipFolder,
  textZipFile,
  type ZipEntry,
  type ZipFile,
} from "./zip";

interface ZipLibraryItem {
  folders: string[];
  runbook?: { entry: ZipEntry; filename: string };
}

const UNSAFE_CHARS_REGEX = /[<>:"/\\|?*\p{Cc}]/gu;
const UNSAFE_EDGES_REGEX = /^[\s.]+|[\s.]+$/g;
const ZIP_EXTENSION_REGEX = new RegExp(`\\${ZIP_EXTENSION}$`, "i");
const ZIP_PATH_SEPARATOR_REGEX = /[\\/]/;
const NO_NAME_PARTS: ReadonlySet<string> = new Set(["", ".", ".."]);

// Utils

export const isZipFilename = (name: string) => ZIP_EXTENSION_REGEX.test(name);

function folderPath(prefix: string, name: string): string {
  return `${prefix}${name}${LibraryZipConfig.PATH_SEPARATOR}`;
}

const clipFolderName = (name: string) =>
  name.slice(0, LibraryFolderConfig.NAME_MAX_LENGTH);

/** `name` as a path part any file system can extract. */
function safeName(name: string): string {
  const safe = name
    .replace(UNSAFE_CHARS_REGEX, LibraryZipConfig.UNSAFE_CHAR_REPLACEMENT)
    .replace(UNSAFE_EDGES_REGEX, "");

  return safe || LibraryZipConfig.FALLBACK_NAME;
}

/** `name`, numbered past its siblings, which may only differ by case. */
function claimName(taken: Set<string>, name: string, extension = ""): string {
  const isTaken = (stem: string) =>
    taken.has(`${stem}${extension}`.toLowerCase());

  const safe = safeName(name);
  const stem = isTaken(safe) ? buildDuplicateName(safe, isTaken) : safe;
  const claimed = `${stem}${extension}`;

  taken.add(claimed.toLowerCase());
  return claimed;
}

/** A folder's zip name. */
export function libraryZipName(
  folders: readonly LibraryFolder[],
  folderId: string | null,
  t: Messages,
): string {
  const folder = folders.find((f) => f.id === folderId);
  const name = folder
    ? safeName(displayFolderName(folder.name, t))
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
  const files: (ZipFile | Promise<ZipFile>)[] = [];

  const visit = (parentId: string | null, prefix: string) => {
    const levelFolders = subfolders.get(parentId);
    const levelRunbooks = contents.get(parentId);

    if (prefix && !levelFolders && !levelRunbooks) {
      files.push(emptyZipFolder(prefix));
      return;
    }

    const taken = new Set<string>();

    for (const folder of levelFolders ?? []) {
      visit(
        folder.id,
        folderPath(prefix, claimName(taken, displayFolderName(folder.name, t))),
      );
    }

    for (const runbook of levelRunbooks ?? []) {
      const path = `${prefix}${claimName(
        taken,
        stripJsonExtension(displayLabel(runbook.label, t)),
        JSON_EXTENSION,
      )}`;

      files.push(
        readRunbook(runbook.id).then((text) => textZipFile(path, text)),
      );
    }
  };

  const root = folders.find((f) => f.id === folderId);
  visit(
    folderId,
    root ? folderPath("", safeName(displayFolderName(root.name, t))) : "",
  );

  return Promise.all(files);
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
    name: clipFolderName(name) || LibraryZipConfig.FALLBACK_NAME,
    parentId: null,
  };

  const subfolders: LibraryFolder[] = [];
  const idsByPath = new Map<string, string>();

  const folderIdAt = (names: readonly string[]) => {
    let parentId = root.id;
    let path = "";

    for (const folder of names) {
      path = folderPath(path, folder);

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
