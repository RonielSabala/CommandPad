import {
  hasUnresolvedTokens,
  resolveCommandToString,
} from "@/utils/resolution";
import { describe, expect, it } from "vitest";

import { AGENT_PROMPT, AGENT_PROMPT_BLOCK_TEXT } from "./agentPrompt";

describe("the agent prompt in a command block", () => {
  it("copies back verbatim", () => {
    expect(resolveCommandToString(AGENT_PROMPT_BLOCK_TEXT, {})).toBe(
      AGENT_PROMPT,
    );
  });

  it("resolves nothing, so no part of it is rewritten or highlighted", () => {
    expect(hasUnresolvedTokens(AGENT_PROMPT_BLOCK_TEXT, {})).toBe(false);
  });
});
