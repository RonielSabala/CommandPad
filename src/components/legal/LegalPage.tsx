import { Prose, ProseList } from "@/components/docs/Prose";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { PageFooter } from "@/components/sidebar/Footer";
import { SiteHeader } from "@/components/site/SiteHeader";
import "@/components/site/SitePage.css";
import type { LegalPageMessages } from "@/i18n/types";
import { classNames } from "@/utils/string";
import { useState } from "react";
import "./LegalPage.css";

interface SectionProps {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

function LegalSection({ heading, paragraphs, bullets }: SectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="legal-section">
      <button
        className="legal-section-header"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <SidebarSectionChevronIcon
          className={classNames(
            "legal-section-chevron icon-md icon-bold",
            open && "is-open",
          )}
        />
        {heading}
      </button>
      {open && (
        <div className="legal-section-body">
          {paragraphs.map((paragraph, i) => (
            <Prose key={i} text={paragraph} />
          ))}
          {bullets && <ProseList items={bullets} />}
        </div>
      )}
    </div>
  );
}

export function LegalPage({ content }: { content: LegalPageMessages }) {
  return (
    <div className="grid-shell site-shell">
      <SiteHeader title={content.title} showDocsLink />
      <main className="site-main">
        <article className="legal-article">
          <h1 className="legal-title">{content.title}</h1>
          <p className="legal-updated no-user-select">{content.updated}</p>
          <Prose text={content.intro} />
          <div className="legal-sections">
            {content.sections.map((section) => (
              <LegalSection key={section.heading} {...section} />
            ))}
          </div>
          <PageFooter />
        </article>
      </main>
    </div>
  );
}
