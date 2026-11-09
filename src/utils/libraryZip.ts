import {
  JSON_EXTENSION,
  LibraryZipConfig,
  ZIP_EXTENSION,
} from "@/common/config";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import type { Messages } from "@/i18n/types";

import { stripJsonExtension } from "./export";
import { libraryChildren } from "./libraryTree";
import { displayLabel } from "./runbook";
import { buildDuplicateName } from "./string";
import { emptyZipFolder, textZipFile, type ZipFile } from "./zip";

const UNSAFE_CHARS_REGEX = /[<>:"/\\|?*\p{Cc}]/gu;
const UNSAFE_EDGES_REGEX = /^[\s.]+|[\s.]+$/g;

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

function folderPath(prefix: string, name: string): string {
  return `${prefix}${name}${LibraryZipConfig.PATH_SEPARATOR}`;
}

/** A folder's zip name. */
export function libraryZipName(
  folders: readonly LibraryFolder[],
  folderId: string | null,
): string {
  const folder = folders.find((f) => f.id === folderId);
  const name = folder ? safeName(folder.name) : LibraryZipConfig.LIBRARY_NAME;

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
      visit(folder.id, folderPath(prefix, claimName(taken, folder.name)));
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
  visit(folderId, root ? folderPath("", safeName(root.name)) : "");

  return Promise.all(files);
}
