import { PANEL_DEFINITIONS } from "@/common/config";
import { DataAttr } from "@/common/constants/dom";
import { PanelId } from "@/common/enums";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import type { CSSProperties, ReactNode } from "react";
import "./PanelShell.css";

interface Props {
  panelId: PanelId;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function PanelShell({ panelId, id, className, children }: Props) {
  const collapsed = useStore((state) => state.panels[panelId].collapsed);
  const side = useStore((state) => state.panels[panelId].side);
  const width = useStore((state) => state.panels[panelId].width);

  const maxWidth = `${PANEL_DEFINITIONS[panelId].maxScreenFraction * 100}vw`;

  return (
    <div
      id={id}
      className={classNames("grid-shell", "panel-shell", className)}
      {...{ [DataAttr.PANEL_SIDE]: side }}
      {...{ [DataAttr.PANEL_COLLAPSED]: collapsed }}
      style={
        {
          "--panel-width": `${width}px`,
          "--panel-max-width": maxWidth,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
