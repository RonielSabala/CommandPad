import { CssClass } from "@/common/constants/css";
import { EventType, Key } from "@/common/constants/events";
import { SidebarPosition } from "@/common/enums";
import { CheckIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./MinimapMenu.css";

interface Props {
  x: number;
  y: number;
  onClose: () => void;
}

export function MinimapMenu({ x, y, onClose }: Props) {
  const t = useTranslation();
  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const toggleMinimap = useStore((state) => state.toggleMinimap);
  const minimapOnLeft = useStore(
    (state) => state.minimapPosition === SidebarPosition.LEFT,
  );
  const toggleMinimapPosition = useStore(
    (state) => state.toggleMinimapPosition,
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Keep the menu fully on screen
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const host = menu?.offsetParent as HTMLElement | null;

    if (!menu || !host) {
      return;
    }

    const hostRect = host.getBoundingClientRect();
    const maxX = hostRect.width - menu.offsetWidth;
    const maxY = hostRect.height - menu.offsetHeight;

    setPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    });
  }, [x, y]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === Key.ESCAPE) {
        onClose();
      }
    };

    document.addEventListener(EventType.MOUSE_DOWN, onMouseDown);
    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    return () => {
      document.removeEventListener(EventType.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={classNames(CssClass.CONTEXT_MENU, "no-user-select")}
      ref={menuRef}
      style={{ left: position.x, top: position.y }}
    >
      <button
        className="context-menu-item"
        onClick={() => {
          toggleMinimap();
          onClose();
        }}
      >
        <span className="context-menu-check">
          {minimapEnabled && <CheckIcon className="icon-md icon-bold" />}
        </span>
        {t.contextMenu.minimap}
      </button>
      {minimapEnabled && (
        <button
          className="context-menu-item"
          onClick={() => {
            toggleMinimapPosition();
            onClose();
          }}
        >
          <span className="context-menu-check" />
          {minimapOnLeft
            ? t.contextMenu.moveMinimapRight
            : t.contextMenu.moveMinimapLeft}
        </button>
      )}
    </div>
  );
}
