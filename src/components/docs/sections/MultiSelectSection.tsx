import { BlocksList } from "@/components/blocks/BlocksList";
import { useTranslation } from "@/i18n";
import { demoCommand, demoNote } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";

export function MultiSelectDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.multiSelect.intro} />
      <Prose text={t.docs.multiSelect.menuAction(t.blocks.select)} />
      <Prose text={t.docs.multiSelect.actions} />
      <Prose text={t.docs.multiSelect.clear} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoNote(t.docs.demo.multiSelectNotes[0]),
              demoCommand("zip -r backup.zip ~/Documents", true),
              demoCommand("cp backup.zip ~/Backups", true),
              demoNote(t.docs.demo.multiSelectNotes[1]),
              demoCommand("rm backup.zip", true),
            ],
          },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}
