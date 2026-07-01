import { FilePickerConfig, MarkdownSyntax } from '@/common/config';
import { BlockType, ExportFormat, NoteStyle } from '@/common/enums';
import type { RunbookContent } from '@/common/types';
import { getVariableMap, resolveCommandToString } from './resolution';

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
type ShowSaveFilePicker = (options?: SaveFilePickerOptions) => Promise<FileHandle>;

/** Save text via the File System Access API, falling back to a download link. */
async function saveFile(
  content: string,
  mimeType: string,
  suggestedName: string,
  types: SaveFilePickerOptions['types'],
): Promise<void> {
  const picker = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker;

  if (picker) {
    try {
      const fileHandle = await picker({ suggestedName, types });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') {
        return;
      }
    }
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = suggestedName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildMarkdownExport(content: RunbookContent): string {
  const variableMap = getVariableMap(content.variables);
  const lines: string[] = [];

  for (const block of content.blocks) {
    if (block.type === BlockType.NOTE) {
      const style = block.style || NoteStyle.BODY;
      const text = block.text || '';

      if (style === NoteStyle.HEADING) {
        lines.push(`${MarkdownSyntax.HEADING} ${text}`);
      } else if (style === NoteStyle.SUBHEADING) {
        lines.push(`${MarkdownSyntax.SUBHEADING} ${text}`);
      } else {
        lines.push(text);
      }
    } else if (block.type === BlockType.COMMAND) {
      lines.push(MarkdownSyntax.CODE_FENCE);
      lines.push(resolveCommandToString(block.text || '', variableMap));
      lines.push(MarkdownSyntax.CODE_FENCE_END);
    } else if (block.type === BlockType.DIVIDER) {
      lines.push(MarkdownSyntax.DIVIDER);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/** Serialize the workspace and hand it to the browser save flow. */
export async function runExport(format: ExportFormat, content: RunbookContent): Promise<void> {
  if (format === ExportFormat.JSON) {
    const data = { variables: content.variables ?? [], blocks: content.blocks ?? [] };
    const cfg = FilePickerConfig.json;
    await saveFile(JSON.stringify(data, null, 2), cfg.mimeType, cfg.suggestedName, [...cfg.types]);
    return;
  }

  const cfg = format === ExportFormat.MD ? FilePickerConfig.md : FilePickerConfig.txt;
  await saveFile(buildMarkdownExport(content), cfg.mimeType, cfg.suggestedName, [...cfg.types]);
}
