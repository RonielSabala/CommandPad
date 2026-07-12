import { DividerBlock } from "@/components/blocks/divider/DividerBlock";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { useState } from "react";
import { DemoNoteBlock } from "../demos/DemoNoteBlock";
import { DemoVariables } from "../demos/DemoVariables";
import { DocsDemo } from "../demos/DocsDemo";
import { Prose } from "../Prose";

const MARKDOWN_EXAMPLES = [
  "**bold-text**",
  "_italic-text_",
  "`code-text`",
  "[labelled-link](https://example.com)",
];

function NoteDemo() {
  const t = useTranslation();
  const [text, setText] = useState(t.docs.demo.noteSample);
  return (
    <DocsDemo>
      <DemoNoteBlock text={text} onTextChange={setText} />
    </DocsDemo>
  );
}

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
      <DemoVariables
        variables={[
          { key: "USER", value: "admin" },
          { key: "HOST", value: "server-01.example.com" },
        ]}
        command="ssh {USER}@{HOST}"
      />
      <Prose text={t.docs.commandBlock.multiline} />
      <Prose text={t.docs.commandBlock.gutterNote} />
      <DemoVariables
        variables={[{ key: "IMAGE", value: "nginx:latest" }]}
        command={
          "docker run --rm \\\n  --name web \\\n  -p 8080:80 \\\n  {IMAGE}"
        }
      />
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
      <Prose text={t.docs.noteBlock.links} />
      <Prose text={t.docs.noteBlock.wrapKeys} />
      <NoteDemo key={t.docs.demo.noteSample} />
    </>
  );
}

export function DividerBlockDocs() {
  const t = useTranslation();
  const [text, setText] = useState(t.docs.dividerBlock.demoNote);
  return (
    <>
      <Prose text={t.docs.dividerBlock.intro} />
      <DocsDemo>
        <div className="docs-demo-divider-stack">
          <DemoNoteBlock text={text} onTextChange={setText} />
          <DividerBlock />
        </div>
      </DocsDemo>
    </>
  );
}
