import { ImageBlockConfig, MimeType } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { AppMode, BlockType, DialogTone } from "@/common/enums";
import type { ImageBlock as ImageBlockData } from "@/common/types";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { ImportIcon, TrashIcon } from "@/components/icons";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { formatFileSize } from "@/utils/format";
import {
  isAttachedImage,
  isImageFile,
  normalizeImageSrc,
  readImageAsDataUrl,
} from "@/utils/image";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { ArrowsFullscreen } from "react-bootstrap-icons";
import type { BlockViewProps } from "../blockViews";
import "./ImageBlock.css";
import { ImagePlaceholderBadge } from "./ImagePlaceholderBadge";

export function ImageBlock({ block }: BlockViewProps<ImageBlockData>) {
  const t = useTranslation();
  const blockId = block.id;
  const src = block.src;

  const language = useStore((state) => state.language);
  const isReadMode = useStore((state) => state.mode === AppMode.READ);
  const updateBlock = useStore((state) => state.updateBlock);
  const confirm = useStore((state) => state.confirm);
  const consumeBlockFocus = useStore((state) => state.consumeBlockFocus);
  const openImageViewer = useStore((state) => state.openImageViewer);
  const pendingFocus = useStore(
    (state) => state.pendingFocusBlockId === blockId,
  );

  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A new source gets its own chance to load
  useEffect(() => setLoadFailed(false), [src]);

  useEffect(() => {
    if (pendingFocus) {
      dropzoneRef.current?.focus({ preventScroll: true });
      consumeBlockFocus();
    }
  }, [pendingFocus, consumeBlockFocus]);

  const setSource = (nextSrc: string, alt?: string) => {
    setError(null);
    setUrlDraft("");
    updateBlock(blockId, BlockType.IMAGE, { src: nextSrc, alt });
  };

  const confirmReplace = async () => {
    if (!src) {
      return true;
    }

    return confirm(t.dialogs.replaceImageMessage, {
      title: t.dialogs.replaceImageTitle,
      confirmLabel: t.dialogs.replaceImageConfirm,
      tone: DialogTone.WARNING,
    });
  };

  const attachFile = async (file: File | undefined, replacing = false) => {
    if (!file) {
      return;
    }

    if (!isImageFile(file)) {
      setError(t.image.notAnImage);
      return;
    }

    if (file.size > ImageBlockConfig.MAX_BYTES) {
      const limit = formatFileSize(ImageBlockConfig.MAX_BYTES, language);
      setError(t.image.tooLarge(limit));
      return;
    }

    if (replacing && !(await confirmReplace())) {
      return;
    }

    try {
      setSource(await readImageAsDataUrl(file), file.name);
    } catch {
      setError(t.image.readFailed);
    }
  };

  const applyUrl = async (raw: string, replacing = false) => {
    const nextSrc = normalizeImageSrc(raw);
    if (!nextSrc) {
      setError(t.image.invalidUrl);
      return;
    }

    if (replacing && !(await confirmReplace())) {
      return;
    }

    setSource(nextSrc);
  };

  const fileDrop = useFileDrop(
    (files) => void attachFile(files[0], true),
    !isReadMode,
  );

  // Paste lands here whenever the block holds focus
  const handlePaste = (event: ClipboardEvent) => {
    if (isReadMode) {
      return;
    }

    const file = event.clipboardData.files[0];
    if (file) {
      event.preventDefault();
      void attachFile(file, true);
      return;
    }

    const text = event.clipboardData.getData(MimeType.PLAIN_TEXT).trim();
    if (text) {
      event.preventDefault();
      void applyUrl(text, true);
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const expand = () => openImageViewer(blockId);

  const clear = () =>
    updateBlock(blockId, BlockType.IMAGE, { src: "", alt: undefined });

  return (
    <div
      className={classNames(
        "image-block",
        CssClass.BLOCK_SURFACE,
        fileDrop.isDropActive && CssClass.DROP_TARGET,
      )}
      {...fileDrop.dropProps}
      onPaste={handlePaste}
    >
      <input
        ref={fileInputRef}
        className="image-file-input"
        type="file"
        accept={ImageBlockConfig.ACCEPT}
        onChange={(event) => {
          void attachFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {src ? (
        <div className="image-frame">
          {loadFailed ? (
            <div className="image-broken">
              <ImagePlaceholderBadge />
              <p className="image-message">{t.image.loadFailed}</p>
              {!isAttachedImage(src) && <p className="image-source">{src}</p>}
            </div>
          ) : (
            <img
              className="image-view"
              src={src}
              alt={block.alt ?? ""}
              draggable={false}
              title={isReadMode ? t.image.viewFullscreen : undefined}
              role={isReadMode ? "button" : undefined}
              tabIndex={isReadMode ? 0 : undefined}
              onClick={isReadMode ? expand : undefined}
              onError={() => setLoadFailed(true)}
            />
          )}

          {!isReadMode && (
            <div className="image-actions">
              <div className="image-actions-group">
                {!loadFailed && (
                  <button
                    className="btn btn-icon btn-accent"
                    title={t.image.viewFullscreen}
                    onClick={expand}
                  >
                    <ArrowsFullscreen className="icon-md" />
                  </button>
                )}

                <ActionsMenu
                  className="image-actions-menu"
                  title={t.image.actions}
                  triggerClassName="btn btn-icon btn-accent"
                  horizontal
                >
                  <ContextMenuItem
                    icon={<ImportIcon className="icon-md icon-bold" />}
                    onSelect={openFilePicker}
                  >
                    {t.image.replace}
                  </ContextMenuItem>

                  <ContextMenuItem
                    icon={<TrashIcon className="icon-md icon-bold" />}
                    onSelect={clear}
                    danger
                  >
                    {t.image.remove}
                  </ContextMenuItem>
                </ActionsMenu>
              </div>
            </div>
          )}
        </div>
      ) : isReadMode ? (
        <div className="image-empty-readonly">
          <ImagePlaceholderBadge />
          <p className="image-message">{t.image.emptyReadOnly}</p>
        </div>
      ) : (
        <div className="image-dropzone" ref={dropzoneRef} tabIndex={0}>
          <ImagePlaceholderBadge />

          <p className="image-message">{t.image.dropHint}</p>

          <button className="btn btn-lg" onClick={openFilePicker}>
            {t.image.choose}
          </button>

          <div className="image-url-row">
            <input
              className="image-url-input"
              type="url"
              spellCheck={false}
              placeholder={t.image.urlPlaceholder}
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              onPaste={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === Key.ENTER && urlDraft.trim()) {
                  void applyUrl(urlDraft);
                }
              }}
            />
            <button
              className="btn"
              disabled={!urlDraft.trim()}
              onClick={() => void applyUrl(urlDraft)}
            >
              {t.image.addUrl}
            </button>
          </div>
        </div>
      )}

      {error && <p className="image-error">{error}</p>}
    </div>
  );
}
