import { describe, expect, it } from "vitest";

import { folderPath, joinPath, parentPath, splitPath } from "./path";

describe("splitPath", () => {
  it("trims names and drops empty ones", () => {
    expect(splitPath(" ops / /deploys/ ")).toEqual(["ops", "deploys"]);
    expect(splitPath("")).toEqual([]);
  });
});

describe("joinPath", () => {
  it("puts the separator between names", () => {
    expect(joinPath([])).toBe("");
    expect(joinPath(["ops", "deploy.json"])).toBe("ops/deploy.json");
  });
});

describe("folderPath", () => {
  it("ends every name with the separator", () => {
    expect(folderPath([])).toBe("");
    expect(folderPath(["ops"])).toBe("ops/");
    expect(folderPath(["ops", "deploys"])).toBe("ops/deploys/");
  });
});

describe("parentPath", () => {
  it("keeps everything up to the last separator", () => {
    expect(parentPath("ops/deploys/prod")).toBe("ops/deploys/");
    expect(parentPath("ops/")).toBe("ops/");
    expect(parentPath("ops")).toBe("");
  });
});
