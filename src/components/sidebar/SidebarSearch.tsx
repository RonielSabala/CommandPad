import "./SidebarSearch.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, placeholder, onChange }: Props) {
  return (
    <div className="sidebar-search-wrapper">
      <input
        className="sidebar-search-input"
        type="text"
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <svg className="sidebar-search-icon" viewBox="0 0 16 16">
        <circle cx="6.5" cy="6.5" r="4" />
        <line x1="10" y1="10" x2="14" y2="14" />
      </svg>
    </div>
  );
}
