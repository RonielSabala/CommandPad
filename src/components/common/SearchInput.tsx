import { SearchIcon, XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import "./SearchInput.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, placeholder, onChange }: Props) {
  const t = useTranslation();
  return (
    <div className="search-input-wrapper">
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <SearchIcon className="search-input-icon icon-md icon-bold" />
      {value && (
        <button
          className="search-input-clear-btn"
          title={t.common.clearSearch}
          onClick={() => onChange("")}
        >
          <XIcon className="icon-sm icon-bold" />
        </button>
      )}
    </div>
  );
}
