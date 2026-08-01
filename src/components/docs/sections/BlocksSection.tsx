import { BlocksList } from "@/components/blocks/BlocksList";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { joinLines } from "@/utils/string";
import { demoCommand, demoDivider, demoNote } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseList } from "../Prose";

const LONG_COMMAND = joinLines([
  "docker run \\",
  "\t--name commandpad \\",
  "\t--restart unless-stopped \\",
  "\t--env NODE_ENV=production \\",
  "\t--env PORT=8080 \\",
  "\t--env LOG_LEVEL=info \\",
  "\t--env DATABASE_URL=postgres://db:5432/app \\",
  "\t--env REDIS_URL=redis://cache:6379 \\",
  "\t--publish 8080:8080 \\",
  "\t--volume ./data:/var/lib/app/data \\",
  "\t--volume ./config:/etc/app \\",
  "\t--network runbook-net \\",
  "\t--memory 512m \\",
  "\t--cpus 1.5 \\",
  "\t--health-cmd 'curl -fsS localhost:8080/health' \\",
  "\t--health-interval 30s \\",
  "\t--label owner=platform \\",
  "\t--label tier=frontend \\",
  "\tghcr.io/example/commandpad:latest",
]);

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
      <Prose text={t.docs.commandBlock.longCommands} />
      <DemoWorkspace tabs={[{ blocks: [demoCommand(LONG_COMMAND)] }]}>
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
