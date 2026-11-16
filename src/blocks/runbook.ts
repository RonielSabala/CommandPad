import { BlockJsonField, JsonSchemaType } from "@/common/editorConfig";
import { BlockType, CloudProvider } from "@/common/enums";
import { MarkdownSyntax } from "@/common/markdownSyntax";
import { isCloudRunbookRef } from "@/utils/embeddedRunbook";
import { isObject, isString } from "@/utils/typeGuards";

import type { BlockDefinition } from "./types";

/** Keeps the entries with a string value, and nothing when none survive. */
function normalizeOverrides(value: unknown) {
  const entries = isObject(value)
    ? Object.entries(value).filter(
        (entry): entry is [string, string] =>
          !!entry[0].trim() && isString(entry[1]),
      )
    : [];

  return entries.length > 0 ? { overrides: Object.fromEntries(entries) } : {};
}

export const runbookBlockDefinition: BlockDefinition<typeof BlockType.RUNBOOK> =
  {
    type: BlockType.RUNBOOK,
    jsonSchema: {
      properties: {
        [BlockJsonField.LABEL]: { type: JsonSchemaType.STRING },
        [BlockJsonField.CLOUD]: {
          type: JsonSchemaType.OBJECT,
          properties: {
            [BlockJsonField.PROVIDER]: { enum: Object.values(CloudProvider) },
            [BlockJsonField.PATH]: { type: JsonSchemaType.STRING },
          },
          required: [BlockJsonField.PROVIDER, BlockJsonField.PATH],
        },
        [BlockJsonField.OVERRIDES]: {
          type: JsonSchemaType.OBJECT,
          additionalProperties: { type: JsonSchemaType.STRING },
        },
        [BlockJsonField.COLLAPSED]: { type: JsonSchemaType.BOOLEAN },
      },
      required: [BlockJsonField.LABEL],
    },

    runtimeFields: [BlockJsonField.RUNBOOK_ID],

    create: (id) => ({ id, type: BlockType.RUNBOOK, label: "" }),

    normalize: (block) => ({
      id: block.id,
      type: BlockType.RUNBOOK,
      label: isString(block.label) ? block.label : "",
      ...(isString(block.runbookId) && block.runbookId
        ? { runbookId: block.runbookId }
        : {}),
      ...(isCloudRunbookRef(block.cloud)
        ? { cloud: { provider: block.cloud.provider, path: block.cloud.path } }
        : {}),
      ...normalizeOverrides(block.overrides),
      ...(block.collapsed === true ? { collapsed: true } : {}),
    }),

    toMarkdown: (block, context) => {
      const embedded = context.embedded(block);
      if (embedded !== null) {
        return embedded;
      }

      const target = block.cloud
        ? `${block.cloud.provider}:${block.cloud.path}`
        : block.label.trim();

      return target ? MarkdownSyntax.RUNBOOK_REFERENCE(target) : null;
    },

    commandTexts: {
      get: (block) => Object.values(block.overrides ?? {}),
      map: (block, transform) => {
        if (!block.overrides) {
          return block;
        }

        let changed = false;
        const overrides = Object.fromEntries(
          Object.entries(block.overrides).map(([key, value]) => {
            const next = transform(value);
            changed ||= next !== value;

            return [key, next];
          }),
        );

        return changed ? { ...block, overrides } : block;
      },
    },

    folding: {
      isFolded: (block) => block.collapsed === true,
      setFolded: (block, collapsed) => ({ ...block, collapsed }),
    },
  };
