import { classNames } from "@/utils/string";
import type { SVGProps } from "react";
import "./SidebarSectionFooter.css";

interface FooterAction {
  onClick: () => void;
  title: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  danger?: boolean;
}

interface Props extends FooterAction {
  secondaryAction?: FooterAction;
  tertiaryAction?: FooterAction;
}

function FooterButton({
  onClick,
  title,
  label,
  icon: IconComponent,
  danger,
}: FooterAction) {
  return (
    <button
      className={classNames("btn", danger && "btn-danger")}
      onClick={onClick}
      title={title}
    >
      <IconComponent className="icon-md icon-bold" />
      {label}
    </button>
  );
}

export function SidebarSectionFooter({
  secondaryAction,
  tertiaryAction,
  ...action
}: Props) {
  return (
    <div className="sidebar-section-footer">
      <FooterButton {...action} />
      {secondaryAction && <FooterButton {...secondaryAction} />}
      {tertiaryAction && <FooterButton {...tertiaryAction} />}
    </div>
  );
}
