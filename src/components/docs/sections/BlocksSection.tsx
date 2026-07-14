import { DividerBlock } from "@/components/blocks/divider/DividerBlock";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { useState } from "react";
import { DemoNoteBlock } from "../demos/DemoNoteBlock";
import { DemoVariables } from "../demos/DemoVariables";
import { DocsDemo } from "../demos/DocsDemo";
import { Prose, ProseList } from "../Prose";

const MARKDOWN_EXAMPLES = [
  "**bold-text**",
  "_italic-text_",
  "`code-text`",
  "[labelled-link](https://example.com)",
];

function NoteDemo() {
  const t = useTranslation();
  const [text, setText] = useState(t.docs.demo.noteSample);
  const [resetCount, setResetCount] = useState(0);

  const reset = () => {
    setText(t.docs.demo.noteSample);
    setResetCount((count) => count + 1);
  };

  return (
    <DocsDemo onReset={reset}>
      <DemoNoteBlock key={resetCount} text={text} onTextChange={setText} />
    </DocsDemo>
  );
}

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
      <DemoVariables command="ssh admin@server-01.example.com" />
      <Prose text={t.docs.commandBlock.multiline} />
      <Prose text={t.docs.commandBlock.gutterNote} />
      <DemoVariables
        command={
          "docker run --rm \\\n  --name web \\\n  -p 8080:80 \\\n  nginx:latest"
        }
      />
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
      <NoteDemo />
    </>
  );
}

export function DividerBlockDocs() {
  const t = useTranslation();
  const [text, setText] = useState(t.docs.dividerBlock.demoNote);
  const [resetCount, setResetCount] = useState(0);

  const reset = () => {
    setText(t.docs.dividerBlock.demoNote);
    setResetCount((count) => count + 1);
  };

  return (
    <>
      <Prose text={t.docs.dividerBlock.intro} />
      <DocsDemo onReset={reset}>
        <div className="docs-demo-divider-stack">
          <DemoNoteBlock key={resetCount} text={text} onTextChange={setText} />
          <DividerBlock />
        </div>
      </DocsDemo>
    </>
  );
}
