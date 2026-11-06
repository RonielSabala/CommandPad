import { LibraryItemKind } from "@/common/enums";
import type { LibraryFolder, RunbookEntry } from "@/common/types";

import { buildDuplicateName, matchesQuery } from "./string";

export type LibraryRow =
  | {
      kind: typeof LibraryItemKind.FOLDER;
      folder: LibraryFolder;
      depth: number;
    }
  | {
      kind: typeof LibraryItemKind.RUNBOOK;
      runbook: RunbookEntry;
      depth: number;
      /** The names of the folders holding it. */
      path: readonly string[];
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

const folderParent = (folder: LibraryFolder) => folder.parentId;
const runbookParent = (runbook: RunbookEntry) => runbook.folderId ?? null;

/** The rows the library list shows. */
export function libraryRows(
  folders: readonly LibraryFolder[],
  runbooks: readonly RunbookEntry[],
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
      if (matchesQuery(query, runbook.label, runbook.filename, ...path)) {
        rows.push({ kind: LibraryItemKind.RUNBOOK, runbook, depth, path });
      }
    }
  };

  visit(null, 0, EMPTY_PATH);
  return rows;
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

export function uniqueFolderName(
  folders: readonly LibraryFolder[],
  parentId: string | null,
  base: string,
): string {
  const taken = new Set(
    folders.filter((f) => f.parentId === parentId).map((f) => f.name),
  );

  return taken.has(base)
    ? buildDuplicateName(base, (candidate) => taken.has(candidate))
    : base;
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

/** Re-root what stored data left dangling. */
export function repairLibrary(
  folders: LibraryFolder[],
  runbooks: RunbookEntry[],
): { folders: LibraryFolder[]; runbooks: RunbookEntry[] } {
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

  return {
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
}
