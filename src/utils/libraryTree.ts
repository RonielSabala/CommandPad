import { DuplicateNameConfig, LibraryFolderConfig } from "@/common/config";
import {
  LibraryDropZone,
  LibraryItemKind,
  type QueryMatch,
  type SortDirection,
} from "@/common/enums";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import type { Messages } from "@/i18n/types";

import { folderPath, joinPath } from "./path";
import { displayLabel } from "./runbook";
import { isOutOfOrder, sortedByName } from "./sort";
import { buildDuplicateName, matchesQuery, queryMatch } from "./string";

// Types

export type LibraryRow =
  | {
      kind: typeof LibraryItemKind.FOLDER;
      folder: LibraryFolder;
      depth: number;
      empty: boolean;
    }
  | {
      kind: typeof LibraryItemKind.RUNBOOK;
      runbook: LibraryRunbook;
      depth: number;
      /** The names of the folders holding it. */
      path?: readonly string[];
    };

export type LibraryRunbookListing = Extract<
  LibraryRow,
  { kind: typeof LibraryItemKind.RUNBOOK }
> & { path: readonly string[] };

interface LibraryItems {
  folders: LibraryFolder[];
  runbooks: LibraryRunbook[];
}

const EMPTY_PATH: readonly string[] = Object.freeze([]);

// Utils

const folderName = (t: Messages) => (folder: LibraryFolder) =>
  displayFolderName(folder.name, t);
const storedFolderName = (folder: LibraryFolder) => folder.name;
const asShown = (name: string) => name;
const folderParent = (folder: LibraryFolder) => folder.parentId;
const runbookParent = (runbook: LibraryRunbook) => runbook.folderId ?? null;
const runbookName = (t: Messages) => (runbook: LibraryRunbook) =>
  displayLabel(runbook.label, t);

/** A folder's name as shown. */
export function displayFolderName(name: string, t: Messages): string {
  const { DEFAULT_NAME } = LibraryFolderConfig;
  if (!name.startsWith(DEFAULT_NAME)) {
    return name;
  }

  const suffix = name.slice(DEFAULT_NAME.length);
  return suffix.replace(DuplicateNameConfig.SUFFIX_REGEX, "")
    ? name
    : t.runbooks.folderName + suffix;
}

export const libraryRowKey = (row: LibraryRow) =>
  row.kind === LibraryItemKind.FOLDER ? row.folder.id : row.runbook.id;

export const libraryPath = (names: readonly string[]) =>
  LibraryFolderConfig.ROOT_PATH + joinPath(names);

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

/** What sits directly inside every folder. */
export function libraryChildren(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
) {
  return {
    subfolders: groupByParent(folders, folderParent),
    contents: groupByParent(runbooks, runbookParent),
  };
}

/** The rows the library list shows. */
export function libraryRows(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  query: string,
  t: Messages,
): LibraryRow[] {
  if (query) {
    return foundRunbooks(folders, runbooks, query, t);
  }

  const { subfolders, contents } = libraryChildren(folders, runbooks);
  const rows: LibraryRow[] = [];

  const visit = (parentId: string | null, depth: number) => {
    for (const folder of subfolders.get(parentId) ?? []) {
      const folderId = folder.id;
      rows.push({
        kind: LibraryItemKind.FOLDER,
        folder,
        depth,
        empty: !subfolders.has(folderId) && !contents.has(folderId),
      });

      if (!folder.collapsed) {
        visit(folderId, depth + 1);
      }
    }

    for (const runbook of contents.get(parentId) ?? []) {
      rows.push({ kind: LibraryItemKind.RUNBOOK, runbook, depth });
    }
  };

  visit(null, 0);
  return rows;
}

