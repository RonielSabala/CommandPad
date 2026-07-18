import { NoteStyle } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { demoNote } from "../demos/demoSeeds";
import { DemoRunbookList, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseList } from "../Prose";

export function RunbookLibraryDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.runbookLibrary.intro} />
      <ProseList items={t.docs.runbookLibrary.items} />
      <DemoWorkspace
        library={t.docs.demo.runbookSamples.map((label) => ({
          blocks: [demoNote(label, NoteStyle.HEADING)],
        }))}
      >
        <DemoRunbookList />
      </DemoWorkspace>
      <Prose text={t.docs.runbookLibrary.autoLabel} />
      <Prose text={t.docs.runbookLibrary.labelDetails} />
      <Prose text={t.docs.runbookLibrary.autoSave} />
    </>
  );
}
