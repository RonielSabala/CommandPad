import { DEFAULT_TAB_LABEL } from "@/common/config";
import { LibraryItemKind } from "@/common/enums";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { describe, expect, it } from "vitest";

import {
  folderLocation,
  folderSubtree,
  libraryLevel,
  libraryPathTrail,
  libraryRows,
  repairLibrary,
  uniqueFolderName,
  uniqueRunbookLabel,
  withFolderExpanded,
} from "./libraryTree";

const en = getMessages("en");

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

  it("matches a runbook by its path", () => {
    expect(describeRows(folders, runbooks, "OPS/db")).toEqual([
      "0:backup",
      "0:restore",
    ]);
    expect(describeRows(folders, runbooks, "s/db/back")).toEqual(["0:backup"]);
    expect(describeRows(folders, runbooks, "~/ops/db")).toEqual([
      "0:backup",
      "0:restore",
    ]);
    expect(describeRows(folders, runbooks, "~/re")).toEqual(["0:readme"]);
    expect(describeRows(folders, runbooks, "db/ops")).toEqual([]);
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

describe("folderLocation", () => {
  it("spells the path from the root", () => {
    const folders = [folder("ops"), folder("deploys", "ops")];

    expect(folderLocation(folders, null)).toBe("~/");
    expect(folderLocation(folders, "ops")).toBe("~/ops/");
    expect(folderLocation(folders, "deploys")).toBe("~/ops/deploys/");
  });

  it("stops at a cycle", () => {
    const folders = [folder("a", "b"), folder("b", "a")];
    expect(folderLocation(folders, "a")).toBe("~/b/a/");
  });
});

describe("libraryLevel", () => {
  it("lists only what sits directly inside", () => {
    const folders = [folder("ops"), folder("deploys", "ops")];
    const runbooks = [runbook("root"), runbook("nested", "ops")];

    expect(libraryLevel(folders, runbooks, null)).toEqual({
      folders: [folders[0]],
      runbooks: [runbooks[0]],
    });
    expect(libraryLevel(folders, runbooks, "ops")).toEqual({
      folders: [folders[1]],
      runbooks: [runbooks[1]],
    });
  });
});

describe("libraryPathTrail", () => {
  const folders = [folder("ops"), folder("deploys", "ops"), folder("a/b")];
  const trailIds = (text: string) =>
    libraryPathTrail(folders, text).map((f) => f.id);

  it("stops at the last folder fully spelled", () => {
    expect(trailIds("")).toEqual([]);
    expect(trailIds("ops")).toEqual([]);
    expect(trailIds("ops/")).toEqual(["ops"]);
    expect(trailIds("ops/dep")).toEqual(["ops"]);
    expect(trailIds("ops/deploys/rollback")).toEqual(["ops", "deploys"]);
  });

  it("only walks into a folder under its own parent", () => {
    expect(trailIds("deploys/")).toEqual([]);
  });

  it("reads a separator inside a folder's name", () => {
    expect(trailIds("a/b/x")).toEqual(["a/b"]);
  });
});

describe("uniqueFolderName", () => {
  it("doesn't count the folder being renamed", () => {
    expect(
      uniqueFolderName(
        [{ id: "a", name: "ops", parentId: null }],
        null,
        "ops",
        "a",
      ),
    ).toBe("ops");
  });

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
  it("numbers sibling folders sharing a name, keeping the first", () => {
    const { folders } = repairLibrary(
      [
        { id: "a", name: "ops", parentId: null },
        { id: "b", name: "ops", parentId: null },
        { id: "c", name: "ops", parentId: "a" },
      ],
      [],
      en,
    );

    expect(folders.map((f) => f.name)).toEqual(["ops", "ops (1)", "ops"]);
  });

  it("re-roots a folder whose parent is missing", () => {
    const { folders } = repairLibrary([folder("a", "gone")], [], en);
    expect(folders[0].parentId).toBeNull();
  });

  it("breaks a cycle so every folder is reachable from the root", () => {
    const { folders } = repairLibrary(
      [folder("a", "c"), folder("b", "a"), folder("c", "b"), folder("d")],
      [],
      en,
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
      en,
    );

    expect(runbooks[0]).toBe(kept);
    expect(runbooks[1].folderId).toBeUndefined();
  });

  it("keeps sound data by identity", () => {
    const folders = [folder("a"), folder("b", "a")];
    const repaired = repairLibrary(folders, [], en);

    expect(repaired.folders[0]).toBe(folders[0]);
    expect(repaired.folders[1]).toBe(folders[1]);
  });
});

describe("runbook names", () => {
  const t = getMessages("en");
  const named = (id: string, label: string, folderId?: string) => ({
    ...runbook(id, folderId),
    label,
  });

  it("numbers a label only inside the same folder", () => {
    const runbooks = [named("a", "Deploy"), named("b", "Build", "ops")];

    expect(uniqueRunbookLabel(runbooks, undefined, "Deploy", t)).toBe(
      "Deploy (1)",
    );
    expect(uniqueRunbookLabel(runbooks, "ops", "Deploy", t)).toBe("Deploy");
  });

  it("doesn't count the runbook being renamed", () => {
    const runbooks = [named("a", "Deploy")];

    expect(uniqueRunbookLabel(runbooks, undefined, "Deploy", t, "a")).toBe(
      "Deploy",
    );
  });

  it("compares the name a row shows", () => {
    const es = getMessages("es");
    const runbooks = [named("a", DEFAULT_TAB_LABEL)];

    expect(
      uniqueRunbookLabel(runbooks, undefined, es.common.untitledTab, es),
    ).toBe(`${es.common.untitledTab} (1)`);
  });

  it("numbers a label only when its folder has it", () => {
    const runbooks = [named("a", "Deploy"), named("b", "Deploy (1)")];

    expect(uniqueRunbookLabel(runbooks, undefined, "Deploy", t)).toBe(
      "Deploy (2)",
    );
    expect(uniqueRunbookLabel(runbooks, "ops", "Deploy", t)).toBe("Deploy");
    expect(uniqueRunbookLabel(runbooks, undefined, "Build", t)).toBe("Build");
  });

  it("keeps the untitled sentinel while it's free", () => {
    expect(uniqueRunbookLabel([], undefined, DEFAULT_TAB_LABEL, t)).toBe(
      DEFAULT_TAB_LABEL,
    );
    expect(
      uniqueRunbookLabel(
        [named("a", DEFAULT_TAB_LABEL)],
        undefined,
        DEFAULT_TAB_LABEL,
        t,
      ),
    ).toBe(`${t.common.untitledTab} (1)`);
  });

  it("numbers stored duplicates after the first, folder by folder", () => {
    const { runbooks: repaired } = repairLibrary(
      [folder("ops")],
      [
        named("a", "Deploy"),
        named("b", "Deploy"),
        named("c", "Deploy (1)"),
        named("d", "Deploy", "ops"),
      ],
      t,
    );

    expect(repaired.map((r) => r.label)).toEqual([
      "Deploy",
      "Deploy (2)",
      "Deploy (1)",
      "Deploy",
    ]);
  });

  it("returns stored runbooks untouched when nothing clashes", () => {
    const runbooks = [named("a", "Deploy"), named("b", "Deploy", "ops")];
    const repaired = repairLibrary([folder("ops")], runbooks, t).runbooks;

    expect(repaired[0]).toBe(runbooks[0]);
    expect(repaired[1]).toBe(runbooks[1]);
  });
});

it("numbers a runbook re-rooted onto a name the top level has", () => {
  const { runbooks } = repairLibrary(
    [],
    [
      { ...runbook("a"), label: "Deploy" },
      { ...runbook("b", "gone"), label: "Deploy" },
    ],
    en,
  );

  expect(runbooks.map((r) => [r.folderId, r.label])).toEqual([
    [undefined, "Deploy"],
    [undefined, "Deploy (1)"],
  ]);
});
