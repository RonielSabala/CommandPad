import { CloudProvider } from "@/common/enums";
import type { LibraryRunbook, RunbookBlock } from "@/common/types";
import { describe, expect, it } from "vitest";

import {
  cloudSourceKey,
  localSourceKey,
  resolveEmbedSource,
  resolveLocalRunbook,
} from "./embeddedRunbook";

const libraryRunbooks: LibraryRunbook[] = [
  { id: "deploy", label: "Deploy", filename: "deploy.json" },
  { id: "backup", label: "Backup", filename: "backup.json" },
  { id: "deploy-copy", label: "Deploy", filename: "deploy (1).json" },
];

function block(fields: Partial<RunbookBlock>): RunbookBlock {
  return { id: "block", type: "runbook", label: "", ...fields };
}

describe("resolveLocalRunbook", () => {
  it("finds a runbook by its label, first match winning", () => {
    expect(
      resolveLocalRunbook(libraryRunbooks, block({ label: "Deploy" }))?.id,
    ).toBe("deploy");
  });

  it("ignores the whitespace around a label", () => {
    expect(
      resolveLocalRunbook(libraryRunbooks, block({ label: "  Backup " }))?.id,
    ).toBe("backup");
  });

  it("prefers the stored id over the label, so a relabeled runbook is still found", () => {
    expect(
      resolveLocalRunbook(
        libraryRunbooks,
        block({ label: "Old name", runbookId: "backup" }),
      )?.id,
    ).toBe("backup");
  });

  it("falls back to the label when the stored id is gone", () => {
    expect(
      resolveLocalRunbook(
        libraryRunbooks,
        block({ label: "Backup", runbookId: "deleted" }),
      )?.id,
    ).toBe("backup");
  });

  it("finds nothing for an unknown or empty label", () => {
    expect(
      resolveLocalRunbook(libraryRunbooks, block({ label: "Nope" })),
    ).toBeNull();
    expect(
      resolveLocalRunbook(libraryRunbooks, block({ label: "   " })),
    ).toBeNull();
  });
});

describe("resolveEmbedSource", () => {
  it("keys a library runbook by its id", () => {
    expect(
      resolveEmbedSource(libraryRunbooks, block({ label: "Backup" })),
    ).toEqual({
      key: localSourceKey("backup"),
      local: libraryRunbooks[1],
    });
  });

  it("keys a cloud runbook by its normalized path", () => {
    const cloud = {
      provider: CloudProvider.ONEDRIVE,
      path: "/ ops / deploy.json ",
    };

    expect(resolveEmbedSource(libraryRunbooks, block({ cloud }))?.key).toBe(
      cloudSourceKey({
        provider: CloudProvider.ONEDRIVE,
        path: "ops/deploy.json",
      }),
    );
  });

  it("has no source when the block points at nothing", () => {
    expect(
      resolveEmbedSource(libraryRunbooks, block({ label: "Nope" })),
    ).toBeNull();
    expect(
      resolveEmbedSource(
        libraryRunbooks,
        block({ cloud: { provider: CloudProvider.ONEDRIVE, path: " / " } }),
      ),
    ).toBeNull();
  });
});
