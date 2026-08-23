import { NoteStyle, RunbookView } from "@/common/enums";
import { BlocksList } from "@/components/blocks/BlocksList";
import { TabsBar } from "@/components/tabs/TabsBar";
import { RunbookSource } from "@/components/workspace/RunbookSource";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { demoCommand, demoNote, demoVariable } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";
import "./TabsSection.css";

function DemoRunbookPanel() {
  const showingSource = useStore(
    (state) => state.runbookView === RunbookView.SOURCE,
  );

  return (
    <div id="docs-demo-tab-panel">
      {showingSource ? <RunbookSource /> : <BlocksList />}
    </div>
  );
}

export function TabsDocs() {
  const t = useTranslation();
  const { backup, siteCheck } = t.docs.demo.tabSamples;

  return (
    <>
      <Prose text={t.docs.tabs.intro} />
      <Prose
        text={t.docs.tabs.items(
          t.source.openSource,
          t.source.openPreview,
          t.variables.openEditorTitle,
        )}
      />
      <Prose text={t.docs.tabs.autoCreate} />
      <Prose text={t.docs.tabs.labelDemo} />

      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoNote(backup.title, NoteStyle.HEADING),
              demoNote(backup.note),
              demoCommand("zip -r backup.zip ~/Documents"),
              demoCommand("cp backup.zip ~/Backups"),
            ],
          },
          {
            blocks: [
              demoNote(siteCheck.title, NoteStyle.HEADING),
              demoNote(siteCheck.note),
              demoCommand("ping {SITE}"),
              demoCommand("curl {SITE}/health"),
            ],
            variables: [demoVariable("SITE", "example.com")],
          },
          { blocks: [demoNote("", NoteStyle.HEADING)] },
        ]}
      >
        <TabsBar />
        <DemoRunbookPanel />
      </DemoWorkspace>
    </>
  );
}
