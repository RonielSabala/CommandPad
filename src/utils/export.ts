import {
  DEFAULT_TAB_LABEL,
  FilePickerConfig,
  MarkdownSyntax,
  RunbookConfig,
} from "@/common/config";
import { BlockType, ExportFormat, NoteStyle } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { getVariableMap, resolveCommandToString } from "./resolution";
import { slugifyLabel } from "./runbook";

const UNTITLED_LABELS: readonly string[] = [
  DEFAULT_TAB_LABEL,
  RunbookConfig.DEFAULT_LABEL,
];

const DEFAULT_EXPORT_BASENAME = "runbook-commandpad-export";

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

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = suggestedName;
  anchor.click();
  URL.revokeObjectURL(url);
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

export function getExportBasename(label: string): string {
  if (label && !UNTITLED_LABELS.includes(label)) {
    const slug = slugifyLabel(label);
    if (slug) {
      return slug;
    }
  }

  return DEFAULT_EXPORT_BASENAME;
}

/** The import/export JSON shape (variables/blocks with runtime-only ids stripped). */
function buildRunbookExportJson(content: RunbookContent): string {
  const data = {
    variables: (content.variables ?? []).map(({ id, ...rest }) => rest),
    blocks: (content.blocks ?? []).map(({ id, ...rest }) => rest),
  };
  return JSON.stringify(data, null, 2);
}

/** Serialized file content for a given export format. */
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
