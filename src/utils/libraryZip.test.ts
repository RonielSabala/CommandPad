import {
  LibraryFolderConfig,
  LibraryZipConfig,
  RunbookConfig,
} from "@/common/config";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { describe, expect, it } from "vitest";

import {
  isZipFilename,
  libraryZipFiles,
  libraryZipImport,
  libraryZipName,
} from "./libraryZip";
import { createZip, readZip, type ZipEntry } from "./zip";

const en = getMessages("en");

function folder(
  id: string,
  parentId: string | null = null,
  name: string = id,
): LibraryFolder {
  return { id, name, parentId };
}

function runbook(id: string, folderId?: string, label = id): LibraryRunbook {
  return { id, label, filename: "", folderId };
}

async function paths(
  folders: LibraryFolder[],
  runbooks: LibraryRunbook[],
  folderId: string | null = null,
): Promise<string[]> {
  const files = await libraryZipFiles(
    folders,
    runbooks,
    folderId,
    async (id) => id,
    en,
  );

  return files.map((file) => file.path);
}

describe("libraryZipFiles", () => {
  it("nests runbooks under their folders, folders first", async () => {
    expect(
      await paths(
        [folder("ops"), folder("db", "ops")],
        [runbook("top"), runbook("deploy", "ops"), runbook("backup", "db")],
      ),
    ).toEqual(["ops/db/backup.json", "ops/deploy.json", "top.json"]);
  });

  it("writes each runbook's text as its file", async () => {
    const [file] = await libraryZipFiles(
      [],
      [runbook("deploy")],
      null,
      async (id) => `text of ${id}`,
      en,
    );

    expect(new TextDecoder().decode(file.data)).toBe("text of deploy");
  });

  it("keeps an empty folder with a trailing separator", async () => {
    const files = await libraryZipFiles(
      [folder("ops"), folder("empty", "ops")],
      [],
      null,
      async (id) => id,
      en,
    );

    expect(files.map((file) => file.path)).toEqual(["ops/empty/"]);
    expect(files[0].data).toHaveLength(0);
  });

  it("roots a folder's zip at that folder, leaving the rest out", async () => {
    expect(
      await paths(
        [folder("ops"), folder("db", "ops"), folder("other")],
        [runbook("top"), runbook("backup", "db"), runbook("note", "other")],
        "ops",
      ),
    ).toEqual(["ops/db/backup.json"]);
  });

  it("keeps a folder holding nothing when it is the one exported", async () => {
    expect(await paths([folder("ops")], [], "ops")).toEqual(["ops/"]);
  });

  it("gives nothing for an empty library", async () => {
    expect(await paths([], [])).toEqual([]);
  });

  it("makes names safe to extract", async () => {
    expect(
      await paths(
        [folder("a", null, "../../etc"), folder("b", null, "..")],
        [
          runbook("c", undefined, 'deploy: a/b "now"?'),
          runbook("d", "a", "backup"),
          runbook("e", "b", "restore"),
        ],
      ),
    ).toEqual([
      "-..-etc/backup.json",
      `${LibraryZipConfig.FALLBACK_NAME}/restore.json`,
      "deploy- a-b -now--.json",
    ]);
  });

  it("numbers names that clash once made safe or ignoring case", async () => {
    expect(
      await paths(
        [],
        [
          runbook("a", undefined, "a/b"),
          runbook("b", undefined, "a-b"),
          runbook("c", undefined, "Deploy"),
          runbook("d", undefined, "deploy"),
        ],
      ),
    ).toEqual(["a-b.json", "a-b (1).json", "Deploy.json", "deploy (1).json"]);
  });

  it("numbers a folder and a runbook only if their entries clash", async () => {
    expect(
      await paths(
        [folder("deploy"), folder("x", null, "notes.json")],
        [
          runbook("a", undefined, "deploy"),
          runbook("b", undefined, "notes"),
          runbook("c", "deploy"),
          runbook("d", "x"),
        ],
      ),
    ).toEqual([
      "deploy/c.json",
      "notes.json/d.json",
      "deploy.json",
      "notes (1).json",
    ]);
  });

  it("doesn't double a label's json extension", async () => {
    expect(await paths([], [runbook("a", undefined, "deploy.json")])).toEqual([
      "deploy.json",
    ]);
  });

  it("shows an untitled runbook's name in the reader's language", async () => {
    expect(
      await paths([], [runbook("a", undefined, RunbookConfig.DEFAULT_LABEL)]),
    ).toEqual([`${en.common.untitledRunbook}.json`]);
  });
});

describe("libraryZipName", () => {
  it("names a folder's zip after the folder", () => {
    expect(libraryZipName([folder("a", null, "ops/db")], "a", en)).toBe(
      "ops-db.zip",
    );
  });

  it("names the whole library's zip after the library", () => {
    expect(libraryZipName([folder("a")], null, en)).toBe(
      "commandpad-library.zip",
    );
  });
});

describe("isZipFilename", () => {
  it("goes by the extension, in any case", () => {
    expect(isZipFilename("a.zip")).toBe(true);
    expect(isZipFilename("a.ZIP")).toBe(true);
    expect(isZipFilename("zip.json")).toBe(false);
    expect(isZipFilename("azip")).toBe(false);
  });
});

