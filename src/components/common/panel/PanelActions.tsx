import { CssClass } from "@/common/constants/css";
import { PanelId, PanelSide } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PanelCollapseIcon, PanelSideIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";

import "./PanelActions.css";

interface Props {
  panelId: PanelId;
  name: string;
}

export function PanelActions({ panelId, name }: Props) {
  const t = useTranslation();
  const side = useStore((state) => state.panels[panelId].side);
  const collapsed = useStore((state) => state.panels[panelId].collapsed);
  const togglePanel = useStore((state) => state.togglePanel);
  const togglePanelSide = useStore((state) => state.togglePanelSide);

  const isRight = side === PanelSide.RIGHT;
  const toggleLabel = collapsed ? t.panel.expand(name) : t.panel.collapse(name);
  const toggleSideLabel = isRight
    ? t.panel.moveLeft(name)
    : t.panel.moveRight(name);

  return (
    <div className="panel-actions">
      <button
        className={classNames(CssClass.BTN, CssClass.BTN_ICON)}
        onClick={() => togglePanel(panelId)}
        aria-label={toggleLabel}
        {...tooltip(toggleLabel)}
      >
        <PanelCollapseIcon
          className={classNames(
            "panel-collapse-chevron",
            CssClass.ICON_MD,
            CssClass.ICON_BOLD,
          )}
        />
      </button>
      <button
        className={classNames(CssClass.BTN, CssClass.BTN_ICON)}
        onClick={() => togglePanelSide(panelId)}
        aria-label={toggleSideLabel}
        {...tooltip(toggleSideLabel)}
      >
        <PanelSideIcon
          className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          mirrored={isRight}
        />
      </button>
    </div>
  );
}
