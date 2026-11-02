import { CloudSyncConfig } from "@/common/config";
import { BlockType, EmbeddedRunbookStatus } from "@/common/enums";
import type { RunbookBlock } from "@/common/types";
import { InfoCodeList, type InfoRow } from "@/components/common/info/InfoTable";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { getTabVariableMap } from "@/hooks/useTabUnresolved";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { localSourceKey } from "@/utils/embeddedRunbook";
import {
  resolvedBlocksByteLength,
  unresolvedBlockParts,
} from "@/utils/resolution";
import { displayLabel } from "@/utils/runbook";
import { getRunbookStats } from "@/utils/runbookSource";
import { useMemo } from "react";

import type { BlockViewProps } from "../blockViews";
import { useEmbeddedRunbook } from "../runbook/useEmbeddedRunbook";
import { BlockInfoTable } from "./BlockInfoTable";

const NO_TRAIL: readonly string[] = [];

export function RunbookInfo({
  block,
  variableMap,
  secretKeys,
}: BlockViewProps<RunbookBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const hostRunbookId = useStore(
    (state) => getActiveTab(state)?.runbookId ?? null,
  );

  const host = useMemo(
    () => ({ variableMap, secretKeys }),
    [variableMap, secretKeys],
  );
  const trail = useMemo(
    () => (hostRunbookId ? [localSourceKey(hostRunbookId)] : NO_TRAIL),
    [hostRunbookId],
  );
  const embed = useEmbeddedRunbook(block, host, trail);

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

    return {
      ...getRunbookStats(content),
      nested: content.blocks.filter(({ type }) => type === BlockType.RUNBOOK)
        .length,
      own,
      overridden,
      unresolved: content.blocks.flatMap((embedded) =>
        unresolvedBlockParts(embedded, embed.variableMap, embed.secretKeys),
      ).length,
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
          value: cloud.path
            ? [CloudSyncConfig.APP_FOLDER_NAME, cloud.path].join(
                CloudSyncConfig.PATH_SEPARATOR,
              )
            : null,
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
          value:
            overrideKeys.length > 0 ? (
              <InfoCodeList items={overrideKeys} />
            ) : (
              t.info.none
            ),
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
          value: stats && format.count(stats.unresolved),
        },
      ]}
    />
  );
}
