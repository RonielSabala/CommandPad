import { NoteStyle, SortDirection } from "@/common/enums";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import { useTranslation } from "@/i18n";
import { demoNote } from "../demos/demoSeeds";
import { DemoRunbookList, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";

export function RunbookLibraryDocs() {
  const t = useTranslation();
  const { runbookSamples, folderSamples } = t.docs.demo;
  const samplePaths = [
    [],
    [folderSamples.operations, folderSamples.databases],
    [folderSamples.operations],
  ];

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
        library={runbookSamples.map((label, index) => ({
          blocks: [demoNote(label, NoteStyle.HEADING)],
          folderPath: samplePaths[index],
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
          t.runbooks.collapseAll,
          t.runbooks.expandAll,
        )}
      />
      <Prose
        text={t.docs.runbookLibrary.sorting(
          t.runbooks.sortContents[SortDirection.ASC],
          t.runbooks.sortContents[SortDirection.DESC],
        )}
      />
      <Prose text={t.docs.runbookLibrary.moving} />
      <Prose text={t.docs.runbookLibrary.zipExport(t.runbooks.downloadZip)} />
      <Prose text={t.docs.runbookLibrary.zipImport(t.runbooks.importZip)} />
      <Prose
        text={t.docs.runbookLibrary.quickOpen(
          formatBinding(KEYBINDINGS[KeyBinding.QUICK_OPEN].binding),
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
