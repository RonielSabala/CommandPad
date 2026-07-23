import { Collapsible } from "@/components/common/Collapsible";
import { Prose, ProseList } from "@/components/docs/Prose";
import { PageFooter } from "@/components/sidebar/Footer";
import { SiteHeader } from "@/components/site/SiteHeader";
import "@/components/site/SitePage.css";
import type { LegalPageMessages } from "@/i18n/types";
import "./LegalPage.css";

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
              <Collapsible key={section.heading} title={section.heading}>
                {section.paragraphs.map((paragraph, i) => (
                  <Prose key={i} text={paragraph} />
                ))}

                {section.bullets && <ProseList items={section.bullets} />}
              </Collapsible>
            ))}
          </div>

          <PageFooter />
        </article>
      </main>
    </div>
  );
}
