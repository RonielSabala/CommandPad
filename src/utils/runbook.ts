import { RunbookConfig } from "@/common/config";
import { BlockType } from "@/common/enums";
import type { Block } from "@/common/types";
import { parseNoteText } from "@/utils/markdown";

const LABEL_STRIP_REGEX = /[*`´]/g;

function cleanNoteLabel(text: string): string {
  const plain = parseNoteText(text)
    .map((segment) => segment.text)
    .join("");

  return plain.replace(LABEL_STRIP_REGEX, "").replace(/\s+/g, " ").trim();
}

export function getRunbookLabel(
  blocks: Block[] | undefined,
  fallback: string,
): string {
  const firstBlock = blocks?.[0];
  if (firstBlock?.type === BlockType.NOTE) {
    const label = cleanNoteLabel(firstBlock.text);
    if (label) {
      return label.slice(0, RunbookConfig.LABEL_MAX_LENGTH);
    }
  }

  return fallback || RunbookConfig.DEFAULT_LABEL;
}

export function slugifyLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
