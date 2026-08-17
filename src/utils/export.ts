import { blockToMarkdown, type BlockMarkdownContext } from "@/blocks";
import {
  DEFAULT_TAB_LABEL,
  FilePickerConfig,
  JSON_EXTENSION,
  RunbookConfig,
} from "@/common/config";
import { ExportFormat } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { encryptContent } from "@/services/vault";
import { downloadBlob } from "./download";
import { getVariableMap, resolveCommandToString } from "./resolution";
import { slugifyLabel } from "./runbook";
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

export function buildMarkdownExport(content: RunbookContent): string {
  const lines: string[] = [];
  const variableMap = getVariableMap(content.variables);
  const context: BlockMarkdownContext = {
    resolve: (text) => resolveCommandToString(text, variableMap),
  };

  for (const block of content.blocks) {
    const markdown = blockToMarkdown(block, context);
    if (markdown === null) {
      continue;
    }

    lines.push(markdown, "");
  }

  return joinLines(lines);
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

export function buildRunbookExportJson(content: RunbookContent): string {
  const data = {
    variables: (content.variables ?? []).map(({ id, ...rest }) => rest),
    blocks: (content.blocks ?? []).map(({ id, ...rest }) => rest),
  };

  return JSON.stringify(data, null, 2);
}

export async function buildSecuredRunbookExportContent(
  format: ExportFormat,
  runbookId: string,
  content: RunbookContent,
): Promise<string> {
  return format === ExportFormat.JSON
    ? buildRunbookExportJson(await encryptContent(runbookId, content))
    : buildMarkdownExport(content);
}

export async function runExport(
  format: ExportFormat,
  runbookId: string,
  content: RunbookContent,
  filename: string,
): Promise<void> {
  const config = FilePickerConfig[format];

  await saveFile(
    await buildSecuredRunbookExportContent(format, runbookId, content),
    config.mimeType,
    filename,
    [...config.types],
  );
}
