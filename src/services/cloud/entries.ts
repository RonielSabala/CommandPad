import { JSON_EXTENSION } from "@/common/config";
import { CloudSortColumn, SortDirection } from "@/common/enums";
import { stripJsonExtension } from "@/utils/export";
import { compareNames, DIRECTION_SIGN } from "@/utils/sort";
import { claimUniqueName } from "@/utils/string";
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

/** A name for a copy of `entry`. */
export function buildDuplicateName(
  entry: CloudEntry,
  siblingNames: string[],
): string {
  const taken = new Set(
    [entry.name, ...siblingNames].map((name) => name.toLowerCase()),
  );

  return entry.isFolder
    ? claimUniqueName(taken, entry.name)
    : claimUniqueName(taken, stripJsonExtension(entry.name), JSON_EXTENSION);
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
      return entry.isFolder ? entry.itemCount : entry.size;
  }
}

function compareValues(a: string | number, b: string | number): number {
  return isString(a) && isString(b)
    ? compareNames(a, b)
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
      return byColumn * DIRECTION_SIGN[sort.direction];
    }
  }

  return compareNames(a.name, b.name);
}
