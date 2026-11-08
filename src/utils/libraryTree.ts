import { LibraryFolderConfig, RunbookBlockConfig } from "@/common/config";
import { LibraryItemKind } from "@/common/enums";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import type { Messages } from "@/i18n/types";

import { displayLabel } from "./runbook";
import { buildDuplicateName, matchesQuery } from "./string";

export type LibraryRow =
  | {
      kind: typeof LibraryItemKind.FOLDER;
      folder: LibraryFolder;
      depth: number;
    }
  | {
      kind: typeof LibraryItemKind.RUNBOOK;
      runbook: LibraryRunbook;
      depth: number;
      /** The names of the folders holding it. */
      path?: readonly string[];
    };

const EMPTY_PATH: readonly string[] = Object.freeze([]);

function groupByParent<T>(
  items: readonly T[],
  parentOf: (item: T) => string | null,
): Map<string | null, T[]> {
  const groups = new Map<string | null, T[]>();

  for (const item of items) {
    const parentId = parentOf(item);
    const group = groups.get(parentId);

    if (group) {
      group.push(item);
    } else {
      groups.set(parentId, [item]);
    }
  }

  return groups;
}

const folderName = (folder: LibraryFolder) => folder.name;
const folderParent = (folder: LibraryFolder) => folder.parentId;
const runbookParent = (runbook: LibraryRunbook) => runbook.folderId ?? null;

/** The rows the library list shows. */
export function libraryRows(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  query: string,
): LibraryRow[] {
  const subfolders = groupByParent(folders, folderParent);
  const contents = groupByParent(runbooks, runbookParent);
  const rows: LibraryRow[] = [];

  const visit = (
    parentId: string | null,
    depth: number,
    path: readonly string[],
  ) => {
    for (const folder of subfolders.get(parentId) ?? []) {
      if (query) {
        visit(folder.id, depth, [...path, folder.name]);
        continue;
      }

      rows.push({ kind: LibraryItemKind.FOLDER, folder, depth });
      if (!folder.collapsed) {
        visit(folder.id, depth + 1, path);
      }
    }

    for (const runbook of contents.get(parentId) ?? []) {
      const location =
        LibraryFolderConfig.ROOT_PATH +
        [...path, runbook.label].join(LibraryFolderConfig.PATH_SEPARATOR);

      if (matchesQuery(query, location, runbook.filename)) {
        rows.push({
          kind: LibraryItemKind.RUNBOOK,
          runbook,
          depth,
          path: query ? path : undefined,
        });
      }
    }
  };

  visit(null, 0, EMPTY_PATH);
  return rows;
}

/** The runbooks the library list shows. */
export function visibleRunbooks(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  query: string,
): LibraryRunbook[] {
  return libraryRows(folders, runbooks, query).flatMap((row) =>
    row.kind === LibraryItemKind.RUNBOOK ? [row.runbook] : [],
  );
}

/** The folder and every folder nested inside it. */
export function folderSubtree(
  folders: readonly LibraryFolder[],
  folderId: string,
): Set<string> {
  const subfolders = groupByParent(folders, folderParent);
  const ids = new Set([folderId]);

  for (const id of ids) {
    for (const child of subfolders.get(id) ?? []) {
      ids.add(child.id);
    }
  }

  return ids;
}

/** Where a folder's contents live. */
export function folderLocation(
  folders: readonly LibraryFolder[],
  folderId: string | null,
): string {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const names: string[] = [];
  const seen = new Set<string>();

  for (
    let folder = folderId ? byId.get(folderId) : undefined;
    folder && !seen.has(folder.id);
    folder = folder.parentId ? byId.get(folder.parentId) : undefined
  ) {
    seen.add(folder.id);
    names.push(folder.name + LibraryFolderConfig.PATH_SEPARATOR);
  }

  return LibraryFolderConfig.ROOT_PATH + names.reverse().join("");
}

/** What sits directly inside a folder. */
export function libraryLevel(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  parentId: string | null,
): { folders: LibraryFolder[]; runbooks: LibraryRunbook[] } {
  return {
    folders: folders.filter((f) => folderParent(f) === parentId),
    runbooks: runbooks.filter((r) => runbookParent(r) === parentId),
  };
}

/** The folders a typed path has fully spelled. */
export function libraryPathTrail(
  folders: readonly LibraryFolder[],
  text: string,
): LibraryFolder[] {
  const separator = RunbookBlockConfig.PATH_SEPARATOR;
  const trail: LibraryFolder[] = [];
  let rest = text;

  for (;;) {
    const parentId = trail.at(-1)?.id ?? null;
    const prefix = rest;
    const next = folders.find(
      (f) => f.parentId === parentId && prefix.startsWith(f.name + separator),
    );

    if (!next) {
      return trail;
    }

    trail.push(next);
    rest = rest.slice(next.name.length + separator.length);
  }
}

