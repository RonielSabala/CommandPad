import type { SVGProps } from "react";
import "./SidebarSectionFooter.css";

interface FooterAction {
  onClick: () => void;
  title: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}

interface Props extends FooterAction {
  secondaryAction?: FooterAction;
}

function FooterButton({
  onClick,
  title,
  label,
  icon: IconComponent,
}: FooterAction) {
  return (
    <button className="btn" onClick={onClick} title={title}>
      <IconComponent className="icon-md icon-bold" />
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
