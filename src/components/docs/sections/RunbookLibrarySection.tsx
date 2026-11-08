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
          t.runbooks.actions,
          t.runbooks.new,
          t.runbooks.pasteTitle,
          t.runbooks.clearLibraryTitle,
        )}
      />
      <DemoWorkspace
        library={t.docs.demo.runbookSamples.map((label) => ({
          blocks: [demoNote(label, NoteStyle.HEADING)],
        }))}
      >
        <DemoRunbookList />
      </DemoWorkspace>
      <Prose
        text={t.docs.runbookLibrary.folders(
          t.runbooks.newFolderItem,
          t.runbooks.newRunbookItem,
          t.runbooks.folderActions,
          t.runbooks.new,
        )}
      />
      <Prose text={t.docs.runbookLibrary.autoLabel} />
      <Prose
        text={t.docs.runbookLibrary.manualName(
          t.runbooks.rename,
          t.runbooks.resetName,
        )}
      />
      <Prose text={t.docs.runbookLibrary.properties(t.info.properties)} />
      <Prose text={t.docs.runbookLibrary.uniqueNames} />
      <Prose text={t.docs.runbookLibrary.labelDetails} />
      <Prose text={t.docs.runbookLibrary.autoSave} />
    </>
  );
}
