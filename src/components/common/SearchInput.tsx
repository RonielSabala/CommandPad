import { tooltip } from "@/components/common/tooltip/tooltip";
import { SearchIcon, XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";

import "./SearchInput.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  value,
  placeholder,
  onChange,
  className,
}: Props) {
  const t = useTranslation();
  return (
    <div className={classNames("search-input-wrapper", className)}>
      <input
        className="search-input no-ligatures"
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
          aria-label={t.common.clearSearch}
          {...tooltip(t.common.clearSearch)}
          onClick={() => onChange("")}
        >
          <XIcon className="icon-sm icon-bold" />
        </button>
      )}
    </div>
  );
}
