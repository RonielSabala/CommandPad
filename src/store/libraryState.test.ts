import { RecentRunbooksConfig } from "@/common/config";
import type { LibraryFolder, LibraryRunbook } from "@/common/types";
import { describe, expect, it } from "vitest";

import { withRecentRunbook, withoutRunbooks } from "./libraryState";
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
    recentRunbookIds: [],
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

describe("withoutRunbooks reveal", () => {
  const tab = (runbookId: string) => ({ id: `tab-${runbookId}`, runbookId });

  function collapsedAfterRemoving(activeRunbookId: string, removed: string) {
    const state = {
      tabs: [tab("first"), tab("hidden")],
      activeTabId: `tab-${activeRunbookId}`,
      libraryFolders: [OPEN, COLLAPSED],
      libraryRunbooks: LIBRARY,
      recentRunbookIds: [],
      runbookSearchQuery: "",
      focusedRunbookId: null,
    } as unknown as StoreState;

    return withoutRunbooks(state, new Set([removed])).libraryFolders[1]
      .collapsed;
  }

  it("expands the folder of the runbook that becomes active", () => {
    expect(collapsedAfterRemoving("first", "first")).toBe(false);
  });

  it("leaves a collapsed folder alone when the active tab stays", () => {
    expect(collapsedAfterRemoving("hidden", "first")).toBe(true);
  });
});

describe("withRecentRunbook", () => {
  it("moves the opened runbook to the front", () => {
    expect(withRecentRunbook(["a", "b", "c"], "c")).toEqual(["c", "a", "b"]);
  });

  it("keeps the list when the runbook is already first or missing", () => {
    const recent = ["a", "b"];
    expect(withRecentRunbook(recent, "a")).toBe(recent);
    expect(withRecentRunbook(recent, null)).toBe(recent);
  });

  it("drops the oldest past the limit", () => {
    const full = Array.from(
      { length: RecentRunbooksConfig.LIMIT },
      (_, index) => `r${index}`,
    );

    expect(withRecentRunbook(full, "new")).toEqual([
      "new",
      ...full.slice(0, -1),
    ]);
  });

  it("forgets removed runbooks", () => {
    const state = {
      tabs: [],
      activeTabId: null,
      libraryFolders: [OPEN, COLLAPSED],
      libraryRunbooks: LIBRARY,
      recentRunbookIds: ["last", "first"],
      runbookSearchQuery: "",
      focusedRunbookId: null,
    } as unknown as StoreState;

    expect(withoutRunbooks(state, new Set(["last"])).recentRunbookIds).toEqual([
      "first",
    ]);
  });
});
