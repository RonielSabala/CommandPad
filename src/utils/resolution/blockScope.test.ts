import { BlockType } from "@/common/enums";
import type { Block, RunbookBlock } from "@/common/types";
import {
  buildVariables,
  commandBlock,
  noteBlock,
  secret,
  type VariableSpec,
} from "@/test";
import { describe, expect, it } from "vitest";

import { getBlockScope } from "./blockScope";

const BEFORE: VariableSpec = {
  HOST: "example.com",
  ORIGIN: "https://{HOST}",
  TEMPLATE: "{;path={PATH}}",
  PATH: "/health",
  OTHER: "x",
};

/** Whether `block` keeps its scope from `BEFORE` to `after`. */
function keepsScope(block: Block, after: VariableSpec): boolean {
  const kept = getBlockScope(block, buildVariables(BEFORE));
  return getBlockScope(block, buildVariables(after)) === kept;
}

describe("getBlockScope", () => {
  it("keeps the scope when a key the block doesn't read changes", () => {
    const after = { ...BEFORE, OTHER: "y" };
    expect(keepsScope(commandBlock("curl {HOST}"), after)).toBe(true);
  });

  it("keeps the scope when the variables change identity only", () => {
    expect(keepsScope(commandBlock("curl {HOST}"), BEFORE)).toBe(true);
  });

  it("drops the scope when a key the block reads changes", () => {
    const after = { ...BEFORE, HOST: "other.com" };
    expect(keepsScope(commandBlock("curl {HOST}"), after)).toBe(false);
  });

  it("drops the scope when a key read through a value changes", () => {
    const after = { ...BEFORE, HOST: "other.com" };
    expect(keepsScope(commandBlock("curl {ORIGIN}"), after)).toBe(false);
  });

  it("drops the scope when a key a blank's default names changes", () => {
    const after = { ...BEFORE, PATH: "/up" };
    expect(keepsScope(commandBlock("curl {TEMPLATE}"), after)).toBe(false);
  });

  it("drops the scope when a key the block reads becomes a secret", () => {
    const after = { ...BEFORE, HOST: secret("example.com") };
    expect(keepsScope(commandBlock("curl {HOST}"), after)).toBe(false);
  });

  it("drops the scope when a key the block reads gets defined", () => {
    const after = { ...BEFORE, MISSING: "" };
    expect(keepsScope(commandBlock("curl {MISSING}"), after)).toBe(false);
  });

  it("hands every view of a block the same scope", () => {
    const block = commandBlock("curl {HOST}");
    getBlockScope(block, buildVariables(BEFORE));

    const after = buildVariables({ ...BEFORE, HOST: "other.com" });
    expect(getBlockScope(block, after)).toBe(getBlockScope(block, after));
  });

  it("keeps the scope of a block that reads no variable", () => {
    const after = { ...BEFORE, HOST: "other.com" };
    expect(keepsScope(noteBlock("{HOST}"), after)).toBe(true);
  });

  it("always hands an embed the live scope", () => {
    const embed: RunbookBlock = {
      id: "runbook-1",
      type: BlockType.RUNBOOK,
      label: "Deploy",
    };

    expect(keepsScope(embed, { ...BEFORE, OTHER: "y" })).toBe(false);
  });
});