/** Every runbook `query` finds, closest name first. */
export function foundRunbooks(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  query: string,
  t: Messages,
  recentIds: readonly string[] = [],
): LibraryRunbookListing[] {
  const { subfolders, contents } = libraryChildren(folders, runbooks);
  const recency = new Map(recentIds.map((id, index) => [id, index]));
  const found: {
    listing: LibraryRunbookListing;
    match: QueryMatch;
    recency: number;
  }[] = [];

  const nameFolder = folderName(t);
  const nameRunbook = runbookName(t);

  const visit = (parentId: string | null, path: readonly string[]) => {
    for (const folder of subfolders.get(parentId) ?? []) {
      visit(folder.id, [...path, nameFolder(folder)]);
    }

    for (const runbook of contents.get(parentId) ?? []) {
      const name = nameRunbook(runbook);

      if (matchesQuery(query, libraryPath([...path, name]), runbook.filename)) {
        found.push({
          listing: { kind: LibraryItemKind.RUNBOOK, runbook, depth: 0, path },
          match: queryMatch(query, name),
          recency: recency.get(runbook.id) ?? recentIds.length,
        });
      }
    }
  };

  visit(null, EMPTY_PATH);

  return found
    .sort((a, b) => a.match - b.match || a.recency - b.recency)
    .map(({ listing }) => listing);
}

