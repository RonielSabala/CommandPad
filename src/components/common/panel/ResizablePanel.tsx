import { DataAttr } from "@/common/constants/dom";
import { PanelId } from "@/common/enums";
import { usePanelResize } from "@/hooks/usePanelResize";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useRef, type ReactNode } from "react";
import { PanelActions } from "./PanelActions";
import "./ResizablePanel.css";

interface Props {
  panelId: PanelId;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function ResizablePanel({ panelId, id, className, children }: Props) {
  const t = useTranslation();
  const side = useStore((state) => state.panels[panelId].side);
  const collapsed = useStore((state) => state.panels[panelId].collapsed);

  const panelRef = useRef<HTMLElement>(null);
  const { onPointerDown, onDoubleClick } = usePanelResize(panelId, panelRef);

  const name = t.panel.names[panelId];

  return (
    <aside
      ref={panelRef}
      id={id}
      className={classNames("resizable-panel", className)}
      {...{ [DataAttr.PANEL_SIDE]: side }}
      {...{ [DataAttr.PANEL_COLLAPSED]: collapsed }}
    >
      <div className="panel-content">{children}</div>

      <div
        className="panel-resize-handle no-user-select"
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
        title={
          collapsed ? t.panel.doubleClickExpand : t.panel.dragResizeCollapse
        }
      >
        <PanelActions panelId={panelId} name={name} />
      </div>
    </aside>
  );
}
