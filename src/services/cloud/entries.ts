import { JSON_EXTENSION } from "@/common/config";
import type { CloudEntry } from "./types";

export function isBrowsableEntry(entry: CloudEntry): boolean {
  return entry.isFolder || entry.name.endsWith(JSON_EXTENSION);
}

export function sortCloudEntries(entries: CloudEntry[]): CloudEntry[] {
  return [...entries].sort((a, b) => {
    const isFirstFolder = a.isFolder;
    if (isFirstFolder !== b.isFolder) {
      return isFirstFolder ? -1 : 1;
    }

    if (isFirstFolder) {
      return a.name.localeCompare(b.name);
    }

    return (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? "");
  });
}
