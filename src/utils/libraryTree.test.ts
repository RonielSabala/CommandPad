import { DEFAULT_TAB_LABEL } from "@/common/config";
import {
  LibraryDropZone,
  LibraryItemKind,
  SortDirection,
} from "@/common/enums";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { describe, expect, it } from "vitest";

import {
  collapsesSubtree,
  folderLocation,
  folderSubtree,
  foundRunbooks,
  isLibraryLevelOutOfOrder,
  libraryDropZone,
  libraryFolderDropParent,
  libraryLevel,
  libraryPathTrail,
  libraryRows,
  libraryRunbookDropParent,
  repairLibrary,
  uniqueFolderName,
  uniqueRunbookLabel,
  withFolderExpanded,
  withLibraryItemMoved,
  withLibraryLevelSorted,
  withSubtreeToggled,
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

describe("withLibraryLevelSorted", () => {
  const folders = [
    folder("web"),
    folder("z", "web"),
    folder("api"),
    folder("a", "web"),
  ];
  const runbooks = [
    runbook("run10"),
    runbook("y", "web"),
    runbook("run2"),
    runbook("b", "web"),
  ];

  const sortedRows = (parentId: string | null, direction: SortDirection) => {
    const sorted = withLibraryLevelSorted(
      folders,
      runbooks,
      parentId,
      direction,
      en,
    );

    return describeRows(sorted.folders, sorted.runbooks);
  };

  it("sorts folders and runbooks apart, folders first", () => {
    expect(sortedRows(null, SortDirection.ASC)).toEqual([
      "0:api/",
      "0:web/",
      "1:z/",
      "1:a/",
      "1:y",
      "1:b",
      "0:run2",
      "0:run10",
    ]);
  });

  it("sorts a folder's contents and nothing around them", () => {
    expect(sortedRows("web", SortDirection.DESC)).toEqual([
      "0:web/",
      "1:z/",
      "1:a/",
      "1:y",
      "1:b",
      "0:api/",
      "0:run10",
      "0:run2",
    ]);

    expect(sortedRows("web", SortDirection.ASC)).toEqual([
      "0:web/",
      "1:a/",
      "1:z/",
      "1:b",
      "1:y",
      "0:api/",
      "0:run10",
      "0:run2",
    ]);
  });

  it("returns the same arrays when already in order", () => {
    const ordered = [folder("a"), folder("b")];
    const sorted = withLibraryLevelSorted(
      ordered,
      [],
      null,
      SortDirection.ASC,
      en,
    );

    expect(sorted.folders).toBe(ordered);
  });

  it("reports a level out of order by either kind", () => {
    const isOut = (parentId: string | null, direction: SortDirection) =>
      isLibraryLevelOutOfOrder(folders, runbooks, parentId, direction, en);

    expect(isOut(null, SortDirection.ASC)).toBe(true);
    expect(isOut(null, SortDirection.DESC)).toBe(false);
    expect(
      isLibraryLevelOutOfOrder(
        [folder("a")],
        [runbook("c"), runbook("b")],
        null,
        SortDirection.ASC,
        en,
      ),
    ).toBe(true);
    expect(
      isLibraryLevelOutOfOrder([], [], "gone", SortDirection.ASC, en),
    ).toBe(false);
  });
});

describe("foundRunbooks", () => {
  const folders = [folder("ops", null, true), folder("db", "ops")];
  const runbooks = [runbook("backup", "db"), runbook("readme")];

  const found = (query: string) =>
    foundRunbooks(folders, runbooks, query).map(({ runbook, path }) => [
      runbook.id,
      path,
    ]);

  it("lists every runbook with its path, even with no query", () => {
    expect(found("")).toEqual([
      ["backup", ["ops", "db"]],
      ["readme", []],
    ]);
  });

  it("leaves out what the query doesn't match", () => {
    expect(found("read")).toEqual([["readme", []]]);
    expect(found("missing")).toEqual([]);
  });
});

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

  it("flags a folder holding neither a folder nor a runbook", () => {
    const emptyFolders = libraryRows(
      [
        folder("parent"),
        folder("child", "parent"),
        folder("filled", null, true),
      ],
      [runbook("inside", "filled")],
      "",
    ).flatMap((row) =>
      row.kind === LibraryItemKind.FOLDER && row.empty ? [row.folder.id] : [],
    );

    expect(emptyFolders).toEqual(["child"]);
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

  it("expands every folder holding it and leaves the others", () => {
    const folders = [
      folder("outer", null, true),
      folder("middle", "outer"),
      folder("inner", "middle", true),
      folder("other", null, true),
    ];

    expect(
      withFolderExpanded(folders, "inner").map((f) => !!f.collapsed),
    ).toEqual([false, false, false, true]);
  });
});

describe("collapsesSubtree", () => {
  it("follows the folder itself, whatever is inside it", () => {
    const folders = [folder("open"), folder("shut", null, true)];
    const nested = [...folders, folder("child", "shut")];

    expect(collapsesSubtree(folders, "open")).toBe(true);
    expect(collapsesSubtree(nested, "shut")).toBe(false);
  });

  it("follows the top-level folders for the whole library", () => {
    const shut = [folder("outer", null, true), folder("inner", "outer")];

    expect(collapsesSubtree(shut, null)).toBe(false);
    expect(collapsesSubtree([...shut, folder("open")], null)).toBe(true);
    expect(collapsesSubtree([], null)).toBe(false);
  });
});

describe("withSubtreeToggled", () => {
  const collapsedIds = (folders: LibraryFolder[]) =>
    folders.filter((f) => f.collapsed).map((f) => f.id);

  it("collapses the folder and all inside it, leaving the rest", () => {
    const folders = [
      folder("outer"),
      folder("middle", "outer", true),
      folder("inner", "middle"),
      folder("other"),
    ];

    expect(collapsedIds(withSubtreeToggled(folders, "outer"))).toEqual([
      "outer",
      "middle",
      "inner",
    ]);
  });

  it("expands the folder and all inside it, leaving the rest", () => {
    const folders = [
      folder("outer", null, true),
      folder("middle", "outer"),
      folder("inner", "middle", true),
      folder("other", null, true),
    ];

    expect(collapsedIds(withSubtreeToggled(folders, "outer"))).toEqual([
      "other",
    ]);
  });

  it("toggles a folder with no subfolders", () => {
    const collapsed = withSubtreeToggled([folder("alone")], "alone");

    expect(collapsedIds(collapsed)).toEqual(["alone"]);
    expect(collapsedIds(withSubtreeToggled(collapsed, "alone"))).toEqual([]);
  });

  it("covers the whole library at the top level", () => {
    const folders = [folder("outer"), folder("inner", "outer", true)];
    const collapsed = withSubtreeToggled(folders, null);

    expect(collapsedIds(collapsed)).toEqual(["outer", "inner"]);
    expect(collapsedIds(withSubtreeToggled(collapsed, null))).toEqual([]);
  });

  it("keeps the objects it doesn't change", () => {
    const folders = [folder("a"), folder("b", null, true)];

    expect(withSubtreeToggled(folders, null)[1]).toBe(folders[1]);
  });
});

describe("libraryDropZone", () => {
  const { FOLDER, RUNBOOK } = LibraryItemKind;
  const { BEFORE, AFTER, INTO } = LibraryDropZone;

  it("splits a runbook row in two for a runbook", () => {
    expect(libraryDropZone(RUNBOOK, RUNBOOK, false, 0.1)).toBe(BEFORE);
    expect(libraryDropZone(RUNBOOK, RUNBOOK, false, 0.9)).toBe(AFTER);
  });

  it("takes a runbook into a folder from anywhere on its row", () => {
    expect(libraryDropZone(RUNBOOK, FOLDER, false, 0)).toBe(INTO);
    expect(libraryDropZone(RUNBOOK, FOLDER, false, 1)).toBe(INTO);
  });

  it("refuses a folder on a runbook row", () => {
    expect(libraryDropZone(FOLDER, RUNBOOK, false, 0.5)).toBeNull();
  });

  it("gives a folder the edges and the middle of a folder row", () => {
    expect(libraryDropZone(FOLDER, FOLDER, false, 0.1)).toBe(BEFORE);
    expect(libraryDropZone(FOLDER, FOLDER, false, 0.5)).toBe(INTO);
    expect(libraryDropZone(FOLDER, FOLDER, false, 0.9)).toBe(AFTER);
  });

  it("reads below an open folder's row as inside it", () => {
    expect(libraryDropZone(FOLDER, FOLDER, true, 0.1)).toBe(BEFORE);
    expect(libraryDropZone(FOLDER, FOLDER, true, 0.9)).toBe(INTO);
  });
});

describe("drop parents", () => {
  const { BEFORE, AFTER, INTO } = LibraryDropZone;
  const folders = [folder("ops"), folder("db", "ops")];
  const runbooks = [runbook("top"), runbook("nested", "ops")];

  it("is the target itself for a drop into it", () => {
    expect(libraryFolderDropParent(folders, "ops", INTO)).toBe("ops");
    expect(libraryRunbookDropParent(runbooks, "ops", INTO)).toBe("ops");
  });

  it("is the top level for a drop below the rows", () => {
    expect(libraryFolderDropParent(folders, null, INTO)).toBeNull();
    expect(libraryRunbookDropParent(runbooks, null, INTO)).toBeNull();
  });

  it("is the target's folder for a drop beside it", () => {
    expect(libraryFolderDropParent(folders, "db", BEFORE)).toBe("ops");
    expect(libraryRunbookDropParent(runbooks, "nested", AFTER)).toBe("ops");
    expect(libraryRunbookDropParent(runbooks, "top", AFTER)).toBeNull();
  });
});

describe("withLibraryItemMoved", () => {
  const { BEFORE, AFTER, INTO } = LibraryDropZone;
  const items = [runbook("a"), runbook("b"), runbook("c")];

  const ids = (moved: LibraryRunbook[]) => moved.map((item) => item.id);
  const keep = (item: LibraryRunbook) => item;

  it("lands on the named side of the target, from either direction", () => {
    const move = (id: string, targetId: string, zone: LibraryDropZone) =>
      ids(withLibraryItemMoved(items, id, keep, targetId, zone));

    expect(move("a", "c", BEFORE)).toEqual(["b", "a", "c"]);
    expect(move("a", "c", AFTER)).toEqual(["b", "c", "a"]);
    expect(move("c", "a", BEFORE)).toEqual(["c", "a", "b"]);
    expect(move("c", "a", AFTER)).toEqual(["a", "c", "b"]);
  });

  it("goes last when dropped into a folder", () => {
    expect(ids(withLibraryItemMoved(items, "a", keep, "ops", INTO))).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("applies the patch to the moved item only", () => {
    const moved = withLibraryItemMoved(
      items,
      "a",
      (item) => ({ ...item, folderId: "ops" }),
      "ops",
      INTO,
    );

    expect(moved.map((item) => item.folderId)).toEqual([
      undefined,
      undefined,
      "ops",
    ]);
  });

  it("keeps the order when the item is gone", () => {
    expect(ids(withLibraryItemMoved(items, "gone", keep, "a", AFTER))).toEqual([
      "a",
      "b",
      "c",
    ]);
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
