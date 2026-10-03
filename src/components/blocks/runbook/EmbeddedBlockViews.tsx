import { CssClass } from "@/common/constants/css";
import { NoteStyle } from "@/common/enums";
import type {
  Block,
  CommandBlock,
  ImageBlock,
  NoteBlock,
} from "@/common/types";
import { CLAMP_SURFACE_STYLE } from "@/hooks/useClampSurface";
import { useStore } from "@/store/store";
import type { VariableMap } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useRef } from "react";

import { CommandPreview } from "../command/CommandPreview";
import { DividerLine } from "../divider/DividerBlock";
import { ImageView } from "../image/ImageView";
import { NotePreview } from "../note/NotePreview";

export interface EmbeddedBlockProps<T extends Block = Block> {
  block: T;
  variableMap: VariableMap;
  secretKeys: Set<string>;
  scopeId: string;
  /** The source keys of the embeds this one sits in, outermost first. */
  trail: readonly string[];
  images: ImageBlock[];
}

export function EmbeddedCommand({
  block,
  variableMap,
  secretKeys,
  scopeId,
}: EmbeddedBlockProps<CommandBlock>) {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      className={classNames("command-card", CssClass.CLAMP_SURFACE)}
      style={CLAMP_SURFACE_STYLE}
    >
      <CommandPreview
        clampId={scopeId}
        text={block.text}
        variableMap={variableMap}
        secretKeys={secretKeys}
        surfaceRef={rootRef}
      />
    </div>
  );
}

export function EmbeddedNote({ block }: EmbeddedBlockProps<NoteBlock>) {
  return (
    <NotePreview
      text={block.text}
      styleClass={`style-${block.style ?? NoteStyle.BODY}`}
      standalone
    />
  );
}

export function EmbeddedImage({
  block,
  scopeId,
  images,
}: EmbeddedBlockProps<ImageBlock>) {
  const openImageViewer = useStore((state) => state.openImageViewer);
  if (!block.src) {
    return null;
  }

  return (
    <ImageView
      src={block.src}
      alt={block.alt}
      onExpand={() => openImageViewer(scopeId, images)}
    />
  );
}

export function EmbeddedDivider() {
  return <DividerLine />;
}
