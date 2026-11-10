import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import type { ReactNode } from "react";

import "./SidebarSectionFooter.css";

interface FooterAction {
  onClick: () => void;
  title: string;
  label: string;
  icon: ReactNode;
}

interface Props extends FooterAction {
  secondaryAction?: FooterAction;
}

function FooterButton({ onClick, title, label, icon }: FooterAction) {
  return (
    <button className={CssClass.BTN} onClick={onClick} {...tooltip(title)}>
      {icon}
      {label}
    </button>
  );
}

export function SidebarSectionFooter({ secondaryAction, ...action }: Props) {
  return (
    <div className="sidebar-section-footer">
      <FooterButton {...action} />
      {secondaryAction && <FooterButton {...secondaryAction} />}
    </div>
  );
}
