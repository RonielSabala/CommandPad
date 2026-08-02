import { ImageBlockConfig } from "@/common/config";
import { BlocksList } from "@/components/blocks/BlocksList";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { formatFileSize } from "@/utils/format";
import { joinLines } from "@/utils/string";
import {
  demoCommand,
  demoDivider,
  demoImage,
  demoNote,
} from "../demos/demoSeeds";
import { DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseList } from "../Prose";

const LONG_COMMAND = joinLines([
  "echo 'Starting backup...' \\",
  "\t&& mkdir -p ./backup \\",
  "\t&& cp -r ./documents ./backup \\",
  "\t&& cp -r ./photos ./backup \\",
  "\t&& cp -r ./videos ./backup \\",
  "\t&& cp -r ./music ./backup \\",
  "\t&& cp -r ./settings ./backup \\",
  "\t&& zip -r backup.zip ./backup \\",
  "\t&& echo 'Uploading to server...' \\",
  "\t&& scp backup.zip user@server:/backups/ \\",
  "\t&& echo 'Cleaning up...' \\",
  "\t&& rm -rf ./backup \\",
  "\t&& echo 'Backup complete!'",
]);

const DEMO_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="180" viewBox="0 0 440 180">
  <rect width="440" height="180" rx="12" fill="#1f2430"/>
  <rect x="28" y="60" width="104" height="60" rx="8" fill="#2f68c5"/>
  <rect x="168" y="60" width="104" height="60" rx="8" fill="#3b82f6"/>
  <rect x="308" y="60" width="104" height="60" rx="8" fill="#15803d"/>
  <path d="M136 90h28M276 90h28" stroke="#9aa3b2" stroke-width="3" stroke-linecap="round"/>
  <g fill="#eef1f6" font-family="monospace" font-size="15" text-anchor="middle">
    <text x="80" y="95">build</text>
    <text x="220" y="95">stage</text>
    <text x="360" y="95">prod</text>
  </g>
</svg>`;
const DEMO_IMAGE_SRC = `data:image/svg+xml,${encodeURIComponent(DEMO_IMAGE_SVG)}`;

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

export function ImageBlockDocs() {
  const t = useTranslation();
  const language = useStore((state) => state.language);
  const limit = formatFileSize(ImageBlockConfig.MAX_BYTES, language);

  return (
    <>
      <Prose text={t.docs.imageBlock.intro} />
      <ProseList items={t.docs.imageBlock.ways} />
      <Prose text={t.docs.imageBlock.attachedVsLinked(limit)} />
      <Prose text={t.docs.imageBlock.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [demoImage(DEMO_IMAGE_SRC, "pipeline.svg"), demoImage("")],
          },
        ]}
      >
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
