import { SearchIcon } from "@/components/icons";
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
      <SearchIcon className="sidebar-search-icon icon-md icon-bold" />
    </div>
  );
}