/** `name` numbered past what its siblings are called. */
function numberedPastSiblings<T extends { id: string }>(
  items: readonly T[],
  parentOf: (item: T) => string | null,
  nameOf: (item: T) => string,
  parentId: string | null,
  name: string,
  exceptId?: string,
): string | null {
  const isSibling = (item: T) =>
    parentOf(item) === parentId && item.id !== exceptId;

  if (!items.some((item) => isSibling(item) && nameOf(item) === name)) {
    return null;
  }

  const taken = new Set(items.filter(isSibling).map(nameOf));
  return buildDuplicateName(name, (candidate) => taken.has(candidate));
}

/** `base`, numbered if a sibling folder already has it. */
export function uniqueFolderName(
  folders: readonly LibraryFolder[],
  parentId: string | null,
  base: string,
  exceptId?: string,
): string {
  return (
    numberedPastSiblings(
      folders,
      folderParent,
      folderName,
      parentId,
      base,
      exceptId,
    ) ?? base
  );
}

/** `label`, numbered if the folder already shows it. */
export function uniqueRunbookLabel(
  runbooks: readonly LibraryRunbook[],
  folderId: string | undefined,
  label: string,
  t: Messages,
  exceptId?: string,
): string {
  return (
    numberedPastSiblings(
      runbooks,
      runbookParent,
      (runbook) => displayLabel(runbook.label, t),
      folderId ?? null,
      displayLabel(label, t),
      exceptId,
    ) ?? label
  );
}

/** Rename each item after the first sharing a name in its folder. */
function withNumberedDuplicates<T extends { id: string }>(
  items: T[],
  parentOf: (item: T) => string | null,
  nameOf: (item: T) => string,
  rename: (item: T, name: string) => T,
): T[] {
  const renamed = new Map<string, T>();

  for (const group of groupByParent(items, parentOf).values()) {
    const names = group.map(nameOf);
    const taken = new Set(names);
    const seen = new Set<string>();

    group.forEach((item, index) => {
      const name = names[index];

      if (seen.has(name) && name.trim()) {
        const numbered = buildDuplicateName(name, (candidate) =>
          taken.has(candidate),
        );
        taken.add(numbered);
        renamed.set(item.id, rename(item, numbered));
      }

      seen.add(name);
    });
  }

  return renamed.size > 0
    ? items.map((item) => renamed.get(item.id) ?? item)
    : items;
}

/** Expand one folder. */
export function withFolderExpanded(
  folders: LibraryFolder[],
  folderId: string | null | undefined,
): LibraryFolder[] {
  return folders.some((f) => f.id === folderId && f.collapsed)
    ? folders.map((f) => (f.id === folderId ? { ...f, collapsed: false } : f))
    : folders;
}

/** Re-root what stored data left dangling and number clashing names. */
export function repairLibrary(
  folders: LibraryFolder[],
  runbooks: LibraryRunbook[],
  t: Messages,
): { folders: LibraryFolder[]; runbooks: LibraryRunbook[] } {
  const parents = new Map(folders.map((f) => [f.id, f.parentId]));

  for (const [id, parentId] of parents) {
    if (parentId !== null && !parents.has(parentId)) {
      parents.set(id, null);
    }
  }

  // Walking up from a folder in a cycle meets a folder twice
  for (const id of parents.keys()) {
    const seen = new Set<string>();
    let current: string | null = id;

    while (current !== null && !seen.has(current)) {
      seen.add(current);
      current = parents.get(current) ?? null;
    }

    if (current !== null) {
      parents.set(current, null);
    }
  }

  const rooted = {
    folders: folders.map((f) =>
      parents.get(f.id) === f.parentId
        ? f
        : { ...f, parentId: parents.get(f.id) ?? null },
    ),
    runbooks: runbooks.map((r) =>
      r.folderId === undefined || parents.has(r.folderId)
        ? r
        : { ...r, folderId: undefined },
    ),
  };

  return {
    folders: withNumberedDuplicates(
      rooted.folders,
      folderParent,
      folderName,
      (folder, name) => ({ ...folder, name }),
    ),
    runbooks: withNumberedDuplicates(
      rooted.runbooks,
      runbookParent,
      (runbook) => displayLabel(runbook.label, t),
      (runbook, label) => ({ ...runbook, label }),
    ),
  };
}
