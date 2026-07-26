import { JSON_EXTENSION } from "@/common/config";
import { CloudSortColumn, SortDirection } from "@/common/enums";
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
  return typeof a === "string" && typeof b === "string"
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
