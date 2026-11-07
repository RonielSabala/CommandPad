import { RunbookBlockConfig } from "@/common/config";
import { describe, expect, it } from "vitest";

import { folderChoices, folderPath } from "./folderChoices";

const summary = (path: string, names: string[]) =>
  folderChoices(
    path,
    names,
    [
      { name: "deploys", folder: true },
      { name: "plain" },
      { name: "", label: "Untitled" },
    ],
    "up",
  ).map(({ label, value, folder, pinned }) => ({
    label,
    value,
    folder,
    pinned,
  }));

describe("folderPath", () => {
  it("ends every name with the separator", () => {
    expect(folderPath([])).toBe("");
    expect(folderPath(["ops"])).toBe("ops/");
    expect(folderPath(["ops", "deploys"])).toBe("ops/deploys/");
  });
});

describe("folderChoices", () => {
  it("offers no way up at the root", () => {
    expect(summary("", [])).toEqual([
      { label: "deploys", value: "deploys/", folder: true },
      { label: "plain", value: "plain" },
      { label: "Untitled", value: "" },
    ]);
  });

  it("writes each value under the folder's path", () => {
    expect(summary("ops/", ["ops"]).slice(0, 2)).toEqual([
      { label: "deploys", value: "ops/deploys/", folder: true },
      { label: "plain", value: "ops/plain" },
    ]);
  });

  it("goes up to the parent folder", () => {
    const up = {
      label: RunbookBlockConfig.PARENT_FOLDER_LABEL,
      folder: true,
      pinned: true,
    };

    expect(summary("ops/", ["ops"]).at(-1)).toEqual({ ...up, value: "" });
    expect(summary("a/b/", ["a", "b"]).at(-1)).toEqual({ ...up, value: "a/" });
  });

  it("keeps a path as it was typed", () => {
    expect(summary("ops /", ["ops"])[1].value).toBe("ops /plain");
  });
});
