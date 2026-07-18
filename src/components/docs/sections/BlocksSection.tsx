import { BlocksList } from "@/components/blocks/BlocksList";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { demoCommand, demoDivider, demoNote } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseList } from "../Prose";

const MARKDOWN_EXAMPLES = [
  "**bold-text**",
  "_italic-text_",
  "`code-text`",
  "[labelled-link](https://example.com)",
];

export function BlocksDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.blocks.intro} />
    </>
  );
}

export function CommandBlockDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.commandBlock.intro} />
      <ProseList items={t.docs.commandBlock.parts} />
      <DemoWorkspace
        tabs={[{ blocks: [demoCommand("ls -ltr ~/Documents/reports")] }]}
      >
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.commandBlock.multiline} />
      <Prose text={t.docs.commandBlock.gutterNote} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoCommand(
                "pnpm install \\\n  --save-dev \\\n  prettier eslint",
              ),
            ],
          },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.commandBlock.variablesTeaser} />
    </>
  );
}

export function NoteBlockDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.noteBlock.intro} />
      <Prose text={t.docs.noteBlock.styles} />
      <Prose text={t.docs.noteBlock.markdown} />
      <table className="docs-table">
        <thead>
          <tr>
            <th>{t.docs.noteBlock.tableSyntax}</th>
            <th>{t.docs.noteBlock.tableResult}</th>
          </tr>
        </thead>
        <tbody>
          {MARKDOWN_EXAMPLES.map((example) => (
            <tr key={example}>
              <td>{example}</td>
              <td>
                <NoteText text={example} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Prose text={t.docs.noteBlock.noNesting} />
      <Prose text={t.docs.noteBlock.autoUrls} />
      <Prose text={t.docs.noteBlock.links} />
      <Prose text={t.docs.noteBlock.wrapKeys} />
      <DemoWorkspace tabs={[{ blocks: [demoNote(t.docs.demo.noteSample)] }]}>
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}

export function DividerBlockDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.dividerBlock.intro} />
      <DemoWorkspace
        tabs={[
          { blocks: [demoNote(t.docs.dividerBlock.demoNote), demoDivider()] },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}
