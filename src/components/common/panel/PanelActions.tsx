import { PanelId, PanelSide } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PanelCollapseIcon, PanelSideIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";

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

  return (
    <div className="panel-actions">
      <button
        className="btn btn-icon"
        onClick={() => togglePanel(panelId)}
        aria-label={collapsed ? t.panel.expand(name) : t.panel.collapse(name)}
        {...tooltip(collapsed ? t.panel.expand(name) : t.panel.collapse(name))}
      >
        <PanelCollapseIcon className="panel-collapse-chevron icon-md icon-bold" />
      </button>
      <button
        className="btn btn-icon"
        onClick={() => togglePanelSide(panelId)}
        aria-label={isRight ? t.panel.moveLeft(name) : t.panel.moveRight(name)}
        {...tooltip(isRight ? t.panel.moveLeft(name) : t.panel.moveRight(name))}
      >
        <PanelSideIcon className="icon-md icon-bold" mirrored={isRight} />
      </button>
    </div>
  );
}
