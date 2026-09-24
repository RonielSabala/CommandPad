import { CssClass } from "@/common/constants/css";
import { DragIcon } from "@/components/icons";
import type { RowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";

import { tooltip } from "./tooltip/tooltip";

interface Props {
  handleProps: RowReorder["handleProps"];
}

export function DragHandle({ handleProps }: Props) {
  const t = useTranslation();

  return (
    <div
      className={CssClass.DRAG_HANDLE}
      {...tooltip(t.common.dragToReorder)}
      {...handleProps}
    >
      <DragIcon className="icon-md" />
    </div>
  );
}
