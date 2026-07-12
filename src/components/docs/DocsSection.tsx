import {
  DocsSectionLevel,
  type DocsSectionId,
} from "@/common/constants/docs";
import type { ReactNode } from "react";

interface Props {
  id: DocsSectionId;
  level: DocsSectionLevel;
  number: string;
  title: string;
  children?: ReactNode;
}

export function DocsSection({ id, level, number, title, children }: Props) {
  const heading = (
    <>
      <span className="docs-section-number">{number}</span>
      {title}
    </>
  );

  return (
    <section id={id} className="docs-section">
      {level === DocsSectionLevel.SECTION ? (
        <h2 className="docs-h2">{heading}</h2>
      ) : (
        <h3 className="docs-h3">{heading}</h3>
      )}
      {children}
    </section>
  );
}
