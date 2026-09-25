import { normalizeBlock } from "@/blocks";
import { RunbookSourceConfig } from "@/common/config";
import {
  DEFAULT_VARIABLE_LANGUAGE,
  isCommandLanguage,
  VariableSectionField,
} from "@/common/editorConfig";
import { VariableEntryKind } from "@/common/enums";
import type {
  Block,
  RunbookContent,
  Variable,
  VariableSection,
} from "@/common/types";

import { generateId } from "./id";
import { isObject, isString } from "./typeGuards";
import {
  fromVariableEntries,
  toVariableEntries,
  type VariableEntry,
} from "./variableSections";

const EMPTY_CONTENT: RunbookContent = {
  blocks: [],
  variables: [],
  variableSections: [],
};

const INVALID_SOURCE = "Invalid runbook format";

function serializeSection(section: VariableSection) {
  return {
    [VariableSectionField.SECTION]: section.name,
    ...(section.collapsed ? { [VariableSectionField.COLLAPSED]: true } : {}),
  };
}

/** Serialize content to its JSON source. */
export function buildRunbookSource(content: RunbookContent): string {
  const entries = toVariableEntries(
    content.variables ?? [],
    content.variableSections ?? [],
  );

  const data = {
    variables: entries.map((entry) => {
      if (entry.kind === VariableEntryKind.SECTION) {
        return serializeSection(entry.section);
      }

      const { id, ...rest } = entry.variable;
      return rest;
    }),
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
    ...(Array.isArray(raw.options)
      ? { options: [...new Set(raw.options.filter(isString))] }
      : {}),
  };
}

function parseVariableEntries(
  raw: unknown[],
  previous: RunbookContent,
): VariableEntry[] {
  let variableIndex = 0;
  let sectionIndex = 0;
  const entries: VariableEntry[] = [];

  for (const item of raw) {
    const name = isObject(item) ? item[VariableSectionField.SECTION] : null;
    if (isObject(item) && isString(name)) {
      entries.push({
        kind: VariableEntryKind.SECTION,
        section: {
          id: previous.variableSections[sectionIndex++]?.id ?? generateId(),
          name,
          start: 0,
          ...(item[VariableSectionField.COLLAPSED] === true
            ? { collapsed: true }
            : {}),
        },
      });

      continue;
    }

    const variable = normalizeVariable(
      item,
      previous.variables[variableIndex]?.id ?? null,
    );

    if (variable) {
      variableIndex++;
      entries.push({ kind: VariableEntryKind.VARIABLE, variable });
    }
  }

  return entries;
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
    ...fromVariableEntries(parseVariableEntries(parsed.variables, previous)),

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
