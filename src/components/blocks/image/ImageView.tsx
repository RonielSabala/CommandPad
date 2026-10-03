import { asButton } from "@/components/common/asButton";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";

import "./ImageView.css";

interface Props {
  src: string;
  alt?: string;
  onExpand?: () => void;
  onError?: () => void;
}

export function ImageView({ src, alt, onExpand, onError }: Props) {
  const t = useTranslation();

  return (
    <img
      className={classNames("image-view", onExpand && "is-clickable")}
      src={src}
      alt={alt ?? ""}
      draggable={false}
      {...tooltip(onExpand && t.image.viewFullscreen)}
      {...(onExpand ? asButton(onExpand) : {})}
      onError={onError}
    />
  );
}
