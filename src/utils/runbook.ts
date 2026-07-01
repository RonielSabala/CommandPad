import { RunbookConfig } from '@/common/config';
import { BlockType } from '@/common/enums';
import type { Block } from '@/common/types';

/** Derive a runbook label from its first note block, falling back otherwise. */
export function getRunbookLabel(blocks: Block[] | undefined, fallback: string): string {
  const firstBlock = blocks?.[0];
  if (firstBlock?.type === BlockType.NOTE && firstBlock.text?.trim()) {
    return firstBlock.text.trim().slice(0, RunbookConfig.LABEL_MAX_LENGTH);
  }

  return fallback || RunbookConfig.DEFAULT_LABEL;
}

/** Case-insensitive substring match across the given fields (empty query = all). */
export function matchesQuery(query: string, ...fields: (string | undefined)[]): boolean {
  if (!query) {
    return true;
  }

  const needle = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}
