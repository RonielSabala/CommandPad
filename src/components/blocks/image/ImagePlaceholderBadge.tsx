import { CssClass } from "@/common/constants/css";
import { ImageIcon } from "@/components/icons";
import { classNames } from "@/utils/string";

export function ImagePlaceholderBadge() {
  return (
    <span className="image-placeholder-badge">
      <ImageIcon
        className={classNames(CssClass.ICON_LG, CssClass.ICON_SEMIBOLD)}
      />
    </span>
  );
}