/** The runbooks the library list shows. */
export function visibleRunbooks(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  query: string,
  t: Messages,
): LibraryRunbook[] {
  return libraryRows(folders, runbooks, query, t).flatMap((row) =>
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

/** Whether toggling acts as a collapse. */
export function collapsesSubtree(
  folders: readonly LibraryFolder[],
  folderId: string | null,
): boolean {
  return folders.some(
    (f) =>
      !f.collapsed &&
      (folderId === null ? f.parentId === null : f.id === folderId),
  );
}

/** Collapse or expand a folder and all its subfolders. */
export function withSubtreeToggled(
  folders: LibraryFolder[],
  folderId: string | null,
): LibraryFolder[] {
  const collapsed = collapsesSubtree(folders, folderId);
  const subtree = folderId === null ? null : folderSubtree(folders, folderId);

  return folders.map((f) =>
    (!subtree || subtree.has(f.id)) && !!f.collapsed !== collapsed
      ? { ...f, collapsed }
      : f,
  );
}

/** A folder and the folders holding it, innermost first. */
function folderTrail(
  folders: readonly LibraryFolder[],
  folderId: string | null | undefined,
): Set<LibraryFolder> {
  const trail = new Set<LibraryFolder>();
  const byId = new Map<string | null, LibraryFolder>(
    folders.map((f) => [f.id, f]),
  );

  for (
    let folder = byId.get(folderId ?? null);
    folder && !trail.has(folder);
    folder = byId.get(folder.parentId)
  ) {
    trail.add(folder);
  }

  return trail;
}

/** Where a folder's contents live. */
export function folderLocation(
  folders: readonly LibraryFolder[],
  folderId: string | null,
  t: Messages,
): string {
  const nameFolder = folderName(t);
  const names = [...folderTrail(folders, folderId)].reverse().map(nameFolder);

  return LibraryFolderConfig.ROOT_PATH + folderPath(names);
}

/** What sits directly inside a folder. */
export function libraryLevel(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  parentId: string | null,
): LibraryItems {
  return {
    folders: folders.filter((f) => folderParent(f) === parentId),
    runbooks: runbooks.filter((r) => runbookParent(r) === parentId),
  };
}

/** Whether what sits directly inside a folder is out of `direction` order. */
export function isLibraryLevelOutOfOrder(
  folders: readonly LibraryFolder[],
  runbooks: readonly LibraryRunbook[],
  parentId: string | null,
  direction: SortDirection,
  t: Messages,
): boolean {
  const level = libraryLevel(folders, runbooks, parentId);

  return (
    isOutOfOrder(level.folders, folderName(t), direction) ||
    isOutOfOrder(level.runbooks, runbookName(t), direction)
  );
}

/** Sort the items of one parent. */
function withChildrenSorted<T>(
  items: T[],
  parentOf: (item: T) => string | null,
  nameOf: (item: T) => string,
  parentId: string | null,
  direction: SortDirection,
): T[] {
  const isChild = (item: T) => parentOf(item) === parentId;
  const sorted = sortedByName(items.filter(isChild), nameOf, direction);

  if (!sorted) {
    return items;
  }

  let next = 0;
  return items.map((item) => (isChild(item) ? sorted[next++] : item));
}

/** Sort what sits directly inside a folder, folders and runbooks apart. */
export function withLibraryLevelSorted(
  folders: LibraryFolder[],
  runbooks: LibraryRunbook[],
  parentId: string | null,
  direction: SortDirection,
  t: Messages,
): LibraryItems {
  return {
    folders: withChildrenSorted(
      folders,
      folderParent,
      folderName(t),
      parentId,
      direction,
    ),
    runbooks: withChildrenSorted(
      runbooks,
      runbookParent,
      runbookName(t),
      parentId,
      direction,
    ),
  };
}

/** The folders a typed path has fully spelled. */
export function libraryPathTrail(
  folders: readonly LibraryFolder[],
  text: string,
  t: Messages,
): LibraryFolder[] {
  const nameFolder = folderName(t);
  const trail: LibraryFolder[] = [];
  let rest = text;

  for (;;) {
    const parentId = trail.at(-1)?.id ?? null;
    const prefix = rest;
    const next = folders.find(
      (f) =>
        f.parentId === parentId &&
        prefix.startsWith(folderPath([nameFolder(f)])),
    );

    if (!next) {
      return trail;
    }

    trail.push(next);
    rest = rest.slice(folderPath([nameFolder(next)]).length);
  }
}

/** `name` numbered past what its siblings show, each name shown by `show`. */
function numberedPastSiblings<T extends { id: string }>(
  items: readonly T[],
  parentOf: (item: T) => string | null,
  nameOf: (item: T) => string,
  show: (name: string) => string,
  parentId: string | null,
  name: string,
  exceptId?: string,
): string | null {
  const taken = new Set<string>();

  for (const item of items) {
    if (parentOf(item) === parentId && item.id !== exceptId) {
      taken.add(show(nameOf(item)));
    }
  }

  if (!taken.has(show(name))) {
    return null;
  }

  return buildDuplicateName(name, (candidate) => taken.has(show(candidate)));
}

/** `base`, numbered if a sibling folder already has it. */
export function uniqueFolderName(
  folders: readonly LibraryFolder[],
  parentId: string | null,
  base: string,
  t: Messages,
  exceptId?: string,
): string {
  return (
    numberedPastSiblings(
      folders,
      folderParent,
      storedFolderName,
      (name) => displayFolderName(name, t),
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
      runbookName(t),
      asShown,
      folderId ?? null,
      displayLabel(label, t),
      exceptId,
    ) ?? label
  );
}

/** Rename each item after the first showing a name in its folder. */
function withNumberedDuplicates<T extends { id: string }>(
  items: T[],
  parentOf: (item: T) => string | null,
  nameOf: (item: T) => string,
  show: (name: string) => string,
  rename: (item: T, name: string) => T,
): T[] {
  const renamed = new Map<string, T>();

  for (const group of groupByParent(items, parentOf).values()) {
    const names = group.map(nameOf);
    const shownNames = names.map(show);
    const taken = new Set(shownNames);
    const seen = new Set<string>();

    group.forEach((item, index) => {
      const shown = shownNames[index];

      if (seen.has(shown) && shown.trim()) {
        const numbered = buildDuplicateName(names[index], (candidate) =>
          taken.has(show(candidate)),
        );
        taken.add(show(numbered));
        renamed.set(item.id, rename(item, numbered));
      }

      seen.add(shown);
    });
  }

  return renamed.size > 0
    ? items.map((item) => renamed.get(item.id) ?? item)
    : items;
}

/** Expand a folder and every folder holding it. */
export function withFolderExpanded(
  folders: LibraryFolder[],
  folderId: string | null | undefined,
): LibraryFolder[] {
  const trail = folderTrail(folders, folderId);
  const isHidden = (f: LibraryFolder) => f.collapsed && trail.has(f);

  return folders.some(isHidden)
    ? folders.map((f) => (isHidden(f) ? { ...f, collapsed: false } : f))
    : folders;
}

/** Where a drag lands at `fraction` down a row. */
export function libraryDropZone(
  sourceKind: LibraryItemKind,
  targetKind: LibraryItemKind,
  targetShowsContents: boolean,
  fraction: number,
): LibraryDropZone | null {
  if (sourceKind === LibraryItemKind.RUNBOOK) {
    if (targetKind === LibraryItemKind.FOLDER) {
      return LibraryDropZone.INTO;
    }

    return fraction < LibraryFolderConfig.DROP_MIDDLE_FRACTION
      ? LibraryDropZone.BEFORE
      : LibraryDropZone.AFTER;
  }

  if (targetKind === LibraryItemKind.RUNBOOK) {
    return null;
  }

  if (fraction < LibraryFolderConfig.DROP_EDGE_FRACTION) {
    return LibraryDropZone.BEFORE;
  }

  return fraction > 1 - LibraryFolderConfig.DROP_EDGE_FRACTION &&
    !targetShowsContents
    ? LibraryDropZone.AFTER
    : LibraryDropZone.INTO;
}

function dropParent<T extends { id: string }>(
  items: readonly T[],
  parentOf: (item: T) => string | null,
  targetId: string | null,
  zone: LibraryDropZone,
): string | null {
  if (zone === LibraryDropZone.INTO) {
    return targetId;
  }

  const target = items.find((item) => item.id === targetId);
  return target ? parentOf(target) : null;
}

/** The folder a dropped folder ends up in. */
export const libraryFolderDropParent = (
  folders: readonly LibraryFolder[],
  targetId: string | null,
  zone: LibraryDropZone,
) => dropParent(folders, folderParent, targetId, zone);

/** The folder a dropped runbook ends up in. */
export const libraryRunbookDropParent = (
  runbooks: readonly LibraryRunbook[],
  targetId: string | null,
  zone: LibraryDropZone,
) => dropParent(runbooks, runbookParent, targetId, zone);

/** Move one item beside `targetId`, or to the end if dropped into a folder. */
export function withLibraryItemMoved<T extends { id: string }>(
  items: readonly T[],
  id: string,
  patch: (item: T) => T,
  targetId: string | null,
  zone: LibraryDropZone,
): T[] {
  const rest: T[] = [];
  let moved: T | undefined;

  for (const item of items) {
    if (item.id === id) {
      moved = patch(item);
    } else {
      rest.push(item);
    }
  }

  if (!moved) {
    return [...items];
  }

  const targetIndex =
    zone === LibraryDropZone.INTO
      ? -1
      : rest.findIndex((item) => item.id === targetId);

  if (targetIndex < 0) {
    return [...rest, moved];
  }

  rest.splice(
    zone === LibraryDropZone.AFTER ? targetIndex + 1 : targetIndex,
    0,
    moved,
  );

  return rest;
}

/** Re-root what stored data left dangling and number clashing names. */
export function repairLibrary(
  folders: LibraryFolder[],
  runbooks: LibraryRunbook[],
  t: Messages,
): LibraryItems {
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
      storedFolderName,
      (name) => displayFolderName(name, t),
      (folder, name) => ({ ...folder, name }),
    ),
    runbooks: withNumberedDuplicates(
      rooted.runbooks,
      runbookParent,
      runbookName(t),
      asShown,
      (runbook, label) => ({ ...runbook, label }),
    ),
  };
}
