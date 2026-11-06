import { LibraryItemKind } from "@/common/enums";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { describe, expect, it } from "vitest";

import {
  folderSubtree,
  libraryRows,
  repairLibrary,
  uniqueFolderName,
  withFolderExpanded,
} from "./libraryTree";

function folder(
  id: string,
  parentId: string | null = null,
  collapsed?: boolean,
): LibraryFolder {
  return { id, name: id, parentId, collapsed };
}

function runbook(id: string, folderId?: string): LibraryRunbook {
  return { id, label: id, filename: `${id}.json`, folderId };
}

/** Each row as `depth:id`. */
const describeRows = (
  folders: LibraryFolder[],
  runbooks: LibraryRunbook[],
  query = "",
) =>
  libraryRows(folders, runbooks, query).map((row) =>
    row.kind === LibraryItemKind.FOLDER
      ? `${row.depth}:${row.folder.id}/`
      : `${row.depth}:${row.runbook.id}`,
  );

describe("libraryRows", () => {
  const folders = [folder("ops"), folder("db", "ops"), folder("web")];
  const runbooks = [
    runbook("deploy", "ops"),
    runbook("backup", "db"),
    runbook("readme"),
    runbook("restore", "db"),
  ];

  it("lists subfolders before runbooks, depth first", () => {
    expect(describeRows(folders, runbooks)).toEqual([
      "0:ops/",
      "1:db/",
      "2:backup",
      "2:restore",
      "1:deploy",
      "0:web/",
      "0:readme",
    ]);
  });

  it("hides what a collapsed folder holds", () => {
    const collapsed = [folder("ops", null, true), folder("db", "ops")];
    expect(describeRows(collapsed, runbooks)).toEqual(["0:ops/", "0:readme"]);
  });

  it("lists matching runbooks flat with their path, ignoring folding", () => {
    const collapsed = [folder("ops", null, true), folder("db", "ops")];
    const rows = libraryRows(collapsed, runbooks, "back");

    expect(rows).toEqual([
      {
        kind: LibraryItemKind.RUNBOOK,
        runbook: runbooks[1],
        depth: 0,
        path: ["ops", "db"],
      },
    ]);
  });

  it("gives a path only to search results", () => {
    const pathOf = (query: string) =>
      libraryRows([], [runbook("top")], query).map((row) =>
        row.kind === LibraryItemKind.RUNBOOK ? row.path : null,
      );

    expect(pathOf("")).toEqual([undefined]);
    expect(pathOf("top")).toEqual([[]]);
  });

  it("matches a runbook by the folders holding it", () => {
    expect(describeRows(folders, runbooks, "db")).toEqual([
      "0:backup",
      "0:restore",
    ]);
  });
});

describe("folderSubtree", () => {
  it("collects the folder and everything nested in it", () => {
    const folders = [
      folder("c", "b"),
      folder("a"),
      folder("b", "a"),
      folder("x"),
    ];

    expect(folderSubtree(folders, "a")).toEqual(new Set(["a", "b", "c"]));
    expect(folderSubtree(folders, "x")).toEqual(new Set(["x"]));
  });

  it("stops at a cycle", () => {
    const folders = [folder("a", "b"), folder("b", "a")];
    expect(folderSubtree(folders, "a")).toEqual(new Set(["a", "b"]));
  });
});

describe("uniqueFolderName", () => {
  it("numbers a name its siblings already use", () => {
    const folders = [
      { ...folder("1"), name: "New folder" },
      { ...folder("2"), name: "New folder (1)" },
      { ...folder("3", "1"), name: "Other" },
    ];

    expect(uniqueFolderName(folders, null, "New folder")).toBe(
      "New folder (2)",
    );
    expect(uniqueFolderName(folders, "1", "New folder")).toBe("New folder");
  });
});

describe("withFolderExpanded", () => {
  it("expands a collapsed folder and keeps an expanded one", () => {
    const folders = [folder("a", null, true), folder("b")];

    expect(withFolderExpanded(folders, "a")[0].collapsed).toBe(false);
    expect(withFolderExpanded(folders, "b")).toBe(folders);
    expect(withFolderExpanded(folders, null)).toBe(folders);
  });
});

describe("repairLibrary", () => {
  it("re-roots a folder whose parent is missing", () => {
    const { folders } = repairLibrary([folder("a", "gone")], []);
    expect(folders[0].parentId).toBeNull();
  });

  it("breaks a cycle so every folder is reachable from the root", () => {
    const { folders } = repairLibrary(
      [folder("a", "c"), folder("b", "a"), folder("c", "b"), folder("d")],
      [],
    );

    expect(folders.filter((f) => f.parentId === null).length).toBe(2);
    expect(
      describeRows(folders, []).filter((row) => row.endsWith("/")),
    ).toHaveLength(4);
  });

  it("re-roots a runbook whose folder is missing", () => {
    const kept = runbook("kept", "a");
    const { runbooks } = repairLibrary(
      [folder("a")],
      [kept, runbook("lost", "gone")],
    );

    expect(runbooks[0]).toBe(kept);
    expect(runbooks[1].folderId).toBeUndefined();
  });

  it("keeps sound data by identity", () => {
    const folders = [folder("a"), folder("b", "a")];
    const repaired = repairLibrary(folders, []);

    expect(repaired.folders[0]).toBe(folders[0]);
    expect(repaired.folders[1]).toBe(folders[1]);
  });
});
