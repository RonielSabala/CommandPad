import { CssClass } from "@/common/constants/css";
import { NoteStyle } from "@/common/enums";
import type {
  Block,
  CommandBlock,
  ImageBlock,
  NoteBlock,
} from "@/common/types";
import { asButton } from "@/components/common/asButton";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { CLAMP_SURFACE_STYLE } from "@/hooks/useClampSurface";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import type { VariableMap } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useRef } from "react";

import { CommandPreview } from "../command/CommandPreview";
import "../divider/DividerBlock.css";
import "../image/ImageBlock.css";
import "../note/NoteBlock.css";
import "../note/NoteEditor.css";
import { NoteText } from "../note/NoteText";

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
      className={classNames("embedded-command", CssClass.CLAMP_SURFACE)}
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
    <div
      className={classNames(
        "note-preview",
        "embedded-note",
        `style-${block.style ?? NoteStyle.BODY}`,
      )}
    >
      <NoteText text={block.text} />
    </div>
  );
}

export function EmbeddedImage({
  block,
  scopeId,
  images,
}: EmbeddedBlockProps<ImageBlock>) {
  const t = useTranslation();
  const openImageViewer = useStore((state) => state.openImageViewer);

  if (!block.src) {
    return null;
  }

  return (
    <img
      className="image-view is-clickable"
      src={block.src}
      alt={block.alt ?? ""}
      draggable={false}
      {...asButton(() => openImageViewer(scopeId, images))}
      {...tooltip(t.image.viewFullscreen)}
    />
  );
}

export function EmbeddedDivider() {
  return (
    <div className="divider-block">
      <div className="divider-line" />
    </div>
  );
}
