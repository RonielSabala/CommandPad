import { CssClass } from "@/common/constants/css";
import { EventType, Key } from "@/common/constants/events";
import type { Block, ImageBlock } from "@/common/types";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { Modal } from "@/components/modals/Modal";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { isFilledImage } from "@/utils/image";
import { classNames } from "@/utils/string";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

import "./ImageLightbox.css";
import { ImagePlaceholderBadge } from "./ImagePlaceholderBadge";

const EMPTY_BLOCKS: Block[] = [];

interface Slide {
  block: ImageBlock;
  index: number;
  total: number;
}

export function ImageLightbox() {
  const t = useTranslation();
  const activeTab = useStore(getActiveTab);
  const viewerBlockId = useStore((state) => state.imageViewerBlockId);
  const slides = useStore((state) => state.imageViewerSlides);
  const openImageViewer = useStore((state) => state.openImageViewer);
  const closeImageViewer = useStore((state) => state.closeImageViewer);

  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const images = useMemo(
    () => slides ?? blocks.filter(isFilledImage),
    [slides, blocks],
  );
  const currentIndex = images.findIndex((image) => image.id === viewerBlockId);
  const current = images[currentIndex];

  const [loadFailed, setLoadFailed] = useState(false);

  // A new source gets its own chance to load
  useEffect(() => setLoadFailed(false), [current?.src]);

  // The viewed block can vanish under the dialog
  useEffect(() => {
    if (viewerBlockId && !current) {
      closeImageViewer();
    }
  }, [viewerBlockId, current, closeImageViewer]);

  const step = useCallback(
    (delta: number) => {
      const next = images[currentIndex + delta];
      if (next) {
        openImageViewer(next.id, slides);
      }
    },
    [images, currentIndex, openImageViewer, slides],
  );

  useEffect(() => {
    if (!current) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === Key.ARROW_LEFT) {
        event.preventDefault();
        step(-1);
      } else if (event.key === Key.ARROW_RIGHT) {
        event.preventDefault();
        step(1);
      }
    };

    document.addEventListener(EventType.KEY_DOWN, onKey);
    return () => document.removeEventListener(EventType.KEY_DOWN, onKey);
  }, [current, step]);

  // Keep the last slide on screen while the dialog fades out
  const lastSlide = useRef<Slide | null>(null);
  if (current) {
    lastSlide.current = {
      block: current,
      index: currentIndex,
      total: images.length,
    };
  }

  const slide = lastSlide.current;
  if (!slide) {
    return null;
  }

  const { block, index, total } = slide;

  return (
    <Modal
      open={!!current}
      onClose={closeImageViewer}
      className={classNames("modal-lightbox", CssClass.NO_USER_SELECT)}
    >
      <div className="image-lightbox">
        {loadFailed ? (
          <div className="image-lightbox-broken">
            <ImagePlaceholderBadge />
            <p className="image-message">{t.image.loadFailed}</p>
          </div>
        ) : (
          <img
            className="image-lightbox-view"
            src={block.src}
            alt={block.alt ?? ""}
            draggable={false}
            onError={() => setLoadFailed(true)}
          />
        )}

        {total > 1 && (
          <>
            <button
              className={classNames(
                "image-lightbox-nav",
                CssClass.BTN,
                CssClass.BTN_ICON,
              )}
              {...tooltip(t.image.previous)}
              aria-label={t.image.previous}
              disabled={index === 0}
              onClick={() => step(-1)}
            >
              <ChevronLeft className="image-lightbox-nav-icon" />
            </button>

            <button
              className={classNames(
                "image-lightbox-nav is-next",
                CssClass.BTN,
                CssClass.BTN_ICON,
              )}
              {...tooltip(t.image.next)}
              aria-label={t.image.next}
              disabled={index === total - 1}
              onClick={() => step(1)}
            >
              <ChevronRight className="image-lightbox-nav-icon" />
            </button>

            <p className="image-lightbox-counter">
              {t.image.position(index + 1, total)}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
