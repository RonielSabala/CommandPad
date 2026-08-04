import { ImageBlockConfig } from "@/common/config";
import { BlocksList } from "@/components/blocks/BlocksList";
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
import { Prose, ProseList, ProseTable } from "../Prose";

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

const DEMO_PIPELINE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="180" viewBox="0 0 440 180">
  <rect x="28" y="60" width="104" height="60" rx="8" fill="#2f68c5"/>
  <rect x="168" y="60" width="104" height="60" rx="8" fill="#3b82f6"/>
  <rect x="308" y="60" width="104" height="60" rx="8" fill="#15803d"/>
  <path d="M136 90h28M276 90h28" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
  <g fill="#eef1f6" font-family="monospace" font-size="15" text-anchor="middle">
    <text x="80" y="95">build</text>
    <text x="220" y="95">stage</text>
    <text x="360" y="95">prod</text>
  </g>
</svg>`;

const DEMO_TOPOLOGY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="180" viewBox="0 0 440 180">
  <rect x="168" y="24" width="104" height="48" rx="8" fill="#7c3aed"/>
  <rect x="28" y="112" width="104" height="48" rx="8" fill="#0e7490"/>
  <rect x="168" y="112" width="104" height="48" rx="8" fill="#0e7490"/>
  <rect x="308" y="112" width="104" height="48" rx="8" fill="#0e7490"/>
  <path d="M220 72v20M220 92H80v20M220 92h140v20M220 92v20" stroke="#6b7280" stroke-width="3" stroke-linecap="round" fill="none"/>
  <g fill="#eef1f6" font-family="monospace" font-size="15" text-anchor="middle">
    <text x="220" y="54">proxy</text>
    <text x="80" y="142">web-1</text>
    <text x="220" y="142">web-2</text>
    <text x="360" y="142">web-3</text>
  </g>
</svg>`;

const DEMO_PIPELINE_SRC = `data:image/svg+xml,${encodeURIComponent(DEMO_PIPELINE_SVG)}`;
const DEMO_TOPOLOGY_SRC = `data:image/svg+xml,${encodeURIComponent(DEMO_TOPOLOGY_SVG)}`;

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
      <ProseTable text={t.docs.noteBlock.markdownTable} />
      <Prose text={t.docs.noteBlock.links} />

      <DemoWorkspace tabs={[{ blocks: [demoNote(t.docs.demo.noteSample)] }]}>
        <BlocksList />
      </DemoWorkspace>

      <Prose text={t.docs.noteBlock.noNesting} />
      <Prose text={t.docs.noteBlock.autoUrls} />
      <Prose text={t.docs.noteBlock.wrapKeys} />

      <Prose text={t.docs.noteBlock.tables} />
      <Prose text={t.docs.noteBlock.tableRules} />

      <DemoWorkspace tabs={[{ blocks: [demoNote(t.docs.demo.tableSample)] }]}>
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
      <Prose text={t.docs.imageBlock.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoImage(DEMO_PIPELINE_SRC, "pipeline.svg"),
              demoImage(DEMO_TOPOLOGY_SRC, "topology.svg"),
              demoImage(""),
            ],
          },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.imageBlock.attachedVsLinked(limit)} />
      <Prose text={t.docs.imageBlock.sizing} />
      <Prose text={t.docs.imageBlock.slideshow} />
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
