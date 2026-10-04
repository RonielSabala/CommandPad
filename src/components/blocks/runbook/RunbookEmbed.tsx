import { AppMode, BlockType, EmbeddedRunbookStatus } from "@/common/enums";
import type { Block, BlockOfType, RunbookBlock } from "@/common/types";
import { Spinner } from "@/components/common/Spinner";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { RunbookIcon } from "@/components/icons";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { embedScopeId } from "@/utils/embeddedRunbook";
import { isFilledImage } from "@/utils/image";
import { classNames } from "@/utils/string";
import { useMemo, type ComponentType, type ReactNode } from "react";
import {
  ArrowRepeat,
  BoxArrowInRight,
  BoxArrowUpRight,
  ShieldLock,
} from "react-bootstrap-icons";

import { CssClass } from "@/common/constants/css";
import "@/components/blocks/BlocksList.css";
import {
  EmbeddedCommand,
  EmbeddedDivider,
  EmbeddedImage,
  EmbeddedNote,
  type EmbeddedBlockProps,
} from "./EmbeddedBlockViews";
import "./RunbookEmbed.css";
import {
  useEmbeddedRunbook,
  type EmbeddedRunbookState,
} from "./useEmbeddedRunbook";

const EMBEDDED_VIEWS: {
  [T in BlockType]: ComponentType<EmbeddedBlockProps<BlockOfType<T>>>;
} = {
  [BlockType.COMMAND]: EmbeddedCommand,
  [BlockType.NOTE]: EmbeddedNote,
  [BlockType.IMAGE]: EmbeddedImage,
  [BlockType.RUNBOOK]: NestedRunbook,
  [BlockType.DIVIDER]: EmbeddedDivider,
};

interface NoticeProps {
  children: ReactNode;
  error?: boolean;
}

export function EmbedNotice({ children, error }: NoticeProps) {
  return (
    <div className={classNames("runbook-embed-notice", error && "is-error")}>
      {children}
    </div>
  );
}

export function EmbedActions({ embed }: { embed: EmbeddedRunbookState }) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);

  const refreshEmbeddedRunbook = useStore(
    (state) => state.refreshEmbeddedRunbook,
  );
  const unlockEmbeddedRunbook = useStore(
    (state) => state.unlockEmbeddedRunbook,
  );
  const loadRunbookFromLibrary = useStore(
    (state) => state.loadRunbookFromLibrary,
  );

  const { source } = embed;
  if (!source) {
    return null;
  }

  const localId = source.local?.id;
  return (
    <>
      {!readMode && embed.locked && (
        <button
          className="btn runbook-embed-unlock"
          onClick={() => void unlockEmbeddedRunbook(source)}
          {...tooltip(t.runbookBlock.locked)}
        >
          <ShieldLock className="icon-md" />
          {t.runbookBlock.unlock}
        </button>
      )}

      {localId && (
        <button
          className="btn btn-flat-icon"
          onClick={() => void loadRunbookFromLibrary(localId)}
          aria-label={t.runbookBlock.open}
          {...tooltip(t.runbookBlock.open)}
        >
          <BoxArrowUpRight className="icon-md" />
        </button>
      )}

      {!readMode && !embed.isOpen && !embed.circular && !embed.tooDeep && (
        <button
          className="btn btn-flat-icon"
          onClick={() => void refreshEmbeddedRunbook(source)}
          disabled={embed.refreshing}
          aria-label={t.runbookBlock.refresh}
          {...tooltip(t.runbookBlock.refresh)}
        >
          {embed.refreshing ? <Spinner /> : <ArrowRepeat className="icon-md" />}
        </button>
      )}
    </>
  );
}

interface BodyProps {
  block: RunbookBlock;
  embed: EmbeddedRunbookState;
  readOnly?: boolean;
  children: ReactNode;
}

export function EmbedBody({
  block,
  embed,
  readOnly = false,
  children,
}: BodyProps) {
  const t = useTranslation();
  const { source } = embed;
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const signInForEmbeddedRunbooks = useStore(
    (state) => state.signInForEmbeddedRunbooks,
  );

  if (!source) {
    const label = block.label.trim();
    if (!block.cloud && label) {
      return <EmbedNotice error>{t.runbookBlock.unresolvedLabel}</EmbedNotice>;
    }

    return (
      <EmbedNotice>
        {readMode || readOnly
          ? t.runbookBlock.noSource
          : block.cloud
            ? t.runbookBlock.emptyPath
            : t.runbookBlock.emptyLabel}
      </EmbedNotice>
    );
  }

  if (embed.circular) {
    return <EmbedNotice>{t.runbookBlock.circular}</EmbedNotice>;
  }
  if (embed.tooDeep) {
    return <EmbedNotice>{t.runbookBlock.tooDeep}</EmbedNotice>;
  }
  if (embed.content) {
    return children;
  }

  const provider = source.cloud?.provider;
  switch (embed.status) {
    case EmbeddedRunbookStatus.SIGNED_OUT:
      return (
        provider && (
          <EmbedNotice>
            {t.runbookBlock.signedOut(PROVIDER_NAME[provider])}

            <button
              className="btn"
              onClick={() => void signInForEmbeddedRunbooks(provider)}
            >
              <BoxArrowInRight className="icon-md" />
              {t.runbookBlock.signIn}
            </button>
          </EmbedNotice>
        )
      );

    case EmbeddedRunbookStatus.MISSING:
      return <EmbedNotice error>{t.runbookBlock.missing}</EmbedNotice>;

    case EmbeddedRunbookStatus.ERROR:
      return <EmbedNotice error>{t.runbookBlock.error}</EmbedNotice>;

    default:
      return (
        <EmbedNotice>
          <Spinner />
          {t.runbookBlock.loading}
        </EmbedNotice>
      );
  }
}

export function EmbeddedBlocks({
  embed,
  scopeId,
}: {
  embed: EmbeddedRunbookState;
  scopeId: string;
}) {
  const t = useTranslation();
  const blocks = embed.content?.blocks;
  const images = useMemo(
    () =>
      (blocks ?? [])
        .filter(isFilledImage)
        .map((image) => ({ ...image, id: embedScopeId(scopeId, image.id) })),
    [blocks, scopeId],
  );

  if (!blocks?.length) {
    return <EmbedNotice>{t.runbookBlock.empty}</EmbedNotice>;
  }

  return (
    <div className={classNames(CssClass.BLOCKS_LIST, "runbook-embed-blocks")}>
      {blocks.map((child) => {
        const View = EMBEDDED_VIEWS[child.type] as ComponentType<
          EmbeddedBlockProps<Block>
        >;

        return (
          <View
            key={child.id}
            block={child}
            variableMap={embed.variableMap}
            secretKeys={embed.secretKeys}
            scopeId={embedScopeId(scopeId, child.id)}
            trail={embed.nestedTrail}
            images={images}
          />
        );
      })}
    </div>
  );
}

function NestedRunbook({
  block,
  variableMap,
  secretKeys,
  scopeId,
  trail,
}: EmbeddedBlockProps<RunbookBlock>) {
  const embed = useEmbeddedRunbook(block, { variableMap, secretKeys }, trail);

  return (
    <div className="runbook-embed">
      <div className="runbook-embed-header">
        <RunbookIcon className="icon-md icon-semibold runbook-embed-icon" />
        <div className={CssClass.RUNBOOK_EMBED_ACTIONS}>
          <EmbedActions embed={embed} />
        </div>
      </div>

      <EmbedBody block={block} embed={embed} readOnly>
        <EmbeddedBlocks embed={embed} scopeId={scopeId} />
      </EmbedBody>
    </div>
  );
}
