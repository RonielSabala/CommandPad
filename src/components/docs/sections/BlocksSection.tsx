import { DividerBlock } from "@/components/blocks/divider/DividerBlock";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

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
      <Prose text={t.docs.blocks.tip} />
    </>
  );
}

export function CommandBlockDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.commandBlock.intro} />
      <Prose text={t.docs.commandBlock.preview} />
      <Prose text={t.docs.commandBlock.editor} />
      <Prose text={t.docs.commandBlock.multiline} />
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
              <td>
                <code className="note-code">{example}</code>
              </td>
              <td>
                <NoteText text={example} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Prose text={t.docs.noteBlock.links} />
      <Prose text={t.docs.noteBlock.wrapKeys} />
    </>
  );
}

export function DividerBlockDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.dividerBlock.intro} />
      <DividerBlock />
    </>
  );
}
