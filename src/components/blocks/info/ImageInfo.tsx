import { InfoConfig } from "@/common/config";
import type { ImageBlock } from "@/common/types";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useTranslation } from "@/i18n";
import {
  dataUriByteLength,
  imageFormat,
  imageFormatOfMimeType,
  isAttachedImage,
  probeLinkedImage,
  type LinkedImageHead,
} from "@/utils/image";
import { greatestCommonDivisor } from "@/utils/number";
import { useEffect, useMemo, useState } from "react";

import type { BlockViewProps } from "../blockViews";
import { BlockInfoTable } from "./BlockInfoTable";

interface Dimensions {
  width: number;
  height: number;
}

function useImageMeasurements(src: string, attached: boolean) {
  const [head, setHead] = useState<LinkedImageHead | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    if (!src) {
      return;
    }

    let live = true;
    const image = new Image();
    image.onload = () => {
      if (live) {
        setDimensions({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      }
    };

    image.src = src;

    if (!attached) {
      void probeLinkedImage(src).then((next) => {
        if (live) {
          setHead(next);
        }
      });
    }

    return () => {
      live = false;
      image.onload = null;
    };
  }, [src, attached]);

  return { dimensions, head };
}

export function ImageInfo({ block }: BlockViewProps<ImageBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const { src } = block;

  const attached = isAttachedImage(src);
  const { dimensions, head } = useImageMeasurements(src, attached);

  const bytes = useMemo(
    () => (attached ? dataUriByteLength(src) : (head?.bytes ?? null)),
    [attached, src, head],
  );

  const ratio = useMemo(() => {
    if (!dimensions?.width || !dimensions.height) {
      return null;
    }

    const { width, height } = dimensions;
    const divisor = greatestCommonDivisor(width, height);
    const terms =
      height / divisor > InfoConfig.MAX_RATIO_TERM
        ? [format.decimal(width / height), 1]
        : [width / divisor, height / divisor];

    return terms.join(InfoConfig.RATIO_SEPARATOR);
  }, [dimensions, format]);

  const { rows, sections } = t.info;
  const filled = !!src;
  const mimeFormat = head?.mimeType
    ? imageFormatOfMimeType(head.mimeType)
    : null;

  return (
    <BlockInfoTable
      block={block}
      sections={[
        {
          title: sections.dimensions,
          rows: [
            {
              label: rows.resolution,
              value: dimensions
                ? [dimensions.width, dimensions.height]
                    .map(format.count)
                    .join(InfoConfig.DIMENSION_SEPARATOR)
                : null,
            },
            { label: rows.aspectRatio, value: ratio },
          ],
        },
        {
          title: sections.file,
          rows: [
            {
              label: rows.source,
              value: filled
                ? attached
                  ? t.info.attached
                  : t.info.linked
                : null,
            },
            {
              label: rows.format,
              value: filled ? (mimeFormat ?? imageFormat(src)) : null,
            },
            { label: rows.size, value: format.size(bytes) },
          ],
        },
        {
          title: sections.details,
          rows: [
            { label: rows.alt, value: block.alt?.trim() || null },
            ...(filled && !attached ? [{ label: rows.link, value: src }] : []),
          ],
        },
      ]}
    />
  );
}
