import { BlocksList } from "@/components/blocks/BlocksList";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { joinLines } from "@/utils/string";
import { demoCommand, demoDivider, demoNote } from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseList } from "../Prose";

const LONG_COMMAND = joinLines([
  "docker run \\",
  "  --name commandpad \\",
  "  --restart unless-stopped \\",
  "  --env NODE_ENV=production \\",
  "  --env PORT=8080 \\",
  "  --env LOG_LEVEL=info \\",
  "  --env DATABASE_URL=postgres://db:5432/app \\",
  "  --env REDIS_URL=redis://cache:6379 \\",
  "  --publish 8080:8080 \\",
  "  --volume ./data:/var/lib/app/data \\",
  "  --volume ./config:/etc/app \\",
  "  --network runbook-net \\",
  "  --memory 512m \\",
  "  --cpus 1.5 \\",
  "  --health-cmd 'curl -fsS localhost:8080/health' \\",
  "  --health-interval 30s \\",
  "  --label owner=platform \\",
  "  --label tier=frontend \\",
  "  ghcr.io/example/commandpad:latest",
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
