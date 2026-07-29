import {
  DEFAULT_TAB_LABEL,
  FilePickerConfig,
  JSON_EXTENSION,
  MarkdownSyntax,
  RunbookConfig,
} from "@/common/config";
import { BlockType, ExportFormat, NoteStyle } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { downloadBlob } from "./download";
import { getVariableMap, resolveCommandToString } from "./resolution";
import { slugifyLabel } from "./runbook";

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

  for (const block of content.blocks) {
    if (block.type === BlockType.NOTE) {
      const blockText = block.text || "";
      const blockStyle = block.style || NoteStyle.BODY;

      if (blockStyle === NoteStyle.HEADING) {
        lines.push(`${MarkdownSyntax.HEADING} ${blockText}`);
      } else if (blockStyle === NoteStyle.SUBHEADING) {
        lines.push(`${MarkdownSyntax.SUBHEADING} ${blockText}`);
      } else {
        lines.push(blockText);
      }
    } else if (block.type === BlockType.COMMAND) {
      if (!block.text) {
        continue;
      }

      lines.push(MarkdownSyntax.CODE_FENCE);
      lines.push(resolveCommandToString(block.text, variableMap));
      lines.push(MarkdownSyntax.CODE_FENCE_END);
    } else if (block.type === BlockType.DIVIDER) {
      lines.push(MarkdownSyntax.DIVIDER);
    }

    lines.push("");
  }

  return lines.join("\n");
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

function buildRunbookExportJson(content: RunbookContent): string {
  const data = {
    variables: (content.variables ?? []).map(({ id, ...rest }) => rest),
    blocks: (content.blocks ?? []).map(({ id, ...rest }) => rest),
  };

  return JSON.stringify(data, null, 2);
}

export function buildRunbookExportContent(
  format: ExportFormat,
  content: RunbookContent,
): string {
  return format === ExportFormat.JSON
    ? buildRunbookExportJson(content)
    : buildMarkdownExport(content);
}

export async function runExport(
  format: ExportFormat,
  content: RunbookContent,
  filename: string,
): Promise<void> {
  const config = FilePickerConfig[format];

  await saveFile(
    buildRunbookExportContent(format, content),
    config.mimeType,
    filename,
    [...config.types],
  );
}
