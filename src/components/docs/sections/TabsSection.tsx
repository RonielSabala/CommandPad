import { NoteStyle } from "@/common/enums";
import { BlocksList } from "@/components/blocks/BlocksList";
import { TabsBar } from "@/components/tabs/TabsBar";
import { useTranslation } from "@/i18n";
import { demoNote } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseList } from "../Prose";
import "./TabsSection.css";

export function TabsDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.tabs.intro} />
      <ProseList items={t.docs.tabs.items} />
      <Prose text={t.docs.tabs.autoCreate} />
      <Prose text={t.docs.tabs.labelDemo} />
      <DemoWorkspace
        tabs={t.docs.demo.tabSamples.map((note) => ({
          blocks: [demoNote(note, NoteStyle.HEADING)],
        }))}
      >
        <TabsBar />
        <div className="docs-demo-tab-panel">
          <BlocksList />
        </div>
      </DemoWorkspace>
    </>
  );
}
