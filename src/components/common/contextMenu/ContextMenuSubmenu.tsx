import { CssClass } from "@/common/constants/css";
import { classNames } from "@/utils/string";
import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SubmenuActivationContext } from "./contextMenuActivation";
import "./ContextMenuSubmenu.css";

interface ContextMenuSubmenuProps {
  children: ReactNode;
  label: ReactNode;
  icon?: ReactNode;
}

export function ContextMenuSubmenu({
  children,
  label,
  icon,
}: ContextMenuSubmenuProps) {
  const id = useId();
  const submenuActivation = useContext(SubmenuActivationContext);
  const isActive = submenuActivation ? submenuActivation.activeId === id : true;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = isActive && (hovered || pinned);
  const [flipped, setFlipped] = useState({ x: false, y: false });

  useEffect(() => {
    if (!isActive) {
      setHovered(false);
      setPinned(false);
    }
  }, [isActive]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!open || !wrapper || !panel) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();
    setFlipped({
      x: rect.right + panel.offsetWidth > window.innerWidth,
      y: rect.top + panel.offsetHeight > window.innerHeight,
    });
  }, [open]);

  return (
    <div
      className="context-menu-submenu"
      ref={wrapperRef}
      onMouseEnter={() => {
        setHovered(true);
        submenuActivation?.setActiveId(id);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className="context-menu-item"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          submenuActivation?.setActiveId(id);
          setPinned((value) => !value);
        }}
      >
        <span className="context-menu-icon">{icon}</span>
        {label}
      </button>

      {open && (
        <div
          className={classNames(
            CssClass.CONTEXT_MENU,
            "context-menu-submenu-panel",
            flipped.x && "is-flipped-x",
            flipped.y && "is-flipped-y",
          )}
          ref={panelRef}
          role="menu"
        >
          <SubmenuActivationContext.Provider value={null}>
            {children}
          </SubmenuActivationContext.Provider>
        </div>
      )}
    </div>
  );
}
