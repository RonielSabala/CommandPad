import { ESCAPED_BRACE_OPEN, VariableSyntax } from "@/common/variableSyntax";

import promptSource from "./agentPrompt.md?raw";

/**  The prompt that turns an AI assistant into a CommandPad runbook generator. */
export const AGENT_PROMPT = promptSource.trimEnd();

/** The prompt as a command block holds it. */
export const AGENT_PROMPT_BLOCK_TEXT = AGENT_PROMPT.replaceAll(
  VariableSyntax.BRACE_OPEN,
  ESCAPED_BRACE_OPEN,
);
