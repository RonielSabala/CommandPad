import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** A collapsible sidebar section (header + chevron + body). */
export function SidebarSection({ id, title, collapsed, onToggle, children }: Props) {
  return (
    <div id={id} className={`sidebar-section${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-section-header no-user-select" onClick={onToggle}>
        <p className="section-title">{title}</p>
        <svg className="sidebar-section-chevron" viewBox="0 0 16 16">
          <polyline points="4,6 8,10 12,6" />
        </svg>
      </div>
      <div className="sidebar-section-body">{children}</div>
    </div>
  );
}

interface SearchProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, placeholder, onChange }: SearchProps) {
  return (
    <div className="sidebar-search-wrapper">
      <input
        className="sidebar-search-input"
        type="text"
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <svg className="sidebar-search-icon" viewBox="0 0 16 16">
        <circle cx="6.5" cy="6.5" r="4" />
        <line x1="10" y1="10" x2="14" y2="14" />
      </svg>
    </div>
  );
}
