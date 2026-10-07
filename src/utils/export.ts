import { blockToMarkdown, type BlockMarkdownContext } from "@/blocks";
import {
  DEFAULT_TAB_LABEL,
  FilePickerConfig,
  JSON_EXTENSION,
  RunbookBlockConfig,
  RunbookConfig,
} from "@/common/config";
import { BlockType, ExportFormat } from "@/common/enums";
import type { RunbookBlock, RunbookContent, Variable } from "@/common/types";
import { encryptContent } from "@/services/vault";
import { downloadBlob } from "./download";
import { localSourceKey } from "./embeddedRunbook";
import {
  applyOverrides,
  getSecretKeys,
  getVariableKey,
  getVariableMap,
  overrideScope,
  resolveCommandToString,
  type OverrideHost,
} from "./resolution";
import { slugifyLabel } from "./runbook";
import { buildRunbookSource } from "./runbookSource";
import { joinLines } from "./string";

const UNTITLED_LABELS: readonly string[] = [
  DEFAULT_TAB_LABEL,
  RunbookConfig.DEFAULT_LABEL,
];

const DEFAULT_EXPORT_BASENAME = "runbook-commandpad-export";

const JSON_EXTENSION_REGEX = new RegExp(`\\.${ExportFormat.JSON}$`, "i");

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}

interface WritableFile {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

interface FileHandle {
  createWritable(): Promise<WritableFile>;
}

type ShowSaveFilePicker = (
  options?: SaveFilePickerOptions,
) => Promise<FileHandle>;

async function saveFile(
  content: string,
  mimeType: string,
  suggestedName: string,
  types: SaveFilePickerOptions["types"],
): Promise<void> {
  const picker = (
    window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }
  ).showSaveFilePicker;

  if (picker) {
    try {
      const fileHandle = await picker({ suggestedName, types });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (error) {
      if ((error as DOMException).name === "AbortError") {
        return;
      }
    }
  }

  downloadBlob(new Blob([content], { type: mimeType }), suggestedName);
}

/** Each block followed by a blank line. */
function markdownLines(blocks: string[]): string[] {
  return blocks.flatMap((markdown) => [markdown, ""]);
}

/** What a runbook block embeds. */
export interface EmbeddedExport {
  /** The embed's source key. */
  key: string;
  /** The vault scope its secrets are encrypted under. */
  scope: string;
  content: RunbookContent;
}

export type EmbeddedReader = (
  block: RunbookBlock,
) => Promise<EmbeddedExport | null>;

/**
 * The embedded runbook's variables with each override baked into the text it
 * resolves to.
 */
function bakeOverrides(
  variables: Variable[],
  { overrides }: RunbookBlock,
  host: OverrideHost,
): Variable[] {
  const overridden = applyOverrides(variables, overrides, host.secretKeys);
  const scope = overrideScope(overridden, overrides, host.variableMap);
  if (!scope) {
    return overridden;
  }

  const resolved = getVariableMap(overridden, scope);
  return overridden.map((variable) => {
    const key = getVariableKey(variable);

    return scope.keys.has(key)
      ? { ...variable, value: resolved[key]?.text ?? "" }
      : variable;
  });
}

async function renderMarkdownBlocks(
  scope: string,
  content: RunbookContent,
  readEmbedded: EmbeddedReader,
  trail: readonly string[],
): Promise<string[]> {
  const secured = await encryptContent(scope, content);
  const host: OverrideHost = {
    variableMap: getVariableMap(secured.variables),
    secretKeys: getSecretKeys(secured.variables),
  };

  // Rendered up front
  const embeds = new Map<string, string>();
  if (trail.length <= RunbookBlockConfig.MAX_DEPTH) {
    for (const block of secured.blocks) {
      if (block.type !== BlockType.RUNBOOK) {
        continue;
      }

      const embedded = await readEmbedded(block);
      if (!embedded || trail.includes(embedded.key)) {
        continue;
      }

      const rendered = await renderMarkdownBlocks(
        embedded.scope,
        {
          ...embedded.content,
          variables: bakeOverrides(embedded.content.variables, block, host),
        },
        readEmbedded,
        [...trail, embedded.key],
      );

      if (rendered.length > 0) {
        embeds.set(block.id, joinLines(markdownLines(rendered).slice(0, -1)));
      }
    }
  }

  const context: BlockMarkdownContext = {
    resolve: (text) => resolveCommandToString(text, host.variableMap),
    embedded: (block) => embeds.get(block.id) ?? null,
  };

  return secured.blocks
    .map((block) => blockToMarkdown(block, context))
    .filter((markdown): markdown is string => markdown !== null);
}

export async function buildMarkdownExport(
  runbookId: string,
  content: RunbookContent,
  readEmbedded: EmbeddedReader,
): Promise<string> {
  const blocks = await renderMarkdownBlocks(runbookId, content, readEmbedded, [
    localSourceKey(runbookId),
  ]);

  return joinLines(markdownLines(blocks));
}

export function stripJsonExtension(filename: string): string {
  return filename.replace(JSON_EXTENSION_REGEX, "");
}

export function withJsonExtension(filename: string): string {
  return `${stripJsonExtension(filename)}${JSON_EXTENSION}`;
}

export function getExportBasename(label: string): string {
  if (label && !UNTITLED_LABELS.includes(label)) {
    const slug = slugifyLabel(label);
    if (slug) {
      return slug;
    }
  }

  return DEFAULT_EXPORT_BASENAME;
}

export async function buildSecuredRunbookExportContent(
  format: ExportFormat,
  runbookId: string,
  content: RunbookContent,
  readEmbedded: EmbeddedReader,
): Promise<string> {
  return format === ExportFormat.JSON
    ? buildRunbookSource(await encryptContent(runbookId, content))
    : buildMarkdownExport(runbookId, content, readEmbedded);
}

export async function runExport(
  format: ExportFormat,
  runbookId: string,
  content: RunbookContent,
  filename: string,
  readEmbedded: EmbeddedReader,
): Promise<void> {
  const config = FilePickerConfig[format];

  await saveFile(
    await buildSecuredRunbookExportContent(
      format,
      runbookId,
      content,
      readEmbedded,
    ),
    config.mimeType,
    filename,
    [...config.types],
  );
}