describe("libraryZipImport", () => {
  const entry = (path: string): ZipEntry => ({
    path,
    read: () => Promise.reject(new Error("never read")),
  });

  /** Every folder and runbook as its path below the new folder. */
  function imported(zipName: string, paths: string[]) {
    const { root, subfolders, runbooks } = libraryZipImport(
      zipName,
      paths.map(entry),
      en,
    );

    const byId = new Map(subfolders.map((f) => [f.id, f]));
    const pathOf = (id: string): string => {
      const folder = byId.get(id);
      return folder ? `${pathOf(folder.parentId ?? "")}${folder.name}/` : "";
    };

    return {
      root: root.name,
      folders: subfolders.map((f) => pathOf(f.id)),
      runbooks: runbooks.map((r) => `${pathOf(r.folderId)}${r.filename}`),
    };
  }

  it("names the new top-level folder after the zip", () => {
    const { root } = libraryZipImport("Ops Backup.ZIP", [], en);

    expect(root.name).toBe("Ops Backup");
    expect(root.parentId).toBeNull();
  });

  it("recreates folders, including empty and implied ones", () => {
    expect(
      imported("x.zip", ["a/b/one.json", "a/two.json", "empty/", "top.json"]),
    ).toEqual({
      root: "x",
      folders: ["a/", "a/b/", "empty/"],
      runbooks: ["a/b/one.json", "a/two.json", "top.json"],
    });
  });

  it("puts every runbook of a folder in that one folder", () => {
    const { subfolders, runbooks } = libraryZipImport(
      "x.zip",
      ["a/", "a/one.json", "a/two.json"].map(entry),
      en,
    );

    expect(subfolders).toHaveLength(1);
    expect(runbooks.map((r) => r.folderId)).toEqual([
      subfolders[0].id,
      subfolders[0].id,
    ]);
  });

  it("drops a lone wrapper folder named like the zip", () => {
    expect(
      imported("ops.zip", ["ops/", "ops/db/a.json", "ops/b.json"]),
    ).toEqual({
      root: "ops",
      folders: ["db/"],
      runbooks: ["db/a.json", "b.json"],
    });
  });

  it("drops the wrapper of a copy a browser numbered", () => {
    expect(imported("ops (1).zip", ["ops/a.json"])).toEqual({
      root: "ops (1)",
      folders: [],
      runbooks: ["a.json"],
    });
  });

  it("keeps a wrapper with another name or anything beside it", () => {
    expect(imported("ops.zip", ["db/a.json"]).folders).toEqual(["db/"]);
    expect(imported("ops.zip", ["ops/a.json", "b.json"]).folders).toEqual([
      "ops/",
    ]);
  });

  it("doesn't take a runbook named like the zip for a wrapper", () => {
    expect(imported("a.json.zip", ["a.json"])).toEqual({
      root: "a.json",
      folders: [],
      runbooks: ["a.json"],
    });
  });

  it("ignores anything that isn't a runbook", () => {
    expect(
      imported("x.zip", [
        "readme.md",
        "a/notes.txt",
        "__MACOSX/._b.json",
        "__MACOSX/a/._c.json",
        "d.JSON",
      ]),
    ).toEqual({ root: "x", folders: [], runbooks: ["d.JSON"] });
  });

  it("never lets a path climb out of the new folder", () => {
    expect(
      imported("x.zip", ["../../a.json", "./b/../c.json", "back\\slash.json"]),
    ).toEqual({
      root: "x",
      folders: ["b/", "back/"],
      runbooks: ["a.json", "b/c.json", "back/slash.json"],
    });
  });

  it("takes a path ending in either separator for a folder", () => {
    expect(imported("x.zip", ["a/", "b\\"]).folders).toEqual(["a/", "b/"]);
  });

  it("doesn't take a path ending in a climb for a runbook", () => {
    expect(imported("x.zip", ["a.json/.."]).runbooks).toEqual([]);
  });

  it("numbers folder names a clip makes equal", () => {
    const long = "_".repeat(LibraryFolderConfig.NAME_MAX_LENGTH);

    expect(imported("x.zip", [`${long}a/`, `${long}b/`]).folders).toEqual([
      `${long}/`,
      `${long} (1)/`,
    ]);
  });

  it("falls back when the zip has no name to give", () => {
    expect(libraryZipImport(".zip", [], en).root.name).toBe(
      LibraryZipConfig.FALLBACK_NAME,
    );
  });

  it("round-trips a downloaded folder without nesting it", async () => {
    const folders = [folder("ops"), folder("db", "ops"), folder("void", "ops")];
    const runbooks = [runbook("a", "ops"), runbook("b", "db")];
    const files = await libraryZipFiles(
      folders,
      runbooks,
      "ops",
      async (id) => id,
      en,
    );

    const { root, subfolders } = libraryZipImport(
      libraryZipName(folders, "ops", en),
      await readZip(createZip(files)),
      en,
    );

    expect(root.name).toBe("ops");
    expect(subfolders.map((f) => f.name)).toEqual(["db", "void"]);
  });
});
