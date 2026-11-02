import { SECRET_MASK } from "@/common/config";
import {
  CODE_LANGUAGE_LABEL,
  DEFAULT_COMMAND_LANGUAGE,
} from "@/common/editorConfig";
import { ReferenceSurface } from "@/common/enums";
import type { CommandBlock, Variable } from "@/common/types";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import {
  countCommandLines,
  getReferencedKeys,
  getUsedVariableKeys,
  isMaskedSegment,
  maskedText,
  resolveCommandText,
  unresolvedSegmentParts,
} from "@/utils/resolution";
import { countCharacters, countLines, utf8ByteLength } from "@/utils/string";
import { useMemo } from "react";

import type { BlockViewProps } from "../blockViews";
import { BlockInfoTable } from "./BlockInfoTable";

const NO_VARIABLES: Variable[] = [];

export function CommandInfo({
  block,
  variableMap,
  secretKeys,
}: BlockViewProps<CommandBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const variables = useStore(
    (state) => getActiveTab(state)?.variables ?? NO_VARIABLES,
  );

  const stats = useMemo(() => {
    const { text } = block;
    const segments = resolveCommandText(text, variableMap);

    // What the preview shows, secrets masked
    const preview = segments
      .map((segment) =>
        isMaskedSegment(segment, secretKeys)
          ? SECRET_MASK
          : maskedText(segment, secretKeys),
      )
      .join("");

    const used = getUsedVariableKeys([block], variables);

    let secrets = 0;
    for (const key of used) {
      if (secretKeys.has(key)) {
        secrets++;
      }
    }

    return {
      editorBytes: utf8ByteLength(text),
      previewBytes: utf8ByteLength(preview),
      editorCharacters: countCharacters(text),
      previewCharacters: countCharacters(preview),
      editorLines: countLines(text),
      previewLines: countCommandLines(segments, secretKeys),
      references: getReferencedKeys(text, ReferenceSurface.COMMAND).size,
      nestedReferences: used.size,
      secrets,
      unresolved: unresolvedSegmentParts(segments, variableMap, secretKeys)
        .length,
    };
  }, [block, variableMap, secretKeys, variables]);

  const { rows } = t.info;

  return (
    <BlockInfoTable
      block={block}
      rows={[
        {
          label: rows.language,
          value:
            CODE_LANGUAGE_LABEL[block.language ?? DEFAULT_COMMAND_LANGUAGE],
        },
        { label: rows.editorSize, value: format.size(stats.editorBytes) },
        { label: rows.previewSize, value: format.size(stats.previewBytes) },
        {
          label: rows.editorCharacters,
          value: format.count(stats.editorCharacters),
        },
        {
          label: rows.previewCharacters,
          value: format.count(stats.previewCharacters),
        },
        { label: rows.editorLines, value: format.count(stats.editorLines) },
        { label: rows.previewLines, value: format.count(stats.previewLines) },
        { label: rows.references, value: format.count(stats.references) },
        {
          label: rows.nestedReferences,
          value: format.count(stats.nestedReferences),
        },
        { label: rows.secretsUsed, value: format.count(stats.secrets) },
        { label: rows.unresolved, value: format.count(stats.unresolved) },
      ]}
    />
  );
}
