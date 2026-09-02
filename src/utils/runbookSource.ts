import { normalizeBlock } from "@/blocks";
import { RunbookSourceConfig } from "@/common/config";
import {
  DEFAULT_VARIABLE_LANGUAGE,
  isCommandLanguage,
} from "@/common/editorConfig";
import type { Block, RunbookContent, Variable } from "@/common/types";

import { generateId } from "./id";
import { isObject, isString } from "./typeGuards";

const EMPTY_CONTENT: RunbookContent = { variables: [], blocks: [] };

const INVALID_SOURCE = "Invalid runbook format";

/** Serialize content to its JSON source. */
export function buildRunbookSource(content: RunbookContent): string {
  const data = {
    variables: (content.variables ?? []).map(({ id, ...rest }) => rest),
    blocks: (content.blocks ?? []).map(({ id, ...rest }) => rest),
  };

  return JSON.stringify(data, null, RunbookSourceConfig.INDENT);
}

/** Coerce an untrusted variable into a valid one. */
function normalizeVariable(
  raw: unknown,
  carried: string | null,
): Variable | null {
  if (!isObject(raw)) {
    return null;
  }

  return {
    id: isString(raw.id) && raw.id ? raw.id : (carried ?? generateId()),
    key: isString(raw.key) ? raw.key : "",
    value: isString(raw.value) ? raw.value : "",
    language: isCommandLanguage(raw.language)
      ? raw.language
      : DEFAULT_VARIABLE_LANGUAGE,
    ...(raw.secret === true ? { secret: true } : {}),
  };
}

/** Give an untrusted block the id of the entry it is replacing, if it has none. */
function withCarriedId(raw: unknown, carried: string | null): unknown {
  if (!carried || !isObject(raw) || raw.id) {
    return raw;
  }

  return { ...raw, id: carried };
}

/** Read JSON source back into content. */
export function parseRunbookSource(
  raw: string,
  previous: RunbookContent = EMPTY_CONTENT,
): RunbookContent {
  const parsed: unknown = JSON.parse(raw);
  if (
    !isObject(parsed) ||
    !Array.isArray(parsed.variables) ||
    !Array.isArray(parsed.blocks)
  ) {
    throw new Error(INVALID_SOURCE);
  }

  return {
    variables: parsed.variables
      .map((variable, idx) =>
        normalizeVariable(variable, previous.variables[idx]?.id ?? null),
      )
      .filter((variable): variable is Variable => variable !== null),

    blocks: parsed.blocks
      .map((block, idx) => {
        const before = previous.blocks[idx];
        const sameKind =
          before && isObject(block) && block.type === before.type;

        return normalizeBlock(
          withCarriedId(block, sameKind ? before.id : null),
        );
      })
      .filter((block): block is Block => block !== null),
  };
}
