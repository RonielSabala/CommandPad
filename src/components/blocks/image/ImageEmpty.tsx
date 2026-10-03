import { useTranslation } from "@/i18n";

import "./ImageBlock.css";
import { ImagePlaceholderBadge } from "./ImagePlaceholderBadge";

export function ImageEmpty() {
  const t = useTranslation();

  return (
    <div className="image-empty">
      <ImagePlaceholderBadge />
      <p className="image-message">{t.image.emptyReadOnly}</p>
    </div>
  );
}
