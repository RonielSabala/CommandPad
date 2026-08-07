import { DocsSectionLevel, type DocsSectionId } from "@/common/constants/docs";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";
import "./DocsSection.css";

interface Props {
  id: DocsSectionId;
  level: DocsSectionLevel;
  number: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

export function DocsSection({
  id,
  level,
  number,
  title,
  collapsed,
  onToggle,
  children,
}: Props) {
  const heading = (
    <button
      className="docs-section-toggle no-user-select"
      aria-expanded={!collapsed}
      onClick={onToggle}
    >
      <SidebarSectionChevronIcon
        className={classNames(
          "docs-section-chevron icon-md icon-bold",
          collapsed && "is-collapsed",
        )}
      />
      <span className="docs-section-number">{number}</span>
      {title}
    </button>
  );

  return (
    <section
      id={id}
      className={classNames("docs-section", collapsed && "is-collapsed")}
    >
      {level === DocsSectionLevel.SECTION ? (
        <h2 className="docs-h2">{heading}</h2>
      ) : (
        <h3 className="docs-h3">{heading}</h3>
      )}

      {!collapsed && children}
    </section>
  );
}
