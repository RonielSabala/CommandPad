import { SearchIcon, XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import "./SidebarSearch.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, placeholder, onChange }: Props) {
  const t = useTranslation();
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
      {value && (
        <button
          className="sidebar-search-clear-btn"
          title={t.common.clearSearch}
          onClick={() => onChange("")}
        >
          <XIcon className="icon-sm icon-bold" />
        </button>
      )}
    </div>
  );
}
