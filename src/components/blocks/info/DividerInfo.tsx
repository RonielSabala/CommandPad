import { BlockType } from "@/common/enums";
import type { DividerBlock } from "@/common/types";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";

import type { BlockViewProps } from "../blockViews";
import { BlockInfoTable } from "./BlockInfoTable";

export function DividerInfo({ block }: BlockViewProps<DividerBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const blockId = block.id;

  // The blocks this divider opens onto
  const sectionLength = useStore((state) => {
    const blocks = getActiveTab(state)?.blocks ?? [];
    const start = blocks.findIndex(({ id }) => id === blockId) + 1;
    if (start === 0) {
      return null;
    }

    const next = blocks.findIndex(
      ({ type }, index) => index >= start && type === BlockType.DIVIDER,
    );
    if (next === -1) {
      return null;
    }

    return next - start;
  });

  return (
    <BlockInfoTable
      block={block}
      rows={[
        {
          label: t.info.rows.blocksInSection,
          value: sectionLength === null ? null : format.count(sectionLength),
        },
      ]}
    />
  );
}
