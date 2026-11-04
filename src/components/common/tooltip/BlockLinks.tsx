import { CssClass } from "@/common/constants/css";
import { ButtonType } from "@/common/constants/dom";
import type { RevealTone } from "@/common/enums";
import type { Block } from "@/common/types";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";

interface NumberedBlock {
  block: Block;
  number: number;
}

interface Props {
  tabId: string;
  blocks: readonly NumberedBlock[];
  tone: RevealTone;
  onReveal: () => void;
}

export function BlockLinks({ tabId, blocks, tone, onReveal }: Props) {
  const t = useTranslation();
  const revealBlock = useStore((state) => state.revealBlock);

  return (
    <div className={CssClass.TOOLTIP_LINKS}>
      <span>{t.tabs.unresolvedIn(blocks.length)}</span>

      {blocks.map(({ block, number }) => (
        <button
          key={block.id}
          type={ButtonType.BUTTON}
          className={CssClass.TOOLTIP_LINK}
          title={t.tabs.unresolvedBlock(number, t.blocks.typeLabel[block.type])}
          onClick={() => {
            onReveal();
            revealBlock(tabId, block.id, tone);
          }}
        >
          {number}
        </button>
      ))}
    </div>
  );
}
