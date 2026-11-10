import { CloudSortColumn, SortDirection } from "@/common/enums";
import { describe, expect, it } from "vitest";

import { compareCloudEntries, isBrowsableEntry } from "./entries";
import type { CloudEntry } from "./types";

const entry = (name: string, modifiedAt: string | null = null): CloudEntry => ({
  id: name,
  name,
  isFolder: false,
  modifiedAt,
  size: null,
  itemCount: null,
});

const sortedNames = (
  entries: CloudEntry[],
  column: CloudSortColumn,
  direction: SortDirection,
) =>
  [...entries]
    .sort((a, b) => compareCloudEntries(a, b, { column, direction }))
    .map((e) => e.name);

describe("compareCloudEntries", () => {
  it("orders numbers in names by value", () => {
    const entries = ["file 10", "file 2", "file 1"].map((name) => entry(name));

    expect(
      sortedNames(entries, CloudSortColumn.NAME, SortDirection.ASC),
    ).toEqual(["file 1", "file 2", "file 10"]);
    expect(
      sortedNames(entries, CloudSortColumn.NAME, SortDirection.DESC),
    ).toEqual(["file 10", "file 2", "file 1"]);
  });

  it("breaks ties by name in the same order", () => {
    const same = "2026-01-01T00:00:00Z";
    const entries = [entry("b 10", same), entry("b 9", same)];

    expect(
      sortedNames(entries, CloudSortColumn.MODIFIED, SortDirection.DESC),
    ).toEqual(["b 9", "b 10"]);
  });
});

describe("isBrowsableEntry", () => {
  it("lists folders and JSON files whatever their extension's case", () => {
    expect(isBrowsableEntry({ ...entry("ops"), isFolder: true })).toBe(true);
    expect(isBrowsableEntry(entry("deploy.json"))).toBe(true);
    expect(isBrowsableEntry(entry("deploy.JSON"))).toBe(true);
    expect(isBrowsableEntry(entry("notes.txt"))).toBe(false);
  });
});
