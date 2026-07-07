import "./SidebarSectionFooter.css";

interface Props {
  onClick: () => void;
  title: string;
  label: string;
  icon: React.ReactNode;
}

export function SidebarSectionFooter({ onClick, title, label, icon }: Props) {
  return (
    <div className="sidebar-section-footer">
      <button className="btn" onClick={onClick} title={title}>
        {icon}
        {label}
      </button>
    </div>
  );
}
