import { DocsSectionId } from "@/common/constants/docs";
import { NoteStyle } from "@/common/enums";
import { TabsBar } from "@/components/tabs/TabsBar";
import { useTranslation } from "@/i18n";

import {
  demoCommand,
  demoNote,
  demoRunbook,
  demoVariable,
} from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";
import { DemoRunbookPanel } from "./TabsSection";

export function RunbookBlockDocs() {
  const t = useTranslation();

  return (
    <Prose
      text={t.docs.runbookBlock.teaser(
        t.docs.toc[DocsSectionId.EMBEDDING_RUNBOOKS],
        t.docs.toc[DocsSectionId.TABS],
      )}
    />
  );
}

export function EmbeddingRunbooksDocs() {
  const t = useTranslation();
  const docs = t.docs.runbookBlock;

  return (
    <>
      <Prose text={docs.intro} />
      <Prose text={docs.demoHint(t.runbookBlock.showVariables)} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoNote(docs.demoReleaseTitle, NoteStyle.HEADING),
              demoRunbook(docs.demoDeployTitle, { ENV: "prod" }),
            ],
          },
          {
            blocks: [
              demoNote(docs.demoDeployTitle, NoteStyle.SUBHEADING),
              demoCommand("ssh deploy@{HOST}"),
              demoCommand(
                "kubectl --context {ENV} rollout restart deployment/{SERVICE}",
              ),
            ],
            variables: [
              demoVariable("ENV", "staging"),
              demoVariable("HOST", "api.{ENV}.example.com"),
              demoVariable("SERVICE", "api"),
            ],
          },
        ]}
      >
        <TabsBar />
        <DemoRunbookPanel />
      </DemoWorkspace>
      <Prose text={docs.overrides} />
      <Prose text={docs.readOnly(t.runbookBlock.open)} />
      <Prose
        text={docs.cloud(
          t.destinationModal.local,
          t.runbookBlock.signIn,
          t.runbookBlock.refresh,
        )}
      />
      <Prose text={docs.secrets(t.runbookBlock.unlock)} />
      <Prose text={docs.limits} />
    </>
  );
}
