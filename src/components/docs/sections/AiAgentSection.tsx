import { CodeLanguage } from "@/common/enums";
import { BlocksList } from "@/components/blocks/BlocksList";
import { useTranslation } from "@/i18n";
import { AGENT_PROMPT_BLOCK_TEXT } from "../agentPrompt";
import { demoCommand } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";

const PROMPT_BLOCK = demoCommand(
  AGENT_PROMPT_BLOCK_TEXT,
  true,
  CodeLanguage.PLAIN,
);

export function AiAgentDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.aiAgent.intro(t.command.copy)} />
      <DemoWorkspace tabs={[{ blocks: [PROMPT_BLOCK] }]}>
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.aiAgent.promptLanguage} />
      <Prose text={t.docs.aiAgent.updates} />
    </>
  );
}
