import { getBlockLabelText } from "@/blocks";
import { DEFAULT_TAB_LABEL, RunbookConfig } from "@/common/config";
import {
  globalUnicodeRegex,
  LETTER,
  noneOf,
  NUMBER,
  oneOrMore,
} from "@/common/regex";
import type { Block } from "@/common/types";
import type { Messages } from "@/i18n/types";
import { noteToPlainText } from "@/utils/markdown";

const LABEL_STRIP_REGEX = /[*`´]/g;

function cleanLabelText(text: string): string {
  return noteToPlainText(text)
    .replace(LABEL_STRIP_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getRunbookLabel(
  blocks: Block[] | undefined,
  fallback: string,
): string {
  const firstBlock = blocks?.[0];
  const labelText = firstBlock ? getBlockLabelText(firstBlock) : null;

  if (labelText !== null) {
    const label = cleanLabelText(labelText);
    if (label) {
      return label.slice(0, RunbookConfig.LABEL_MAX_LENGTH);
    }
  }

  return fallback || RunbookConfig.DEFAULT_LABEL;
}

export function displayLabel(label: string, t: Messages): string {
  if (label === DEFAULT_TAB_LABEL) {
    return t.common.untitledTab;
  }

  if (label === RunbookConfig.DEFAULT_LABEL) {
    return t.common.untitledRunbook;
  }

  return label;
}

const SLUG_SEPARATOR_REGEX = globalUnicodeRegex(
  oneOrMore(noneOf(LETTER, NUMBER)),
);
const SLUG_EDGE_DASHES_REGEX = /^-+|-+$/g;

export function slugifyLabel(label: string): string {
  return label
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(SLUG_SEPARATOR_REGEX, "-")
    .replace(SLUG_EDGE_DASHES_REGEX, "");
}
