import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { describe, expect, it } from "vitest";

import { withoutRunbooks } from "./libraryState";
import type { StoreState } from "./types";

const runbook = (id: string, folderId?: string) =>
  ({ id, label: id, folderId }) as LibraryRunbook;

const COLLAPSED: LibraryFolder = {
  id: "closed",
  name: "closed",
  parentId: null,
  collapsed: true,
};

const OPEN: LibraryFolder = { id: "open", name: "open", parentId: null };

const LIBRARY = [
  runbook("first"),
  runbook("hidden", COLLAPSED.id),
  runbook("last"),
  runbook("nested", OPEN.id),
];

function focusAfterRemoving(
  focusedRunbookId: string,
  removed: string[],
  runbookSearchQuery = "",
) {
  const state = {
    tabs: [],
    activeTabId: null,
    libraryFolders: [OPEN, COLLAPSED],
    libraryRunbooks: LIBRARY,
    runbookSearchQuery,
    focusedRunbookId,
  } as unknown as StoreState;

  return withoutRunbooks(state, new Set(removed)).focusedRunbookId;
}

describe("withoutRunbooks focus", () => {
  it("moves to the next row on screen, skipping a collapsed folder", () => {
    expect(focusAfterRemoving("first", ["first"])).toBe("last");
  });

  it("follows the order on screen, not the order in the array", () => {
    expect(focusAfterRemoving("nested", ["nested"])).toBe("first");
  });

  it("moves to the previous row when the last one goes", () => {
    expect(focusAfterRemoving("last", ["last"])).toBe("first");
  });

  it("stays among the rows a search leaves on screen", () => {
    expect(focusAfterRemoving("first", ["first"], "nested")).toBeNull();
    expect(focusAfterRemoving("nested", ["nested"], "first")).toBeNull();
    expect(focusAfterRemoving("first", ["first"], "t")).toBe("last");
  });

  it("clears when the removed runbook was not on screen", () => {
    expect(focusAfterRemoving("hidden", ["hidden"])).toBeNull();
  });

  it("clears when nothing on screen survives", () => {
    expect(focusAfterRemoving("first", ["first", "last", "nested"])).toBeNull();
  });

  it("keeps the focus when another runbook is removed", () => {
    expect(focusAfterRemoving("first", ["last"])).toBe("first");
  });
});
