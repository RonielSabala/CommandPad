import { NoteStyle } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { demoNote } from "../demos/demoSeeds";
import { DemoRunbookList, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";

export function RunbookLibraryDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.runbookLibrary.intro(t.runbooks.title)} />
      <Prose
        text={t.docs.runbookLibrary.items(
          t.runbooks.import,
          t.runbooks.clearLibrary,
          t.runbooks.actions,
        )}
      />
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
