import { CodeLanguage, NoteStyle, RunbookView } from "@/common/enums";
import { BlocksList } from "@/components/blocks/BlocksList";
import { TabsBar } from "@/components/tabs/TabsBar";
import { RunbookVariables } from "@/components/variables/RunbookVariables";
import { RunbookSource } from "@/components/workspace/RunbookSource";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import type { ComponentType } from "react";

import { demoCommand, demoNote, demoVariable } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";
import "./TabsSection.css";

const DEMO_RUNBOOK_VIEWS: Record<RunbookView, ComponentType> = {
  [RunbookView.SOURCE]: RunbookSource,
  [RunbookView.PREVIEW]: BlocksList,
  [RunbookView.VARIABLES]: RunbookVariables,
};

function DemoRunbookPanel() {
  const view = useStore((state) => state.runbookView);
  const View = DEMO_RUNBOOK_VIEWS[view];

  return (
    <div id="docs-demo-tab-panel">
      <View />
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
          t.tabs.close,
          t.tabs.closeOthers,
          t.tabs.closeAll,
        )}
      />
      <Prose text={t.docs.tabs.variablesEditorNote} />
      <Prose text={t.docs.tabs.autoCreate} />
      <Prose text={t.docs.tabs.labelDemo} />

      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoNote(backup.title, NoteStyle.HEADING),
              demoNote(backup.note),
              demoCommand(
                "zip -r {ARCHIVE} ~/Documents",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand("ls {BACKUP_DIR}", undefined, CodeLanguage.BASH),
            ],
            variables: [
              demoVariable("BACKUP_DIR", "~/Backups"),
              demoVariable("ARCHIVE", "{BACKUP_DIR}/backup.zip"),
            ],
          },
          {
            blocks: [
              demoNote(siteCheck.title, NoteStyle.HEADING),
              demoNote(siteCheck.note),
              demoCommand("ping {SITE}", undefined, CodeLanguage.BASH),
              demoCommand("curl {SITE}/health", undefined, CodeLanguage.BASH),
            ],
            variables: [demoVariable("SITE", "example.com")],
          },
          {
            blocks: [
              demoNote("", NoteStyle.HEADING),
              demoCommand(
                "systemctl restart {SERVICE} --host {HOST}",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
            variables: [demoVariable("SERVICE", "nginx")],
          },
        ]}
      >
        <TabsBar />
        <DemoRunbookPanel />
      </DemoWorkspace>

      <Prose text={t.docs.tabs.unresolvedMarker} />
    </>
  );
}
