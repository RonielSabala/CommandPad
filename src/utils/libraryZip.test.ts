import { RunbookConfig } from "@/common/config";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { describe, expect, it } from "vitest";

import { libraryZipFiles, libraryZipName } from "./libraryZip";

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
      "untitled/restore.json",
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
    expect(libraryZipName([folder("a", null, "ops/db")], "a")).toBe(
      "ops-db.zip",
    );
  });

  it("names the whole library's zip after the library", () => {
    expect(libraryZipName([folder("a")], null)).toBe("commandpad-library.zip");
  });
});
