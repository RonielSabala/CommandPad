import { RunbookConfig } from "@/common/config";
import { BlockType } from "@/common/enums";
import type { Block } from "@/common/types";

export function getRunbookLabel(
  blocks: Block[] | undefined,
  fallback: string,
): string {
  const firstBlock = blocks?.[0];
  if (firstBlock?.type === BlockType.NOTE) {
    const text = firstBlock.text.trim();
    if (text) {
      return text.slice(0, RunbookConfig.LABEL_MAX_LENGTH);
    }
  }

  return fallback || RunbookConfig.DEFAULT_LABEL;
}
