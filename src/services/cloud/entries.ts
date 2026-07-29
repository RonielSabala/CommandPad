import { JSON_EXTENSION } from "@/common/config";
import { CloudSortColumn, SortDirection } from "@/common/enums";
import { stripJsonExtension } from "@/utils/export";
import { buildDuplicateName as nextDuplicateName } from "@/utils/string";
import { isString } from "@/utils/typeGuards";
import type { CloudEntry } from "./types";

export interface CloudSort {
  column: CloudSortColumn;
  direction: SortDirection;
}

export const DEFAULT_CLOUD_SORT: CloudSort = {
  column: CloudSortColumn.MODIFIED,
  direction: SortDirection.DESC,
};

export function isBrowsableEntry(entry: CloudEntry): boolean {
  return entry.isFolder || entry.name.endsWith(JSON_EXTENSION);
}

export function buildDuplicateName(
  entry: CloudEntry,
  siblings: CloudEntry[],
): string {
  const base = entry.isFolder ? entry.name : stripJsonExtension(entry.name);
  const extension = entry.isFolder ? "" : JSON_EXTENSION;
  const taken = new Set(siblings.map((other) => other.name.toLowerCase()));

  return (
    nextDuplicateName(base, (candidate) =>
      taken.has(`${candidate}${extension}`.toLowerCase()),
    ) + extension
  );
}

function columnValue(
  entry: CloudEntry,
  column: CloudSortColumn,
): string | number | null {
  switch (column) {
    case CloudSortColumn.NAME:
      return entry.name;
    case CloudSortColumn.MODIFIED:
      return entry.modifiedAt;
    case CloudSortColumn.SIZE:
      return entry.size;
  }
}

function compareValues(a: string | number, b: string | number): number {
  return isString(a) && isString(b)
    ? a.localeCompare(b)
    : Number(a) - Number(b);
}

export function compareCloudEntries(
  a: CloudEntry,
  b: CloudEntry,
  sort: CloudSort = DEFAULT_CLOUD_SORT,
): number {
  const first = columnValue(a, sort.column);
  const second = columnValue(b, sort.column);

  if (first === null || second === null) {
    if (first !== second) {
      return first === null ? 1 : -1;
    }
  } else {
    const byColumn = compareValues(first, second);
    if (byColumn !== 0) {
      return byColumn * (sort.direction === SortDirection.ASC ? 1 : -1);
    }
  }

  return a.name.localeCompare(b.name);
}
