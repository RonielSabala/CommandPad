import { BlockType, EmbeddedRunbookStatus } from "@/common/enums";
import type { RunbookBlock } from "@/common/types";
import { InfoCodeList, type InfoRow } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { useTranslation } from "@/i18n";
import { formatCloudPath } from "@/utils/format";
import {
  getTabVariableMap,
  resolvedBlocksByteLength,
  unresolvedBlockParts,
} from "@/utils/resolution";
import { displayLabel } from "@/utils/runbook";
import { getRunbookStats } from "@/utils/runbookSource";
import { useMemo } from "react";

import type { BlockViewProps } from "../blockViews";
import { useTabEmbed } from "../runbook/useEmbeddedRunbook";
import { BlockInfoTable } from "./BlockInfoTable";

export function RunbookInfo({
  block,
  variableMap,
  secretKeys,
}: BlockViewProps<RunbookBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const { embed } = useTabEmbed(block, variableMap, secretKeys);

  const { cloud } = block;
  const overrideKeys = Object.keys(block.overrides ?? {});
  const content = embed.circular || embed.tooDeep ? null : embed.content;

  const stats = useMemo(() => {
    if (!content) {
      return null;
    }

    const own = resolvedBlocksByteLength(
      content.blocks,
      getTabVariableMap(content.variables),
    );
    const overridden = resolvedBlocksByteLength(
      content.blocks,
      embed.variableMap,
    );

    let nested = 0;
    let unresolved = 0;

    for (const embedded of content.blocks) {
      if (embedded.type === BlockType.RUNBOOK) {
        nested++;
      }

      unresolved += unresolvedBlockParts(
        embedded,
        embed.variableMap,
        embed.secretKeys,
      ).length;
    }

    return {
      ...getRunbookStats(content),
      nested,
      own,
      overridden,
      unresolved,
    };
  }, [content, embed.variableMap, embed.secretKeys]);

  const status = !embed.source
    ? t.info.embedNoSource
    : embed.circular
      ? t.info.embedCircular
      : embed.tooDeep
        ? t.info.embedTooDeep
        : embed.locked
          ? t.info.embedLocked
          : t.info.embedStatus[
              embed.isOpen
                ? EmbeddedRunbookStatus.READY
                : (embed.status ?? EmbeddedRunbookStatus.LOADING)
            ];

  const { rows } = t.info;
  const sourceRows: InfoRow[] = cloud
    ? [
        { label: rows.source, value: PROVIDER_NAME[cloud.provider] },
        {
          label: rows.cloudPath,
          value: cloud.path ? formatCloudPath([], cloud.path) : null,
        },
      ]
    : [
        { label: rows.source, value: t.info.library },
        {
          label: rows.runbook,
          value: embed.source?.local
            ? displayLabel(embed.source.local.label, t)
            : null,
        },
      ];

  return (
    <BlockInfoTable
      block={block}
      rows={[
        ...sourceRows,
        { label: rows.status, value: status },
        {
          label: rows.size,
          value: stats && format.size(stats.bytes),
        },
        { label: rows.blocks, value: stats && format.count(stats.blocks) },
        {
          label: rows.variables,
          value: stats && format.count(stats.variables),
        },
        {
          label: rows.nestedRunbooks,
          value: stats && format.count(stats.nested),
        },
        {
          label: rows.overrides,
          value: <InfoCodeList items={overrideKeys} />,
        },
        { label: rows.outputSize, value: stats && format.size(stats.own) },
        {
          label: rows.overriddenOutputSize,
          value: stats && format.size(stats.overridden),
        },
        {
          label: rows.sizeDifference,
          value: stats && format.sizeDelta(stats.overridden - stats.own),
        },
        {
          label: rows.unresolved,
          value: stats && format.exactCount(stats.unresolved),
        },
      ]}
    />
  );
}
